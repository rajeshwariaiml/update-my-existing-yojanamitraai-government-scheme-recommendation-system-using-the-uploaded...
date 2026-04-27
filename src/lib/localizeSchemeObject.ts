import { enrichWithMultilingual } from "@/lib/multilingualSchemes";
import {
  translateCategory,
  translateExplanation,
  translateFreeText,
  translateMetadataList,
  translateMetadataValue,
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
  tags?: string[] | string;
  tags_en?: string[] | string;
  tags_kn?: string[] | string;
  beneficiary_labels?: string[] | string;
  beneficiary_labels_en?: string[] | string;
  beneficiary_labels_kn?: string[] | string;
  audience?: string;
  audience_en?: string;
  audience_kn?: string;
  scope?: string;
  scope_en?: string;
  scope_kn?: string;
  scheme_type?: string;
  scheme_type_en?: string;
  scheme_type_kn?: string;
  region?: string;
  region_en?: string;
  region_kn?: string;
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
  const tagsKn = enriched.tags_kn ?? translateMetadataList(enriched.tags_en ?? enriched.tags, "kn");
  const beneficiaryLabelsKn = enriched.beneficiary_labels_kn
    ?? translateMetadataList(enriched.beneficiary_labels_en ?? enriched.beneficiary_labels, "kn");
  const audienceKn = enriched.audience_kn
    ?? (enriched.audience_en || enriched.audience ? translateMetadataValue(enriched.audience_en ?? enriched.audience, "kn") : undefined);
  const scopeKn = enriched.scope_kn
    ?? (enriched.scope_en || enriched.scope ? translateMetadataValue(enriched.scope_en ?? enriched.scope, "kn") : undefined);
  const schemeTypeKn = enriched.scheme_type_kn
    ?? (enriched.scheme_type_en || enriched.scheme_type ? translateMetadataValue(enriched.scheme_type_en ?? enriched.scheme_type, "kn") : undefined);
  const regionKn = enriched.region_kn
    ?? (enriched.region_en || enriched.region ? translateMetadataValue(enriched.region_en ?? enriched.region, "kn") : undefined);

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
    tags_kn: tagsKn,
    beneficiary_labels_kn: beneficiaryLabelsKn,
    audience_kn: audienceKn,
    scope_kn: scopeKn,
    scheme_type_kn: schemeTypeKn,
    region_kn: regionKn,
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
    tags: language === "kn" ? tagsKn : (enriched.tags_en ?? enriched.tags),
    beneficiary_labels: language === "kn" ? beneficiaryLabelsKn : (enriched.beneficiary_labels_en ?? enriched.beneficiary_labels),
    audience: language === "kn" ? (audienceKn || "") : (enriched.audience_en ?? enriched.audience ?? ""),
    scope: language === "kn" ? (scopeKn || "") : (enriched.scope_en ?? enriched.scope ?? ""),
    scheme_type: language === "kn" ? (schemeTypeKn || "") : (enriched.scheme_type_en ?? enriched.scheme_type ?? ""),
    region: language === "kn" ? (regionKn || "") : (enriched.region_en ?? enriched.region ?? ""),
    deadline_label: language === "kn" ? "ನಡೆಯುತ್ತಿದೆ" : "Ongoing",
  };
};
