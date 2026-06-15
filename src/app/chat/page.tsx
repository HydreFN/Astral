"use client";

import { useRouter } from "next/navigation";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";

export default function NewChatPage() {
  const router = useRouter();

  async function handleSend(content: string) {
    // Create a conversation then send the message
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: content.slice(0, 60) }),
    });
    if (!res.ok) return;
    const conv = await res.json();

    await fetch(`/api/conversations/${conv.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content }),
    });

    router.push(`/chat/${conv.id}`);
  }

  return (
    <>
      <ChatArea messages={[]} />
      <ChatInput onSend={handleSend} />
    </>
  );
}
