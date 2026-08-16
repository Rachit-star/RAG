"use client";

import { IconSparkle } from "@/components/Icons";
import { DotmTriangle } from "@/components/DotmTriangle";

export default function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="message-header">
        <IconSparkle size={14} />
        Analyzing...
      </div>
      <div style={{ marginTop: "12px", marginLeft: "2px" }}>
        <DotmTriangle size={24} dotSize={3} color="var(--text-muted)" speed={1.2} bloom={false} />
      </div>
    </div>
  );
}
