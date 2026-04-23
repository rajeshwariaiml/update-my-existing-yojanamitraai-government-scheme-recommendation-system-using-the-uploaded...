import { enrichWithMultilingual } from "@/lib/multilingualSchemes";
import {
  translateCategory,
  translateExplanation,
  translateFreeText,
  translateState,
  translateTargetGroup,
  type Lang,
} from "@/lib/translateScheme";

type MaybeText = string | null | undefined;
type MaybeList = string[] | string | null | undefined;

export interface LocalizableScheme {
  scheme_name?: string;
  title?: string;
  title_en?: string;
  title_kn?: string;
  description?: string;
  description_en?: string;
  description_kn?: string;
  benefits?: string;
  benefits_en?: string;
  benefits_kn?: string;
  eligibility?: string;
  eligibility_en?: string;
  eligibility_kn?: string;
  explanation?: string;
  explanation_en?: string;
  explanation_kn?: string;
  criteria?: string[] | string;
  criteria_en?: string[] | string;
  criteria_kn?: string[] | string;
  target_group?: string;
  target_group_en?: string;
  target_group_kn?: string;
  category?: string;
  category_en?: string;
  category_kn?: string;
  state?: string | null;
  state_en?: string | null;
  state_kn?: string | null;
  deadline?: string | null;
}

const localizeText = (
  language: Lang,
  options: {
    kn?: MaybeText;
    en?: MaybeText;
    raw?: MaybeText;
    fallbackTransform?: (value: string, language: Lang) => string;
  },
) => {
  if (language !== "kn") return options.en ?? options.raw ?? "";

  const knValue = options.kn?.trim();
  if (knValue) return translateFreeText(knValue, "kn");

  const source = (options.en ?? options.raw ?? "").trim();
  if (!source) return "";

  const transformed = options.fallbackTransform ? options.fallbackTransform(source, "kn") : source;
  return translateFreeText(transformed, "kn");
};

const localizeList = (language: Lang, value: MaybeList): MaybeList => {
  if (!value) return value ?? undefined;
  if (Array.isArray(value)) {
    return value.map((item) => localizeText(language, { raw: item }));
  }
  return localizeText(language, { raw: value });
};

export const localizeSchemeObject = <T extends LocalizableScheme>(scheme: T, language: Lang) => {
  const enriched = enrichWithMultilingual(scheme);

  const rawTitle = enriched.title_en ?? enriched.title ?? enriched.scheme_name ?? "";
  const titleKn = enriched.title_kn ?? (rawTitle ? translateFreeText(rawTitle, "kn") : undefined);
  const descriptionKn = enriched.description_kn
    ?? (enriched.description_en || enriched.description
      ? translateFreeText(enriched.description_en ?? enriched.description, "kn")
      : undefined);
  const benefitsKn = enriched.benefits_kn
    ?? (enriched.benefits_en || enriched.benefits
      ? translateFreeText(enriched.benefits_en ?? enriched.benefits, "kn")
      : undefined);
  const eligibilityKn = enriched.eligibility_kn
    ?? (enriched.eligibility_en || enriched.eligibility
      ? translateFreeText(enriched.eligibility_en ?? enriched.eligibility, "kn")
      : undefined);
  const explanationSource = enriched.explanation_en ?? enriched.explanation;
  const explanationKn = enriched.explanation_kn
    ?? (explanationSource ? translateFreeText(translateExplanation(explanationSource, "kn"), "kn") : undefined);
  const criteriaKn = enriched.criteria_kn ?? localizeList(language, enriched.criteria_en ?? enriched.criteria);
  const targetGroupKn = enriched.target_group_kn
    ?? (enriched.target_group_en || enriched.target_group
      ? translateFreeText(translateTargetGroup(enriched.target_group_en ?? enriched.target_group, "kn"), "kn")
      : undefined);
  const categoryKn = enriched.category_kn
    ?? (enriched.category_en || enriched.category
      ? translateFreeText(translateCategory(enriched.category_en ?? enriched.category, "kn"), "kn")
      : undefined);
  const stateKn = enriched.state_kn
    ?? (enriched.state_en || enriched.state
      ? translateFreeText(translateState(enriched.state_en ?? enriched.state, "kn"), "kn")
      : undefined);

  return {
    ...enriched,
    title_kn: titleKn,
    description_kn: descriptionKn,
    benefits_kn: benefitsKn,
    eligibility_kn: eligibilityKn,
    explanation_kn: explanationKn,
    criteria_kn: criteriaKn,
    target_group_kn: targetGroupKn,
    category_kn: categoryKn,
    state_kn: stateKn,
    title: language === "kn" ? (titleKn || rawTitle) : rawTitle,
    description: localizeText(language, {
      kn: descriptionKn,
      en: enriched.description_en,
      raw: enriched.description,
    }),
    benefits: localizeText(language, {
      kn: benefitsKn,
      en: enriched.benefits_en,
      raw: enriched.benefits,
    }),
    eligibility: localizeText(language, {
      kn: eligibilityKn,
      en: enriched.eligibility_en,
      raw: enriched.eligibility,
    }),
    explanation: language === "kn"
      ? (explanationKn || "")
      : (enriched.explanation_en ?? enriched.explanation ?? ""),
    criteria: language === "kn"
      ? (criteriaKn ?? undefined)
      : (enriched.criteria_en ?? enriched.criteria ?? undefined),
    target_group: language === "kn"
      ? (targetGroupKn || "")
      : (enriched.target_group_en ?? enriched.target_group ?? ""),
    category: language === "kn"
      ? (categoryKn || "")
      : (enriched.category_en ?? enriched.category ?? ""),
    state: language === "kn"
      ? (stateKn || "")
      : (enriched.state_en ?? enriched.state ?? ""),
    deadline_label: language === "kn" ? "ನಡೆಯುತ್ತಿದೆ" : "Ongoing",
  };
};
