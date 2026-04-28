import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translateMissingCriterion } from "@/lib/translateScheme";
import { localizeSchemeObject } from "@/lib/localizeSchemeObject";

const asArray = (value?: string[] | string | null) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

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
}

interface SchemeCardProps {
  scheme: SchemeResult;
  onSave?: (scheme: SchemeResult) => void;
  isSaved?: boolean;
}

const SchemeCard = ({ scheme: rawScheme, onSave, isSaved }: SchemeCardProps) => {
  const { language, t } = useLanguage();
  const scheme = localizeSchemeObject(rawScheme, language);

  const statusConfig = {
    eligible: { label: t("eligible"), icon: CheckCircle2, className: "bg-civic-green-light text-civic-green" },
    partial: { label: t("partially_eligible"), icon: AlertTriangle, className: "bg-civic-orange-light text-civic-orange" },
    not_eligible: { label: t("not_eligible"), icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
  } as const;

  const status = statusConfig[scheme.eligibility_status];
  const StatusIcon = status.icon;

  const displayTitle = scheme.title;
  const displayBenefits = scheme.benefits;
  const displayDescription = scheme.description;
  const displayExplanation = scheme.explanation;
  const displayEligibility = scheme.eligibility;
  const displayCategory = scheme.category;
  const displayTarget = scheme.target_group;
  const displayState = scheme.state;
  const metadataBadges = [
    displayCategory,
    displayTarget,
    displayState,
    scheme.scope,
    scheme.audience,
    scheme.scheme_type,
    scheme.region,
    ...asArray(scheme.beneficiary_labels),
    ...asArray(scheme.tags),
  ].filter((value, index, list) => value && list.indexOf(value) === index);

  return (
    <div className="bg-card border border-border rounded-lg p-5 card-hover space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-card-foreground text-base leading-snug">{displayTitle}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {metadataBadges.map((label, index) => (
              <Badge
                key={`${label}-${index}`}
                variant={index === 0 ? "secondary" : "outline"}
                className="text-xs"
                data-meta-field="true"
              >
                {label}
              </Badge>
            ))}
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
        {t("deadline")} <span className="font-medium text-foreground">{scheme.deadline || scheme.deadline_label || t("ongoing")}</span>
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
