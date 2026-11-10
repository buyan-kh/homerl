"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button-clean";
import { TextField } from "@/components/ui/text-field-clean";
import { ThinkingLoader } from "@/components/ui/thinking-loader-clean";
import { CURSOR_CHAT_AGENT_KEY } from "@/lib/cursor-chat-constants";

type ChatMessage = { role: "user" | "assistant"; text: string };

function loadAgentId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURSOR_CHAT_AGENT_KEY);
}

function saveAgentId(id: string) {
  localStorage.setItem(CURSOR_CHAT_AGENT_KEY, id);
}

export function ModelChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask about the current card, concepts, or how to study. Replies use your local Cursor agent (Cursor CLI / SDK).",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const agentIdRef = useRef<string | null>(null);

  useEffect(() => {
    agentIdRef.current = loadAgentId();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text }]);

    const drillContext = sessionStorage.getItem("homerl-chat-context") ?? undefined;

    try {
      const res = await fetch("/api/cursor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          agentId: agentIdRef.current ?? undefined,
          drillContext,
        }),
      });
      const data = (await res.json()) as { text?: string; agentId?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Chat request failed.");
      }

      if (data.agentId) {
        agentIdRef.current = data.agentId;
        saveAgentId(data.agentId);
      }

      setMessages((m) => [...m, { role: "assistant", text: data.text ?? "" }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", text: msg }]);
    } finally {
      setBusy(false);
    }
  }, [busy, input]);

  function newConversation() {
    agentIdRef.current = null;
    localStorage.removeItem(CURSOR_CHAT_AGENT_KEY);
    setMessages([
      {
        role: "assistant",
        text: "Started a new Cursor conversation.",
      },
    ]);
    setError(null);
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open ? (
        <div className="pointer-events-auto flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <header className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium">Cursor chat</p>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={newConversation}>
                New
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </header>
          <div ref={listRef} className="flex max-h-64 flex-col gap-2 overflow-y-auto px-3 py-2 text-left text-sm">
            {messages.map((msg, i) => (
              <p
                key={`${i}-${msg.role}`}
                className={
                  msg.role === "user"
                    ? "rounded-md bg-muted px-2 py-1.5 text-foreground"
                    : "whitespace-pre-wrap text-muted-foreground"
                }
              >
                {msg.text}
              </p>
            ))}
            {busy ? (
              <ThinkingLoader
                variant="plain"
                size="sm"
                phases={["Thinking", "Running Cursor agent", "Writing response"]}
                interval={2400}
              />
            ) : null}
          </div>
          {error ? <p className="px-3 pb-1 text-xs text-red-600">{error}</p> : null}
          <form
            className="flex gap-2 border-t border-border p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <TextField
              size="sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message…"
              disabled={busy}
              className="min-w-0 flex-1"
              inputClassName="text-sm"
              aria-label="Message"
            />
            <Button type="submit" size="sm" disabled={busy || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="pointer-events-auto shadow-md"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide chat" : "Cursor chat"}
      </Button>
    </div>
  );
}
