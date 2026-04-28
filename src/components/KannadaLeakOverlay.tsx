import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { scanForEnglishLeaks, type LeakReport } from "@/lib/kannadaLeakScanner";

/**
 * Dev-only floating overlay that surfaces the Kannada-leak scan results
 * directly on screen. Only mounts in DEV builds and only when language === "kn".
 */
const KannadaLeakOverlay = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [report, setReport] = useState<LeakReport>({ total: 0, metadataTotal: 0, byComponent: {} });
  const [open, setOpen] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (language !== "kn") return;

    const handles: number[] = [];
    const run = () => setReport(scanForEnglishLeaks());
    handles.push(window.setTimeout(run, 600));
    handles.push(window.setTimeout(run, 2500));
    return () => handles.forEach((h) => window.clearTimeout(h));
  }, [language, location.pathname, location.search]);

  if (!import.meta.env.DEV) return null;
  if (language !== "kn") return null;
  if (hidden) return null;

  const entries = Object.entries(report.byComponent);
  const ok = report.total === 0;

  return (
    <div
      data-allow-english
      className="fixed bottom-3 right-3 z-[9999] w-[360px] max-w-[calc(100vw-1.5rem)] rounded-lg border border-border bg-card text-card-foreground shadow-2xl text-xs font-mono"
      style={{ maxHeight: "60vh" }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-orange-500"}`}
          />
          <span className="font-semibold">
            KN leaks: {report.total} {ok ? "(clean)" : ""}
          </span>
        </button>
        <button
          onClick={() => setReport(scanForEnglishLeaks())}
          className="px-2 py-0.5 rounded border border-border hover:bg-muted"
          title="Re-scan"
        >
          ↻
        </button>
        <button
          onClick={() => setHidden(true)}
          className="px-2 py-0.5 rounded border border-border hover:bg-muted"
          title="Hide"
        >
          ✕
        </button>
      </div>
      {open && (
        <div className="overflow-auto p-2 space-y-2" style={{ maxHeight: "calc(60vh - 40px)" }}>
          {ok && (
            <div className="text-muted-foreground px-1 py-2">
              No English tokens detected on this view.
            </div>
          )}
          {entries.map(([component, items]) => (
            <details key={component} className="rounded border border-border bg-background/40">
              <summary className="cursor-pointer px-2 py-1.5 font-semibold truncate">
                {component} <span className="text-muted-foreground">({items.length})</span>
              </summary>
              <ul className="px-2 py-1 space-y-1.5 border-t border-border">
                {items.slice(0, 25).map((it, i) => (
                  <li key={i} className="space-y-0.5">
                    <div className="text-muted-foreground truncate">
                      {it.route} · {it.selector}
                    </div>
                    <div className="text-foreground break-words">{it.text}</div>
                  </li>
                ))}
                {items.length > 25 && (
                  <li className="text-muted-foreground">+ {items.length - 25} more…</li>
                )}
              </ul>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default KannadaLeakOverlay;
