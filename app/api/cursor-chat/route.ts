import { Agent } from "@cursor/sdk";
import { buildDrillChatPrompt, getLocalAgentCwd } from "@/lib/cursor-chat-server";

export const maxDuration = 300;

type ChatBody = {
  message?: string;
  agentId?: string;
  drillContext?: string;
};

async function collectAssistantText(run: Awaited<ReturnType<Awaited<ReturnType<typeof Agent.create>>["send"]>>) {
  let text = "";
  for await (const event of run.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") text += block.text;
      }
    }
  }
  const result = await run.wait();
  if (!text && typeof result.result === "string") text = result.result;
  return { text: text.trim(), status: result.status };
}

export async function POST(request: Request) {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const apiKey = process.env.CURSOR_API_KEY;
  const cwd = getLocalAgentCwd();
  const prompt = buildDrillChatPrompt(message, body.drillContext?.trim());

  const baseOptions = {
    ...(apiKey ? { apiKey } : {}),
    model: { id: process.env.CURSOR_CHAT_MODEL ?? "composer-2.5" },
    local: { cwd, settingSources: [] },
  };

  try {
    const agent = body.agentId
      ? await Agent.resume(body.agentId, baseOptions)
      : await Agent.create(baseOptions);

    try {
      const run = await agent.send(prompt);
      const { text, status } = await collectAssistantText(run);

      if (status === "error") {
        return Response.json(
          { error: text || "Cursor agent run failed.", agentId: agent.agentId },
          { status: 502 },
        );
      }

      return Response.json({
        agentId: agent.agentId,
        text: text || "(No text in response.)",
      });
    } finally {
      await agent[Symbol.asyncDispose]();
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Cursor agent unavailable.";
    const needsAuth =
      /api.?key|auth|logged.?out|credential/i.test(detail) || detail.includes("401");

    return Response.json(
      {
        error: needsAuth
          ? "Cursor CLI auth missing. Run `npx cursor-sdk login` or set CURSOR_API_KEY in .env.local."
          : detail,
      },
      { status: needsAuth ? 503 : 500 },
    );
  }
}
