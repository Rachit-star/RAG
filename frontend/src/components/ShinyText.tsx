"use client";

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

export default function ShinyText({
  text,
  className = "",
  speed = 3,
  as: Tag = "span",
}: ShinyTextProps) {
  return (
    <Tag
      className={`shiny-text ${className}`}
      style={{
        ["--shiny-speed" as string]: `${speed}s`,
      }}
    >
      {text}
    </Tag>
  );
}
