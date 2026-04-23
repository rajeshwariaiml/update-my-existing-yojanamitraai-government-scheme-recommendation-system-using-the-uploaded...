// Helpers for translating dataset values that are not in i18n dictionaries
// (categories, target groups, states, fallback explanations, missing-criteria sentences).

export type Lang = "en" | "kn";

const CATEGORY_KN: Record<string, string> = {
  education: "ಶಿಕ್ಷಣ",
  employment: "ಉದ್ಯೋಗ",
  health: "ಆರೋಗ್ಯ",
  healthcare: "ಆರೋಗ್ಯ",
  entrepreneurship: "ಉದ್ಯಮಿತ್ವ",
  women: "ಮಹಿಳೆಯರು",
  youth: "ಯುವಕರು",
  agriculture: "ಕೃಷಿ",
  housing: "ವಸತಿ",
  finance: "ಹಣಕಾಸು",
  pension: "ಪಿಂಚಣಿ",
  scholarship: "ವಿದ್ಯಾರ್ಥಿವೇತನ",
  welfare: "ಕಲ್ಯಾಣ",
  insurance: "ವಿಮೆ",
  skill: "ಕೌಶಲ್ಯ",
  "skill development": "ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ",
  social: "ಸಾಮಾಜಿಕ",
  rural: "ಗ್ರಾಮೀಣ",
  urban: "ನಗರ",
};

const TARGET_KN: Record<string, string> = {
  "all": "ಎಲ್ಲರೂ",
  "students": "ವಿದ್ಯಾರ್ಥಿಗಳು",
  "sc students": "SC ವಿದ್ಯಾರ್ಥಿಗಳು",
  "st students": "ST ವಿದ್ಯಾರ್ಥಿಗಳು",
  "obc students": "OBC ವಿದ್ಯಾರ್ಥಿಗಳು",
  "farmers": "ರೈತರು",
  "women": "ಮಹಿಳೆಯರು",
  "youth": "ಯುವಕರು",
  "senior citizens": "ಹಿರಿಯ ನಾಗರಿಕರು",
  "minorities": "ಅಲ್ಪಸಂಖ್ಯಾತರು",
  "entrepreneurs": "ಉದ್ಯಮಿಗಳು",
  "unemployed": "ನಿರುದ್ಯೋಗಿಗಳು",
  "general": "ಸಾಮಾನ್ಯ",
};

const STATE_KN: Record<string, string> = {
  "all india": "ಅಖಿಲ ಭಾರತ",
  "karnataka": "ಕರ್ನಾಟಕ",
  "kerala": "ಕೇರಳ",
  "tamil nadu": "ತಮಿಳುನಾಡು",
  "andhra pradesh": "ಆಂಧ್ರಪ್ರದೇಶ",
  "telangana": "ತೆಲಂಗಾಣ",
  "maharashtra": "ಮಹಾರಾಷ್ಟ್ರ",
  "delhi": "ದೆಹಲಿ",
  "gujarat": "ಗುಜರಾತ್",
  "bihar": "ಬಿಹಾರ",
  "rajasthan": "ರಾಜಸ್ಥಾನ",
  "punjab": "ಪಂಜಾಬ್",
  "haryana": "ಹರಿಯಾಣ",
  "uttar pradesh": "ಉತ್ತರ ಪ್ರದೇಶ",
  "west bengal": "ಪಶ್ಚಿಮ ಬಂಗಾಳ",
  "madhya pradesh": "ಮಧ್ಯಪ್ರದೇಶ",
};

const lookup = (map: Record<string, string>, value?: string | null) => {
  if (!value) return value ?? "";
  const key = value.trim().toLowerCase();
  return map[key] ?? value;
};

export const translateCategory = (value: string | null | undefined, lang: Lang) =>
  lang === "kn" ? lookup(CATEGORY_KN, value) : (value ?? "");

export const translateTargetGroup = (value: string | null | undefined, lang: Lang) =>
  lang === "kn" ? lookup(TARGET_KN, value) : (value ?? "");

export const translateState = (value: string | null | undefined, lang: Lang) =>
  lang === "kn" ? lookup(STATE_KN, value) : (value ?? "");

// Translate a free-text fallback explanation produced by the local matcher.
export const translateExplanation = (text: string | undefined, lang: Lang) => {
  if (!text || lang !== "kn") return text ?? "";
  return text
    .replace(/Matched based on strong alignment with your age, income, and location profile\./i,
      "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on partial alignment with your age, income, and location profile\./i,
      "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.");
};

// Translate a single "missing criterion" sentence emitted by the local matcher.
export const translateMissingCriterion = (text: string, lang: Lang) => {
  if (lang !== "kn") return text;
  return text
    .replace(/^Age must be (\d+)-(\d+)$/i, "ವಯಸ್ಸು $1-$2 ಆಗಿರಬೇಕು")
    .replace(/^Income must be under ₹([\d,]+)$/i, "ಆದಾಯ ₹$1 ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು")
    .replace(/^Must be from (.+)$/i, (_, s) => `${lookup(STATE_KN, s)} ನಿವಾಸಿ ಆಗಿರಬೇಕು`)
    .replace(/^(.+) applicants only$/i, (_, g) => `ಕೇವಲ ${g === "Female" ? "ಮಹಿಳೆಯರು" : g === "Male" ? "ಪುರುಷರು" : g} ಮಾತ್ರ`);
};
