"use client";

import { useRef } from "react";
import { IconBrain, IconDocument, IconUpload, IconZap } from "@/components/Icons";

export interface Paper {
  name: string;
  size?: string;
}

interface SidebarProps {
  papers: Paper[];
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
}

export default function Sidebar({ papers, onFileUpload, isUploading = false }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

        <input
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <button 
          className="upload-button" 
          onClick={handleUploadClick}
          disabled={isUploading}
          style={{ opacity: isUploading ? 0.5 : 1, cursor: isUploading ? "not-allowed" : "pointer" }}
        >
          <IconUpload size={14} />
          {isUploading ? "Uploading..." : "Upload Document"}
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
