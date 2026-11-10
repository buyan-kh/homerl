import path from "node:path";

const projectRoot = path.resolve(process.cwd());

export function buildDrillChatPrompt(userMessage: string, drillContext?: string) {
  const preamble = [
    "You are a concise study tutor for the homeRL CS 166 drill app.",
    "Answer in plain language. Do not edit files unless the user asks.",
    drillContext ? `Current drill context:\n${drillContext}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${preamble}\n\nUser: ${userMessage}`;
}

export function getLocalAgentCwd() {
  return projectRoot;
}
