/**
 * Centralized Kannada Fallback Pipeline
 * =====================================
 * Every dynamically generated string (recommendation summary,
 * eligibility explanation, metadata label, dataset description,
 * benefits, criteria, target group, category, state, deadline,
 * eligibility status, etc.) MUST pass through `kn()` before being
 * rendered when language === "kn".
 *
 * Resolution order (first non-empty wins):
 *   1. Explicit `*_kn` field provided by the dataset / backend.
 *   2. i18n dictionary key (canonical translation for known metadata).
 *   3. Domain-specific translator (category / state / target /
 *      explanation / missing-criterion).
 *   4. Phrase-level `translateFreeText` fallback.
 *   5. Raw English text (last-resort, only when Kannada genuinely unknown).
 */

import en from "@/i18n/en.json";
import kn_dict from "@/i18n/kn.json";
import { WORD_KN } from "@/lib/kannadaWordDict";
import {
  translateCategory,
  translateExplanation,
  translateFreeText,
  translateMissingCriterion,
  translateState,
  translateTargetGroup,
  type Lang,
} from "@/lib/translateScheme";

export type FieldHint =
  | "text"
  | "category"
  | "state"
  | "target_group"
  | "explanation"
  | "missing_criterion"
  | "eligibility_status"
  | "deadline";

const EN = en as Record<string, string>;
const KN = kn_dict as Record<string, string>;

const containsKannada = (s: string) => /[\u0C80-\u0CFF]/.test(s);
const containsLatinWord = (s: string) => /[A-Za-z]{2,}/.test(s);

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[&/]/g, " ").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** i18n key prefixes per metadata domain. */
const PREFIX: Partial<Record<FieldHint, string>> = {
  category: "meta_category_",
  target_group: "meta_target_",
  state: "state_",
  eligibility_status: "meta_status_",
  deadline: "meta_deadline_",
};

/** Try the i18n dictionary using a deterministic key derived from the value. */
const tryI18n = (value: string, hint: FieldHint, language: Lang): string | null => {
  const prefix = PREFIX[hint];
  if (!prefix) return null;
  const key = `${prefix}${slug(value)}`;
  const dict = language === "kn" ? KN : EN;
  return dict[key] ?? null;
};

/**
 * Run a single string through the Kannada fallback pipeline.
 *
 * @param value     The English (or partially English) source string.
 * @param language  Active UI language.
 * @param hint      Optional domain hint to choose the right translator.
 * @param knValue   Optional pre-translated Kannada variant from dataset/backend.
 */
export const kn = (
  value: string | null | undefined,
  language: Lang,
  hint: FieldHint = "text",
  knValue?: string | null,
): string => {
  if (language !== "kn") {
    const src = (value ?? "").toString();
    // Even in English mode, route metadata through i18n so capitalization / labels
    // stay canonical (e.g. "education" → "Education").
    const i18n = src ? tryI18n(src, hint, "en") : null;
    return i18n ?? src;
  }

  // 1. Prefer explicit *_kn from dataset/backend
  const knTrim = (knValue ?? "").trim();
  if (knTrim) return knTrim;

  const src = (value ?? "").toString().trim();
  if (!src) return "";

  // 2. Canonical i18n key lookup
  const i18nMatch = tryI18n(src, hint, "kn");
  if (i18nMatch) return i18nMatch;

  // 3. Domain translator
  let out = src;
  switch (hint) {
    case "category":
      out = translateCategory(src, "kn");
      break;
    case "state":
      out = translateState(src, "kn");
      break;
    case "target_group":
      out = translateTargetGroup(src, "kn");
      break;
    case "explanation":
      out = translateExplanation(src, "kn") ?? src;
      break;
    case "missing_criterion":
      out = translateMissingCriterion(src, "kn");
      break;
    default:
      out = src;
  }

  // 4. Phrase-level fallback for any leftover English inside the result.
  if (containsLatinWord(out)) {
    out = translateFreeText(out, "kn") || out;
  }

  // 5. If still entirely Latin, try translating the raw source one more time.
  if (!containsKannada(out) && containsLatinWord(out)) {
    out = translateFreeText(src, "kn") || out;
  }

  return out;
};

/** Apply `kn()` to an array of strings (e.g. criteria lists). */
export const knList = (
  values: string[] | string | null | undefined,
  language: Lang,
  hint: FieldHint = "text",
): string[] => {
  if (!values) return [];
  const arr = Array.isArray(values) ? values : [values];
  return arr.map((v) => kn(v, language, hint));
};
