/**
 * Centralized Kannada Fallback Pipeline
 * =====================================
 * Every dynamically generated string (recommendation summary,
 * eligibility explanation, metadata label, dataset description,
 * benefits, criteria, target group, category, state, etc.) MUST
 * pass through `kn()` before being rendered when language === "kn".
 *
 * Resolution order (first non-empty wins):
 *   1. Explicit `*_kn` field provided by the dataset / backend.
 *   2. Domain-specific translator (category / state / target / explanation /
 *      missing-criterion) when a hint is supplied.
 *   3. Phrase-level `translateFreeText` fallback.
 *   4. Raw English text (last-resort, only when Kannada genuinely unknown).
 */

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
  | "missing_criterion";

const containsKannada = (s: string) => /[\u0C80-\u0CFF]/.test(s);
const containsLatinWord = (s: string) => /[A-Za-z]{2,}/.test(s);

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
  if (language !== "kn") return (value ?? "").toString();

  // 1. Prefer explicit *_kn from dataset/backend
  const knTrim = (knValue ?? "").trim();
  if (knTrim) return knTrim;

  const src = (value ?? "").toString().trim();
  if (!src) return "";

  // 2. Domain translator
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

  // 3. Always run phrase-level fallback so any leftover English
  //    inside the translated string is converted as well.
  if (containsLatinWord(out)) {
    out = translateFreeText(out, "kn") || out;
  }

  // 4. If still entirely Latin (no Kannada chars), keep the best
  //    phrase-translated version we have — never silently render
  //    raw English when we can produce *some* Kannada token mix.
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
