import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { logKannadaLeakReport, scanForEnglishLeaks } from "@/lib/kannadaLeakScanner";

/**
 * Dev-only hook. When language === "kn", schedule a DOM scan after each
 * route change (and after data settles) and report English leaks to the
 * console. No-ops in production builds.
 */
export const useKannadaLeakValidator = () => {
  const { language } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (language !== "kn") return;

    const handles: number[] = [];
    // Run once after initial paint, then again to catch async-rendered cards.
    handles.push(window.setTimeout(() => logKannadaLeakReport(scanForEnglishLeaks()), 600));
    handles.push(window.setTimeout(() => logKannadaLeakReport(scanForEnglishLeaks()), 2500));

    return () => handles.forEach((h) => window.clearTimeout(h));
  }, [language, location.pathname, location.search]);
};
