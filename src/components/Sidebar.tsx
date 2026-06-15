"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface User {
  username: string;
  email: string;
}

interface SidebarProps {
  user: User;
}

function groupByDate(convs: Conversation[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today);
  week.setDate(week.getDate() - 7);

  const groups: Record<string, Conversation[]> = {
    "Aujourd'hui": [],
    "Hier": [],
    "7 derniers jours": [],
    "Plus ancien": [],
  };

  for (const c of convs) {
    const d = new Date(c.updatedAt);
    d.setHours(0, 0, 0, 0);
    if (d >= today) groups["Aujourd'hui"].push(c);
    else if (d >= yesterday) groups["Hier"].push(c);
    else if (d >= week) groups["7 derniers jours"].push(c);
    else groups["Plus ancien"].push(c);
  }

  return groups;
}

export default function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) setConversations(await res.json());
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, pathname]);

  async function newChat() {
    const res = await fetch("/api/conversations", { method: "POST" });
    if (res.ok) {
      const conv = await res.json();
      router.push(`/chat/${conv.id}`);
    }
  }

  async function deleteConversation(id: string) {
    setDeletingId(id);
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
    if (pathname === `/chat/${id}`) router.push("/chat");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const groups = groupByDate(conversations);
  const currentId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  return (
    <aside className="flex flex-col w-64 flex-shrink-0 bg-[#171717] h-screen">
      {/* Logo + New Chat */}
      <div className="p-3 flex gap-2">
        <Link
          href="/chat"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#2f2f2f] flex-1 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Astral</span>
        </Link>
        <button
          onClick={newChat}
          className="p-2 rounded-lg hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors"
          title="Nouveau chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {/* Conversations list */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {conversations.length === 0 ? (
          <p className="text-gray-600 text-xs text-center mt-8 px-4">
            Aucune conversation.<br/>Commencez par créer un nouveau chat.
          </p>
        ) : (
          Object.entries(groups).map(([label, items]) =>
            items.length === 0 ? null : (
              <div key={label} className="mb-4">
                <p className="text-gray-500 text-xs font-medium px-3 mb-1">{label}</p>
                <ul className="space-y-0.5">
                  {items.map((conv) => (
                    <li key={conv.id} className="group relative">
                      <Link
                        href={`/chat/${conv.id}`}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors truncate pr-8",
                          currentId === conv.id
                            ? "bg-[#2f2f2f] text-white"
                            : "text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                        )}
                      >
                        <span className="truncate">{conv.title}</span>
                      </Link>
                      <button
                        onClick={() => deleteConversation(conv.id)}
                        disabled={deletingId === conv.id}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 transition-all"
                        title="Supprimer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )
        )}
      </nav>

      {/* User menu */}
      <div className="p-2 border-t border-[#2a2a2a]">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2f2f2f] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.username}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 flex-shrink-0">
              <path d="M6 9l6-6 6 6M6 15l6 6 6-6"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#2f2f2f] border border-[#3d3d3d] rounded-xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-[#3d3d3d]">
                <p className="text-white text-sm font-medium">{user.username}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#3d3d3d] hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
