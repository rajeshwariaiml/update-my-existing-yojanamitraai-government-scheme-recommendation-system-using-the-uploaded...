import { Component, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { scanForEnglishLeaks, type LeakReport } from "@/lib/kannadaLeakScanner";

/**
 * Preview-only BLOCKING gate.
 *
 * When mounted on a Lovable preview host (or with ?kn-block=1) AND the UI
 * is in Kannada mode, this component re-runs the leak scanner after the
 * page settles. If ANY English token is detected inside a [data-meta-field]
 * element, it throws a synchronous render error which is caught by the
 * inner ErrorBoundary and shown as a full-screen blocking failure page —
 * the children (the rest of the app) are unmounted until the leaks are
 * fixed.
 *
 * In production builds and non-preview hosts this is a transparent
 * pass-through.
 */

const isPreviewHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  if (params.get("kn-block") === "0") return false;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.includes("lovable.dev") ||
    params.get("kn-block") === "1"
  );
};

class KnLeakError extends Error {
  report: LeakReport;
  constructor(report: LeakReport) {
    super(
      `Kannada validation failed: ${report.metadataTotal} English token(s) leaking in scheme metadata fields.`,
    );
    this.name = "KnLeakError";
    this.report = report;
  }
}

interface BoundaryState {
  error: KnLeakError | null;
}

class BlockingBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    if (error instanceof KnLeakError) return { error };
    // Re-throw non-KN errors by returning no state change so React handles them.
    throw error;
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const entries = Object.entries(error.report.byComponent).filter(([, items]) =>
      items.some((it) => it.isMetadata),
    );

    return (
      <div
        data-allow-english
        role="alert"
        className="fixed inset-0 z-[100000] overflow-auto bg-red-950 text-red-50 p-6 font-mono text-sm"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">❌ Kannada validation FAILED</h1>
          <p className="text-red-200">
            Rendering has been blocked because {error.report.metadataTotal} English token(s) were
            detected inside <code className="px-1 bg-red-900 rounded">[data-meta-field]</code>{" "}
            scheme metadata elements while the UI was in Kannada mode.
          </p>
          <div className="space-y-3">
            {entries.map(([component, items]) => (
              <details
                key={component}
                open
                className="rounded border border-red-700 bg-red-900/40 p-2"
              >
                <summary className="cursor-pointer font-semibold">
                  {component} ({items.filter((i) => i.isMetadata).length})
                </summary>
                <ul className="pt-2 space-y-1.5">
                  {items
                    .filter((i) => i.isMetadata)
                    .map((it, i) => (
                      <li key={i} className="space-y-0.5">
                        <div className="text-red-300 truncate">
                          {it.route} · {it.selector}
                        </div>
                        <div className="break-words">{it.text}</div>
                      </li>
                    ))}
                </ul>
              </details>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={this.reset}
              className="px-3 py-1.5 rounded bg-red-50 text-red-950 font-semibold hover:bg-white"
            >
              Retry render
            </button>
            <a
              href={`${window.location.pathname}?kn-block=0`}
              className="px-3 py-1.5 rounded border border-red-300 hover:bg-red-900"
            >
              Bypass (kn-block=0)
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const Throwable = ({ error }: { error: KnLeakError }) => {
  // Throw during render so the boundary catches it and unmounts children.
  throw error;
};

const Gate = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const [error, setError] = useState<KnLeakError | null>(null);

  useEffect(() => {
    if (!isPreviewHost()) return;
    if (language !== "kn") {
      setError(null);
      return;
    }
    setError(null);
    const handle = window.setTimeout(() => {
      const report = scanForEnglishLeaks();
      if (report.metadataTotal > 0) {
        // eslint-disable-next-line no-console
        console.error(
          `[kn-blocking-gate] ❌ Blocking render — ${report.metadataTotal} metadata leak(s).`,
          report,
        );
        window.dispatchEvent(new CustomEvent("kn-validation-failed", { detail: report }));
        setError(new KnLeakError(report));
      }
    }, 3000);
    return () => window.clearTimeout(handle);
  }, [language, location.pathname, location.search]);

  if (error) return <Throwable error={error} />;
  return <>{children}</>;
};

const KannadaPreviewBlockingGate = ({ children }: { children: ReactNode }) => {
  if (!isPreviewHost()) return <>{children}</>;
  return (
    <BlockingBoundary>
      <Gate>{children}</Gate>
    </BlockingBoundary>
  );
};

export default KannadaPreviewBlockingGate;
