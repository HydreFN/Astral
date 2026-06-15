"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (res.status === 404) { router.push("/chat"); return; }
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  async function handleSend(content: string) {
    setSending(true);

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content }),
      });

      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? saved : m)));
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatArea messages={messages} isTyping={sending} />
      <ChatInput onSend={handleSend} disabled={sending} />
    </>
  );
}
