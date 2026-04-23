import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  translateCategory,
  translateTargetGroup,
  translateState,
  translateExplanation,
  translateMissingCriterion,
} from "@/lib/translateScheme";
import { enrichWithMultilingual } from "@/lib/multilingualSchemes";

export interface SchemeResult {
  id: string;
  scheme_name: string;
  category: string;
  target_group: string;
  benefits: string;
  deadline?: string | null;
  official_link?: string | null;
  state?: string | null;
  match_percentage: number;
  eligibility_status: "eligible" | "partial" | "not_eligible";
  missing_criteria?: string[];
  explanation?: string;
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
  explanation_kn?: string;
}

interface SchemeCardProps {
  scheme: SchemeResult;
  onSave?: (scheme: SchemeResult) => void;
  isSaved?: boolean;
}

const SchemeCard = ({ scheme: rawScheme, onSave, isSaved }: SchemeCardProps) => {
  const { language, t } = useLanguage();
  const isKn = language === "kn";
  const scheme = enrichWithMultilingual(rawScheme);

  const statusConfig = {
    eligible: { label: t("eligible"), icon: CheckCircle2, className: "bg-civic-green-light text-civic-green" },
    partial: { label: t("partially_eligible"), icon: AlertTriangle, className: "bg-civic-orange-light text-civic-orange" },
    not_eligible: { label: t("not_eligible"), icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
  } as const;

  const status = statusConfig[scheme.eligibility_status];
  const StatusIcon = status.icon;

  const displayTitle = isKn
    ? (scheme.title_kn || scheme.scheme_name)
    : (scheme.title_en || scheme.scheme_name);
  const displayBenefits = isKn
    ? (scheme.benefits_kn || scheme.benefits)
    : (scheme.benefits_en || scheme.benefits);
  const displayDescription = isKn
    ? (scheme.description_kn || scheme.description)
    : (scheme.description_en || scheme.description);
  const displayExplanation = isKn
    ? (scheme.explanation_kn || translateExplanation(scheme.explanation, "kn"))
    : scheme.explanation;
  const displayEligibility = isKn
    ? (scheme.eligibility_kn || scheme.eligibility)
    : (scheme.eligibility_en || scheme.eligibility);
  const displayCategory = translateCategory(scheme.category, language);
  const displayTarget = translateTargetGroup(scheme.target_group, language);
  const displayState = translateState(scheme.state, language);

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
            {scheme.missing_criteria.map((c, i) => <li key={i}>{translateMissingCriterion(c, language)}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {t("deadline")} <span className="font-medium text-foreground">{scheme.deadline || t("ongoing")}</span>
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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onSave(scheme)}>
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
            {isSaved ? t("unsave") : t("save")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SchemeCard;
