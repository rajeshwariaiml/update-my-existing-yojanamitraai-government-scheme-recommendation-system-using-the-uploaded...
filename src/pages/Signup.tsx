import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "@/context/LanguageContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useTranslation();

  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);

    if (error) {
      let description = error.message;
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        description = "An account with this email already exists. Please sign in instead.";
      }
      toast({ title: "Signup Failed", description, variant: "destructive" });
      return;
    }

    if (data?.user) {
      toast({
        title: "🎉 Account Created Successfully!",
        description: `Welcome, ${fullName}! Redirecting to your dashboard...`,
      });
      setTimeout(() => navigate("/dashboard"), 1200);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, hsl(220 72% 97%) 0%, hsl(210 20% 98%) 50%, hsl(152 40% 96%) 100%)" }}>
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-[var(--shadow-card)] animate-fade-up">
        <div className="flex justify-end mb-2"><LanguageToggle /></div>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">YojanaMitraAI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">{t("create_account")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("create_account_sub")}</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <p className="text-xs text-muted-foreground">{t("password_hint")}</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? t("creating_account") : t("signup")}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("have_account")} <Link to="/login" className="text-primary font-medium hover:underline">{t("sign_in")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
