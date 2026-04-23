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
  "bpl families": "BPL ಕುಟುಂಬಗಳು",
  "apl families": "APL ಕುಟುಂಬಗಳು",
  "rural households": "ಗ್ರಾಮೀಣ ಕುಟುಂಬಗಳು",
  "urban households": "ನಗರ ಕುಟುಂಬಗಳು",
  "urban poor": "ನಗರ ಬಡವರು",
  "rural poor": "ಗ್ರಾಮೀಣ ಬಡವರು",
  "artisans": "ಕುಶಲಕರ್ಮಿಗಳು",
  "workers": "ಕಾರ್ಮಿಕರು",
  "girls": "ಹುಡುಗಿಯರು",
  "boys": "ಹುಡುಗರು",
  "children": "ಮಕ್ಕಳು",
  "elderly": "ವೃದ್ಧರು",
  "disabled": "ಅಂಗವಿಕಲರು",
  "differently abled": "ವಿಶೇಷ ಚೇತನರು",
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

// Translate a free-text fallback explanation produced by the local matcher
// Mapping of attribute names emitted by ml_pipeline/explainability_engine.py
const ATTRIBUTE_KN: Record<string, string> = {
  "age range": "ವಯಸ್ಸಿನ ವ್ಯಾಪ್ತಿ",
  "income level": "ಆದಾಯದ ಮಟ್ಟ",
  "geographic location": "ಭೌಗೋಳಿಕ ಸ್ಥಳ",
  "gender criteria": "ಲಿಂಗ ಮಾನದಂಡ",
  "education qualification": "ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ",
  "occupation type": "ಉದ್ಯೋಗ ಪ್ರಕಾರ",
  "social category": "ಸಾಮಾಜಿಕ ವರ್ಗ",
};

const translateAttrList = (csv: string) =>
  csv.split(/,\s*|\s+and\s+/).map((a) => ATTRIBUTE_KN[a.trim().toLowerCase()] ?? a.trim()).join(", ");

// or the recommend-schemes edge function / ml_pipeline explainability engine.
export const translateExplanation = (text: string | undefined, lang: Lang) => {
  if (!text || lang !== "kn") return text ?? "";
  let out = text;

  // Edge-function fallback sentences
  out = out
    .replace(/Matched based on strong alignment with your age, income, and location profile\./i,
      "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on partial alignment with your age, income, and location profile\./i,
      "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on strong alignment with your demographic profile\./i,
      "ನಿಮ್ಮ ಜನಸಂಖ್ಯಾ ಪ್ರೊಫೈಲ್‌ಗೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on partial alignment with your demographic profile\./i,
      "ನಿಮ್ಮ ಜನಸಂಖ್ಯಾ ಪ್ರೊಫೈಲ್‌ಗೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.");

  // ML pipeline (ExplainabilityEngine) template fragments
  out = out
    .replace(/This scheme is highly recommended for you\./i,
      "ಈ ಯೋಜನೆಯನ್ನು ನಿಮಗೆ ಬಲವಾಗಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.")
    .replace(/This scheme is a partial match for your profile\./i,
      "ಈ ಯೋಜನೆ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಭಾಗಶಃ ಹೊಂದಿಕೆಯಾಗಿದೆ.")
    .replace(/This scheme has limited alignment with your current profile\./i,
      "ಈ ಯೋಜನೆ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೀಮಿತ ಹೊಂದಾಣಿಕೆ ಹೊಂದಿದೆ.")
    .replace(/Your profile strongly aligns with the eligibility criteria\./i,
      "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅರ್ಹತೆ ಮಾನದಂಡಗಳಿಗೆ ಬಲವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.")
    .replace(/Consider updating your profile or checking if exceptions apply\./i,
      "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ ಅಥವಾ ವಿನಾಯಿತಿಗಳಿವೆಯೇ ಎಂಬುದನ್ನು ಪರಿಶೀಲಿಸಿ.")
    .replace(/You may become eligible if your circumstances change\./i,
      "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ಬದಲಾದರೆ ನೀವು ಅರ್ಹರಾಗಬಹುದು.")
    .replace(/Limited profile information was available for matching\./i,
      "ಹೊಂದಾಣಿಕೆಗೆ ಸೀಮಿತ ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ ಲಭ್ಯವಿತ್ತು.")
    .replace(/However,\s*/i, "ಆದರೆ, ")
    .replace(/Missing criteria:\s*/i, "ಕೊರತೆಯಿರುವ ಮಾನದಂಡ: ");

  // "It matches your X." / "It matches your A, B and C."
  out = out.replace(/It matches your ([^.]+)\./gi, (_, attrs) =>
    `ಇದು ನಿಮ್ಮ ${translateAttrList(attrs)} ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.`);

  return out;
};

// Word-level dictionary used for benefits / eligibility / criteria fallbacks
// when no *_kn variant is present in the dataset.
const PHRASE_KN: Array<[RegExp, string]> = [
  [/Must belong to BPL category/gi, "BPL ವರ್ಗಕ್ಕೆ ಸೇರಿರಬೇಕು"],
  [/Must belong to APL category/gi, "APL ವರ್ಗಕ್ಕೆ ಸೇರಿರಬೇಕು"],
  [/Below Poverty Line/gi, "ಬಡತನ ರೇಖೆಗಿಂತ ಕೆಳಗೆ"],
  [/Above Poverty Line/gi, "ಬಡತನ ರೇಖೆಗಿಂತ ಮೇಲೆ"],
  [/Annual income/gi, "ವಾರ್ಷಿಕ ಆದಾಯ"],
  [/Family income/gi, "ಕುಟುಂಬದ ಆದಾಯ"],
  [/Must be a resident of/gi, "ನಿವಾಸಿ ಆಗಿರಬೇಕು"],
  [/Must be a citizen of India/gi, "ಭಾರತದ ಪ್ರಜೆಯಾಗಿರಬೇಕು"],
  [/Must be a citizen/gi, "ಪ್ರಜೆಯಾಗಿರಬೇಕು"],
  [/Must be a student/gi, "ವಿದ್ಯಾರ್ಥಿಯಾಗಿರಬೇಕು"],
  [/Must be a farmer/gi, "ರೈತನಾಗಿರಬೇಕು"],
  [/Must be unemployed/gi, "ನಿರುದ್ಯೋಗಿಯಾಗಿರಬೇಕು"],
  [/Must be married/gi, "ವಿವಾಹಿತರಾಗಿರಬೇಕು"],
  [/Must be unmarried/gi, "ಅವಿವಾಹಿತರಾಗಿರಬೇಕು"],
  [/Financial assistance/gi, "ಆರ್ಥಿಕ ಸಹಾಯ"],
  [/Health insurance/gi, "ಆರೋಗ್ಯ ವಿಮೆ"],
  [/Scholarship/gi, "ವಿದ್ಯಾರ್ಥಿವೇತನ"],
  [/Subsidy/gi, "ಸಬ್ಸಿಡಿ"],
  [/Loan/gi, "ಸಾಲ"],
  [/per year/gi, "ಪ್ರತಿ ವರ್ಷ"],
  [/per month/gi, "ಪ್ರತಿ ತಿಂಗಳು"],
  [/per family/gi, "ಪ್ರತಿ ಕುಟುಂಬ"],
  [/lakh/gi, "ಲಕ್ಷ"],
  [/years/gi, "ವರ್ಷಗಳು"],
  [/year/gi, "ವರ್ಷ"],
  [/and above/gi, "ಮತ್ತು ಮೇಲೆ"],
  [/and below/gi, "ಮತ್ತು ಕೆಳಗೆ"],
  [/Eligible:/gi, "ಅರ್ಹತೆ:"],
];

const phraseTranslate = (text: string) => {
  let out = text;
  for (const [re, kn] of PHRASE_KN) out = out.replace(re, kn);
  return out;
};

// Translate a single "missing criterion" sentence emitted by the local matcher.
export const translateMissingCriterion = (text: string, lang: Lang) => {
  if (lang !== "kn") return text;
  const out = text
    .replace(/^Age must be (\d+)-(\d+)$/i, "ವಯಸ್ಸು $1-$2 ಆಗಿರಬೇಕು")
    .replace(/^Income must be under ₹([\d,]+)$/i, "ಆದಾಯ ₹$1 ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು")
    .replace(/^Must be from (.+)$/i, (_, s) => `${lookup(STATE_KN, s)} ನಿವಾಸಿ ಆಗಿರಬೇಕು`)
    .replace(/^(.+) applicants only$/i, (_, g) => `ಕೇವಲ ${g === "Female" ? "ಮಹಿಳೆಯರು" : g === "Male" ? "ಪುರುಷರು" : g} ಮಾತ್ರ`);
  return phraseTranslate(out);
};

// Translate free-text benefits / eligibility / description when a *_kn
// variant is not available in the dataset.
export const translateFreeText = (text: string | undefined | null, lang: Lang) => {
  if (!text || lang !== "kn") return text ?? "";
  return phraseTranslate(text);
};
