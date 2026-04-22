"use client";

import { useEffect, useMemo, useState } from "react";

type HostedFile = {
  name: string;
  size: number;
  updatedAt: string;
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManageFilesPage() {
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [status, setStatus] = useState("Loading...");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadFiles() {
    const res = await fetch("/api/admin/files", { cache: "no-store" });
    if (!res.ok) {
      setStatus("Could not load files.");
      return;
    }

    const data = (await res.json()) as { files: HostedFile[] };
    setFiles(data.files);
    setStatus("");
  }

  useEffect(() => {
    void loadFiles();
  }, []);

  const linkPreview = useMemo(() => {
    const normalized = (name || file?.name || "").trim();
    if (!normalized) return "";
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/file/${encodeURIComponent(normalized.toLowerCase().replace(/\s+/g, "-"))}`;
  }, [file?.name, name]);

  async function onUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setStatus("Pick a file first.");
      return;
    }

    setBusy(true);
    setStatus("Uploading...");

    try {
      const form = new FormData();
      form.set("file", file);
      if (name.trim()) {
        form.set("name", name.trim());
      }

      const res = await fetch("/api/admin/files", { method: "POST", body: form });
      const data = (await res.json()) as { error?: string; url?: string };

      if (!res.ok) {
        setStatus(data.error || "Upload failed.");
        return;
      }

      setName("");
      setFile(null);
      setStatus(`Uploaded: ${data.url}`);
      await loadFiles();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(fileName: string) {
    setBusy(true);
    setStatus(`Deleting ${fileName}...`);
    try {
      const res = await fetch(`/api/admin/files?name=${encodeURIComponent(fileName)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setStatus(data.error || "Delete failed.");
        return;
      }

      setStatus(`Deleted: ${fileName}`);
      await loadFiles();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="bg-surface-container border border-outline-variant/30 p-5">
        <h2 className="font-headline uppercase tracking-widest mb-2">File Hosting</h2>
        <p className="text-sm text-on-surface-variant mb-4">Upload files (pdf, gif, videos, etc) and share via <code>/file/name.ext</code>. Default max is 1GB.</p>
        <form onSubmit={onUpload} className="space-y-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
            disabled={busy}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional custom file name (e.g. cv.pdf)"
            className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 uppercase tracking-widest text-xs border border-[var(--accent,#39ff88)] bg-surface-container-high hover:bg-surface-container-highest transition-colors disabled:opacity-60"
          >
            Upload
          </button>
        </form>
        {linkPreview ? <p className="text-xs text-on-surface-variant mt-3">Link preview: {linkPreview}</p> : null}
        {status ? <p className="text-xs text-on-surface-variant mt-2">{status}</p> : null}
      </div>

      <div className="bg-surface-container border border-outline-variant/30 p-5">
        <h3 className="font-headline uppercase tracking-widest mb-3">Files</h3>
        {files.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No files yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((item) => (
              <li key={item.name} className="flex flex-wrap items-center gap-3 justify-between border border-outline-variant/30 p-3">
                <div className="text-sm">
                  <a href={`/file/${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer" className="underline break-all">
                    /file/{item.name}
                  </a>
                  <div className="text-xs text-on-surface-variant">
                    {humanSize(item.size)} • {new Date(item.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => void onDelete(item.name)}
                  disabled={busy}
                  className="text-xs uppercase tracking-widest border border-outline-variant/50 px-3 py-2 hover:border-red-400 disabled:opacity-60"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
