"use client";

import { IconBrain, IconDocument, IconUpload, IconZap } from "@/components/Icons";

interface Paper {
  name: string;
  size?: string;
}

interface SidebarProps {
  papers: Paper[];
  onUploadClick: () => void;
}

export default function Sidebar({ papers, onUploadClick }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <IconBrain size={16} />
        </div>
        <span className="sidebar-brand">Paper Analyst</span>
      </div>

      {/* Documents section */}
      <div className="sidebar-section">
        <span className="sidebar-label">Documents</span>

        <button className="upload-button" onClick={onUploadClick}>
          <IconUpload size={14} />
          Upload Document
        </button>

        <div className="paper-list">
          {papers.length === 0 ? (
            <div style={{ padding: "8px", fontSize: "12px", color: "var(--text-subtle)" }}>
              No papers uploaded yet
            </div>
          ) : (
            papers.map((paper, i) => (
              <div key={i} className="paper-item">
                <IconDocument size={14} />
                <span className="paper-item-name">{paper.name}</span>
                {paper.size && <span className="paper-item-size">{paper.size}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <IconZap size={12} />
        <span className="sidebar-footer-text">
          <span>Llama 3.1</span> via NVIDIA
        </span>
      </div>
    </aside>
  );
}
