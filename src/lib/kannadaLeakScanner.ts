/**
 * Dev-only validator that scans the rendered DOM for English text leaking
 * through when the UI language is Kannada. It walks every visible text node,
 * skips intentionally English content (brand marks, code, URLs, numbers,
 * locked keywords), and reports any element whose text still contains Latin
 * word characters of length >= 2.
 *
 * Output is grouped by the nearest identifying ancestor (a SchemeCard, a
 * page route, etc.) so it's easy to see which component or scheme is leaking.
 */

export interface LeakReport {
  total: number;
  metadataTotal: number;
  byComponent: Record<string, LeakItem[]>;
}

export interface LeakItem {
  text: string;
  schemeName?: string;
  selector: string;
  route: string;
  isMetadata?: boolean;
}

// Words that are allowed to remain in English (brand, acronyms, units, etc.)
const ALLOWLIST = new Set<string>([
  "ai",
  "yojanamitra",
  "yojanamitraai",
  "api",
  "url",
  "id",
  "ok",
  "pdf",
  "json",
  "csv",
  "html",
  "css",
  "js",
  "ts",
  "kn",
  "en",
  "bpl",
  "apl",
  "msme",
  "msmes",
  "sc",
  "st",
  "obc",
  "ews",
  "pmkisan",
  "pm",
  "rs",
  "inr",
  "usd",
  "lpa",
  "cr",
  "crore",
  "lakh",
  "mudra",
  "shishu",
  "kishore",
  "tarun",
  "gst",
  "pan",
  "aadhaar",
  "aadhar",
  "kyc",
  "upi",
  "otp",
  "v1",
  "v2",
]);

// Latin word matcher: 2+ ASCII letters in a row.
const LATIN_WORD = /[A-Za-z]{2,}/g;

const isVisible = (el: Element): boolean => {
  if (!(el instanceof HTMLElement)) return true;
  if (el.hidden) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }
  return true;
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "PATH"]);

const closestSchemeCard = (el: Element): Element | null => {
  let cur: Element | null = el;
  while (cur) {
    const heading = cur.querySelector?.("h1, h2, h3, h4");
    if (heading && cur.classList.contains("card-hover")) return cur;
    cur = cur.parentElement;
  }
  return null;
};

const describeElement = (el: Element): string => {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = (el.getAttribute("class") || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((c) => `.${c}`)
    .join("");
  return `${tag}${id}${cls}`;
};

const cleanWord = (word: string) => word.toLowerCase().replace(/[^a-z]/g, "");

export const scanForEnglishLeaks = (): LeakReport => {
  const report: LeakReport = { total: 0, metadataTotal: 0, byComponent: {} };
  if (typeof document === "undefined") return report;

  const root = document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-allow-english]")) return NodeFilter.FILTER_REJECT;
      if (!isVisible(parent)) return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const route = typeof window !== "undefined" ? window.location.pathname : "/";

  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.textContent || "";
    const matches = text.match(LATIN_WORD) || [];
    const offending = matches.filter((w) => {
      const c = cleanWord(w);
      if (!c || c.length < 2) return false;
      if (ALLOWLIST.has(c)) return false;
      return true;
    });

    if (offending.length > 0) {
      const parent = node.parentElement!;
      const card = closestSchemeCard(parent);
      const schemeName = card?.querySelector("h3, h2, h1")?.textContent?.trim();
      const isMetadata = !!parent.closest("[data-meta-field]");
      const componentKey = isMetadata
        ? `SchemeCard metadata: ${schemeName ?? "(untitled)"}`
        : card
          ? `SchemeCard: ${schemeName ?? "(untitled)"}`
          : describeElement(parent);

      const item: LeakItem = {
        text: text.trim().slice(0, 200),
        schemeName,
        selector: describeElement(parent),
        route,
        isMetadata,
      };
      const bucket = (report.byComponent[componentKey] ??= []);
      bucket.push(item);
      report.total += 1;
      if (isMetadata) report.metadataTotal += 1;
    }

    node = walker.nextNode();
  }

  return report;
};

export const logKannadaLeakReport = (report: LeakReport) => {
  if (report.total === 0) {
    // eslint-disable-next-line no-console
    console.info("[kn-validator] ✅ No English leaks detected on this view.");
    return;
  }
  // eslint-disable-next-line no-console
  console.group(`[kn-validator] ⚠️ ${report.total} English leak(s) detected`);
  for (const [component, items] of Object.entries(report.byComponent)) {
    // eslint-disable-next-line no-console
    console.groupCollapsed(`${component} — ${items.length}`);
    for (const item of items) {
      // eslint-disable-next-line no-console
      console.log(
        `route=${item.route} selector=${item.selector}${item.schemeName ? ` scheme="${item.schemeName}"` : ""}\n  text: ${item.text}`,
      );
    }
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
  // eslint-disable-next-line no-console
  console.groupEnd();
};
