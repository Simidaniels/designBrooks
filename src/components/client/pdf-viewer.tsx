"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Lock,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   In-browser PDF page viewer (pdf.js).
   Used for both the original (full access) and the
   watermarked preview (restricted) — the file it
   receives is already the authorized view.
   ───────────────────────────────────────────────── */
export function PdfViewer({
  url,
  fileName,
}: {
  url: string;
  fileName: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const pdfRef = React.useRef<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => object; render: (o: unknown) => { promise: Promise<void> } }> } | null>(null);
  const [page, setPage] = React.useState(1);
  const [numPages, setNumPages] = React.useState(0);
  const [zoom, setZoom] = React.useState(1.05);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [renderKey, setRenderKey] = React.useState(0);

  // Load the document once
  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setPage(1);
    setNumPages(0);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const task = pdfjs.getDocument({ url });
        const doc = await task.promise;
        if (cancelled) return;
        pdfRef.current = doc as never;
        setNumPages(doc.numPages);
        setStatus("ready");
      } catch (err) {
        console.error("[pdf] load failed:", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  // Render the current page whenever page/zoom/doc changes
  React.useEffect(() => {
    if (status !== "ready" || !pdfRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    (async () => {
      try {
        const pdfPage = await pdfRef.current!.getPage(page);
        if (cancelled) return;
        const viewport = pdfPage.getViewport({ scale: zoom * 1.5 }) as { width: number; height: number };
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error("[pdf] render failed:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, [page, zoom, status, renderKey]);

  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <FileText className="h-10 w-10 text-ivory-100/40" aria-hidden="true" />
        <p className="text-[0.85rem] font-semibold text-ivory-100/75">This file could not be rendered in the browser.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[0.78rem] font-bold text-gold underline underline-offset-4">
          Open in a new tab instead
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-ink-900 px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-[0.72rem] font-bold tabular-nums text-ivory-100/80">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))} aria-label="Zoom in" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50">
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom(1.05)} aria-label="Reset zoom" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[0.72rem] font-bold tabular-nums text-ivory-100/80">{page} / {numPages || "…"}</span>
          <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} aria-label="Next page" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#2a2620] p-4 thin-scroll">
        {status === "loading" ? (
          <div className="flex h-full items-center justify-center gap-3 text-ivory-100/60">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span className="text-[0.8rem] font-semibold">Loading drawing…</span>
          </div>
        ) : (
          <canvas ref={canvasRef} aria-label={`${fileName} — page ${page}`} className="max-w-none rounded-md shadow-[0_18px_50px_rgba(0,0,0,0.45)]" />
        )}
      </div>
    </div>
  );
}
