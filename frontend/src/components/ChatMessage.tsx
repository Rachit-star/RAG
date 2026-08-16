"use client";

import React from "react";
import { IconUser, IconSparkle, IconDocument } from "@/components/Icons";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
}

function formatAIContent(raw: string): React.ReactNode {
  // Split into blocks by double newline
  const blocks = raw.split(/\n\n+/);

  return blocks.map((block, blockIdx) => {
    // Check for code blocks
    const codeMatch = block.match(/^```(\w*)\n?([\s\S]*?)```$/);
    if (codeMatch) {
      return (
        <pre key={blockIdx}>
          <code>{codeMatch[2].trim()}</code>
        </pre>
      );
    }

    // Check for unordered list
    const lines = block.split("\n");
    const isList = lines.every(
      (l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || l.trim() === ""
    );
    if (isList && lines.some((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "))) {
      return (
        <ul key={blockIdx}>
          {lines
            .filter((l) => l.trim())
            .map((l, i) => (
              <li key={i}>{formatInline(l.replace(/^[\s]*[-*]\s/, ""))}</li>
            ))}
        </ul>
      );
    }

    // Check for numbered list
    const isNumberedList = lines.every(
      (l) => /^\s*\d+[.)]\s/.test(l) || l.trim() === ""
    );
    if (isNumberedList && lines.some((l) => /^\s*\d+[.)]\s/.test(l))) {
      return (
        <ol key={blockIdx}>
          {lines
            .filter((l) => l.trim())
            .map((l, i) => (
              <li key={i}>{formatInline(l.replace(/^\s*\d+[.)]\s/, ""))}</li>
            ))}
        </ol>
      );
    }

    // Regular paragraph
    return <p key={blockIdx}>{formatInline(block)}</p>;
  });
}

function formatInline(text: string): React.ReactNode {
  // Handle bold (**text**), inline code (`code`), and line breaks
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // Inline code
      parts.push(<code key={match.index}>{match[3]}</code>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message message--${message.role}`}>
      {isUser && (
        <div className="message-header">
          <IconUser size={14} />
          You
        </div>
      )}
      {!isUser && (
        <div className="message-header">
          <IconSparkle size={14} />
          Analysis
        </div>
      )}
      
      <div className="message-content">
        {isUser ? message.content : formatAIContent(message.content)}
      </div>

      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="sources">
          <span className="sources-label">Sources</span>
          {message.sources.map((src, i) => (
            <span key={i} className="source-pill">
              <IconDocument size={12} />
              {src}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
