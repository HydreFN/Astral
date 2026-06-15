"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-[#2f2f2f] border border-[#3d3d3d] rounded-2xl shadow-lg focus-within:border-[#555] transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Envoyer un message..."
            rows={1}
            className="w-full bg-transparent text-white placeholder-gray-500 px-4 pt-3.5 pb-10 text-sm focus:outline-none disabled:opacity-50 min-h-[52px] max-h-[200px] overflow-y-auto"
            style={{ resize: "none" }}
          />
          <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
            <span className="text-gray-600 text-xs hidden sm:block">
              Shift+Entrée pour nouvelle ligne
            </span>
            <button
              onClick={submit}
              disabled={!value.trim() || disabled}
              className="w-8 h-8 rounded-lg bg-[#10a37f] hover:bg-[#0d8f6f] disabled:bg-[#3d3d3d] disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Astral peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
}
