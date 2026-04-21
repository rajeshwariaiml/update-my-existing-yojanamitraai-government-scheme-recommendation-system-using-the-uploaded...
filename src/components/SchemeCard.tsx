import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

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
}

interface SchemeCardProps {
  scheme: SchemeResult;
  onSave?: (scheme: SchemeResult) => void;
  isSaved?: boolean;
}

const statusConfig = {
  eligible: { label: "Eligible", icon: CheckCircle2, className: "bg-civic-green-light text-civic-green" },
  partial: { label: "Partially Eligible", icon: AlertTriangle, className: "bg-civic-orange-light text-civic-orange" },
  not_eligible: { label: "Not Eligible", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
};

const SchemeCard = ({ scheme, onSave, isSaved }: SchemeCardProps) => {
  const status = statusConfig[scheme.eligibility_status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-card border border-border rounded-lg p-5 card-hover space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-card-foreground text-base leading-snug">{scheme.scheme_name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary" className="text-xs">{scheme.category}</Badge>
            <Badge variant="outline" className="text-xs">{scheme.target_group}</Badge>
            {scheme.state && <Badge variant="outline" className="text-xs">{scheme.state}</Badge>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-primary font-display">{scheme.match_percentage}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Match</div>
        </div>
      </div>

      <div className={`civic-badge ${status.className}`}>
        <StatusIcon className="h-3.5 w-3.5" />
        {status.label}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{scheme.benefits}</p>

      {scheme.explanation && (
        <div className="bg-civic-blue-light rounded-md p-3 text-xs text-foreground">
          <span className="font-semibold">Why recommended:</span> {scheme.explanation}
        </div>
      )}

      {scheme.missing_criteria && scheme.missing_criteria.length > 0 && (
        <div className="bg-civic-orange-light rounded-md p-3 text-xs space-y-1">
          <span className="font-semibold text-civic-orange">Missing criteria:</span>
          <ul className="list-disc list-inside text-foreground/80">
            {scheme.missing_criteria.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {scheme.deadline && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Deadline: <span className="font-medium text-foreground">{scheme.deadline}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {scheme.official_link && (
          <a href={scheme.official_link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" /> Apply Now
            </Button>
          </a>
        )}
        {onSave && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onSave(scheme)}>
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SchemeCard;
