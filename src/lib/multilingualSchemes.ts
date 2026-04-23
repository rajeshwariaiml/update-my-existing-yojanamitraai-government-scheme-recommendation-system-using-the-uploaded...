// Build a lookup of multilingual scheme data keyed by scheme_name.
// The dataset is shipped with the frontend so we can enrich any
// recommendation/saved/history record with KN fields client-side without
// requiring backend changes.
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
}

const norm = (s: string) => s.trim().toLowerCase();

const LOOKUP: Map<string, MultilingualScheme> = (() => {
  const m = new Map<string, MultilingualScheme>();
  for (const item of dataset as MultilingualScheme[]) {
    if (item.scheme_name) m.set(norm(item.scheme_name), item);
    if (item.title_en) m.set(norm(item.title_en), item);
  }
  return m;
})();

export interface MultilingualFields {
  title_en?: string;
  title_kn?: string;
  description?: string;
  description_en?: string;
  description_kn?: string;
  benefits_en?: string;
  benefits_kn?: string;
  eligibility?: string;
  eligibility_en?: string;
  eligibility_kn?: string;
}

/**
 * Merge multilingual fields from the local dataset into a scheme record.
 * Existing fields on the input always take precedence over dataset values.
 */
export const enrichWithMultilingual = <T extends { scheme_name?: string } & MultilingualFields>(
  scheme: T,
): T => {
  if (!scheme?.scheme_name) return scheme;
  const match = LOOKUP.get(norm(scheme.scheme_name));
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
  };
};
