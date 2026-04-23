// Build lookups of multilingual scheme data keyed by exact scheme_name first,
// then by normalized names/titles as a resilient fallback. The dataset ships
// with the frontend so we can enrich recommendation/saved/history records
// client-side without backend changes.
import dataset from "../../dataset/schemes_multilingual.json";

interface MultilingualScheme {
  scheme_name: string;
  title_en?: string;
  title_kn?: string;
  description_en?: string;
  description_kn?: string;
  benefits_en?: string;
  benefits_kn?: string;
  eligibility_en?: string;
  eligibility_kn?: string;
  criteria_en?: string[] | string;
  criteria_kn?: string[] | string;
  target_group_en?: string;
  target_group_kn?: string;
}

const exact = (s: string) => s.trim();
const norm = (s: string) => s.trim().toLowerCase();

const EXACT_LOOKUP: Map<string, MultilingualScheme> = (() => {
  const m = new Map<string, MultilingualScheme>();
  for (const item of dataset as MultilingualScheme[]) {
    if (item.scheme_name) m.set(exact(item.scheme_name), item);
  }
  return m;
})();

const LOOKUP: Map<string, MultilingualScheme> = (() => {
  const m = new Map<string, MultilingualScheme>();
  for (const item of dataset as MultilingualScheme[]) {
    if (item.scheme_name) m.set(norm(item.scheme_name), item);
    if (item.title_en) m.set(norm(item.title_en), item);
  }
  return m;
})();

export interface MultilingualFields {
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
}

/**
 * Merge multilingual fields from the local dataset into a scheme record.
 * Existing fields on the input always take precedence over dataset values.
 */
export const enrichWithMultilingual = <T extends { scheme_name?: string; title?: string } & MultilingualFields>(
  scheme: T,
): T => {
  if (!scheme?.scheme_name && !scheme?.title) return scheme;

  const match = (scheme.scheme_name && EXACT_LOOKUP.get(exact(scheme.scheme_name)))
    || (scheme.scheme_name && LOOKUP.get(norm(scheme.scheme_name)))
    || (scheme.title && LOOKUP.get(norm(scheme.title)));

  if (!match) return scheme;

  return {
    ...scheme,
    title_en: scheme.title_en ?? match.title_en,
    title_kn: scheme.title_kn ?? match.title_kn,
    description_en: scheme.description_en ?? match.description_en,
    description_kn: scheme.description_kn ?? match.description_kn,
    benefits_en: scheme.benefits_en ?? match.benefits_en,
    benefits_kn: scheme.benefits_kn ?? match.benefits_kn,
    eligibility_en: scheme.eligibility_en ?? match.eligibility_en,
    eligibility_kn: scheme.eligibility_kn ?? match.eligibility_kn,
    criteria_en: scheme.criteria_en ?? match.criteria_en,
    criteria_kn: scheme.criteria_kn ?? match.criteria_kn,
    target_group_en: scheme.target_group_en ?? match.target_group_en,
    target_group_kn: scheme.target_group_kn ?? match.target_group_kn,
  };
};
