import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { localizeSchemeObject } from "@/lib/localizeSchemeObject";
import { kn } from "@/lib/kannadaFallback";

export interface SchemeResult {
  id: string;
  scheme_name: string;
  title?: string;
  category: string;
  category_en?: string;
  category_kn?: string;
  target_group: string;
  target_group_en?: string;
  target_group_kn?: string;
  benefits: string;
  deadline?: string | null;
  official_link?: string | null;
  state?: string | null;
  state_en?: string | null;
  state_kn?: string | null;
  match_percentage: number;
  eligibility_status: "eligible" | "partial" | "not_eligible";
  missing_criteria?: string[];
  explanation?: string;
  explanation_en?: string;
  // Optional multilingual fields (when sourced from schemes_multilingual.json / backend KN payload)
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
  criteria?: string[] | string;
  criteria_en?: string[] | string;
  criteria_kn?: string[] | string;
  explanation_kn?: string;
}

interface SchemeCardProps {
  scheme: SchemeResult;
  onSave?: (scheme: SchemeResult) => void;
  isSaved?: boolean;
}

const SchemeCard = ({ scheme: rawScheme, onSave, isSaved }: SchemeCardProps) => {
  const { language, t } = useLanguage();
  const scheme = localizeSchemeObject(rawScheme, language);

  // Eligibility status — value derived from data, label routed through kn()
  const statusMeta = {
    eligible: { source: "Eligible", icon: CheckCircle2, className: "bg-civic-green-light text-civic-green" },
    partial: { source: "Partially Eligible", icon: AlertTriangle, className: "bg-civic-orange-light text-civic-orange" },
    not_eligible: { source: "Not Eligible", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
  } as const;

  const status = statusMeta[scheme.eligibility_status];
  const StatusIcon = status.icon;
  const statusLabel = kn(status.source, language, "eligibility_status");

  // Centralized Kannada fallback pipeline — every dynamic field is routed
  // through `kn()` so backend / ML-pipeline strings never leak as raw English.
  const displayTitle = kn(scheme.title, language, "text", scheme.title_kn);
  const displayBenefits = kn(scheme.benefits, language, "text", scheme.benefits_kn);
  const displayDescription = kn(scheme.description, language, "text", scheme.description_kn);
  const displayExplanation = kn(scheme.explanation, language, "explanation", scheme.explanation_kn);
  const displayEligibility = kn(scheme.eligibility, language, "text", scheme.eligibility_kn);
  const displayCategory = kn(scheme.category, language, "category", scheme.category_kn);
  const displayTarget = kn(scheme.target_group, language, "target_group", scheme.target_group_kn);
  const displayState = kn(scheme.state, language, "state", scheme.state_kn);

  return (
    <div className="bg-card border border-border rounded-lg p-5 card-hover space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-card-foreground text-base leading-snug">{displayTitle}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary" className="text-xs">{displayCategory}</Badge>
            <Badge variant="outline" className="text-xs">{displayTarget}</Badge>
            {displayState && <Badge variant="outline" className="text-xs">{displayState}</Badge>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-primary font-display">{scheme.match_percentage}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{t("scheme_match")}</div>
        </div>
      </div>

      <div className={`civic-badge ${status.className}`}>
        <StatusIcon className="h-3.5 w-3.5" />
        {status.label}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{displayBenefits}</p>

      {displayDescription && displayDescription !== displayBenefits && (
        <p className="text-xs text-muted-foreground/80 leading-relaxed">{displayDescription}</p>
      )}

      {displayEligibility && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">{t("eligibility_label")}</span> {displayEligibility}
        </p>
      )}

      {displayExplanation && (
        <div className="bg-civic-blue-light rounded-md p-3 text-xs text-foreground">
          <span className="font-semibold">{t("why_recommended")}</span> {displayExplanation}
        </div>
      )}

      {scheme.missing_criteria && scheme.missing_criteria.length > 0 && (
        <div className="bg-civic-orange-light rounded-md p-3 text-xs space-y-1">
          <span className="font-semibold text-civic-orange">{t("missing_criteria")}</span>
          <ul className="list-disc list-inside text-foreground/80">
            {scheme.missing_criteria.map((c, i) => <li key={i}>{kn(c, language, "missing_criterion")}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {t("deadline")} <span className="font-medium text-foreground">{kn(scheme.deadline ?? undefined, language) || scheme.deadline_label || t("ongoing")}</span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {scheme.official_link && (
          <a href={scheme.official_link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" /> {t("apply_now")}
            </Button>
          </a>
        )}
        {onSave && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onSave(rawScheme)}>
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
            {isSaved ? t("unsave") : t("save")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SchemeCard;
