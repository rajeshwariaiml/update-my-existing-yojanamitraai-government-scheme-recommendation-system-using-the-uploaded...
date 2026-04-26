import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  className?: string;
}

const LanguageToggle = ({ className }: Props) => {
  const { language, toggleLanguage } = useLanguage();
  const isEn = language === "en";
  // Show the TARGET language so it's unambiguous what the click will do.
  const actionLabel = isEn ? "ಕನ್ನಡ" : "English";
  const currentLabel = isEn ? "EN" : "KN";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`gap-1.5 ${className ?? ""}`}
      aria-label={isEn ? "Switch to Kannada" : "Switch to English"}
      title={isEn ? "Switch to Kannada" : "Switch to English"}
      data-allow-english
    >
      <Languages className="h-4 w-4" />
      <span className="text-muted-foreground text-xs font-semibold">{currentLabel}</span>
      <span className="text-muted-foreground">→</span>
      <span className="font-medium">{actionLabel}</span>
    </Button>
  );
};

export default LanguageToggle;
