import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { scanForEnglishLeaks, type LeakReport } from "@/lib/kannadaLeakScanner";

/**
 * Preview-only automated validator.
 *
 * On Lovable preview hosts (or when ?kn-validate=1 is present), this
 * component:
 *   1. Force-switches the UI to Kannada mode.
 *   2. Re-runs the leak scanner after the page settles.
 *   3. Renders a top banner that PASSES if no metadata-field leaks are
 *      detected, and FAILS loudly (red banner + console.error +
 *      window event "kn-validation-failed") if any English tokens remain
 *      inside scheme metadata fields.
 *
 * The validator only fails on metadata-field leaks (data-meta-field) so
 * it doesn't false-flag transient loading copy elsewhere in the app.
 */

const isPreviewHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.includes("lovable.dev") ||
    new URLSearchParams(window.location.search).get("kn-validate") === "1"
  );
};

type Status = "idle" | "running" | "pass" | "fail";

const KannadaPreviewAutoValidator = () => {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const [status, setStatus] = useState<Status>("idle");
  const [report, setReport] = useState<LeakReport | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Force Kannada in preview environments.
  useEffect(() => {
    if (!isPreviewHost()) return;
    if (language !== "kn") setLanguage("kn");
  }, [language, setLanguage]);

  // Re-run scan after route settles.
  useEffect(() => {
    if (!isPreviewHost()) return;
    if (language !== "kn") return;

    setStatus("running");
    const handles: number[] = [];
    const run = (final: boolean) => {
      const r = scanForEnglishLeaks();
      setReport(r);
      if (final) {
        if (r.metadataTotal > 0) {
          setStatus("fail");
          // eslint-disable-next-line no-console
          console.error(
            `[kn-preview-validator] ❌ ${r.metadataTotal} English token(s) remain in scheme metadata fields.`,
            r,
          );
          window.dispatchEvent(new CustomEvent("kn-validation-failed", { detail: r }));
        } else {
          setStatus("pass");
          // eslint-disable-next-line no-console
          console.info("[kn-preview-validator] ✅ Metadata fields are 100% Kannada.");
          window.dispatchEvent(new CustomEvent("kn-validation-passed", { detail: r }));
        }
      }
    };
    handles.push(window.setTimeout(() => run(false), 800));
    handles.push(window.setTimeout(() => run(true), 3000));
    return () => handles.forEach((h) => window.clearTimeout(h));
  }, [language, location.pathname, location.search]);

  if (!isPreviewHost()) return null;
  if (dismissed) return null;
  if (status === "idle" || status === "running") {
    return (
      <div
        data-allow-english
        className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black text-xs font-mono px-3 py-1.5 flex items-center justify-between shadow"
      >
        <span>⏳ KN preview validator: scanning metadata…</span>
        <button onClick={() => setDismissed(true)} className="px-2 py-0.5 rounded hover:bg-black/10">
          ✕
        </button>
      </div>
    );
  }

  const isPass = status === "pass";
  return (
    <div
      data-allow-english
      role={isPass ? "status" : "alert"}
      className={`fixed top-0 left-0 right-0 z-[10000] text-xs font-mono px-3 py-1.5 flex items-center justify-between shadow ${
        isPass ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <span className="font-semibold">
        {isPass
          ? "✅ KN preview validator: PASS — no English tokens in scheme metadata."
          : `❌ KN preview validator: FAIL — ${report?.metadataTotal ?? 0} English token(s) leaking in scheme metadata (total leaks: ${report?.total ?? 0}).`}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="px-2 py-0.5 rounded hover:bg-black/20"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default KannadaPreviewAutoValidator;
