import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bookmark, Clock, Bell, User, Loader2 } from "lucide-react";
import SchemeCard, { type SchemeResult } from "@/components/SchemeCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupaUser } from "@supabase/supabase-js";
import { useTranslation } from "@/context/LanguageContext";

const Dashboard = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setProfile] = useState<any>(null);
  const [savedSchemes, setSavedSchemes] = useState<SchemeResult[]>([]);
  const [recentRecs, setRecentRecs] = useState<SchemeResult[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ full_name: "", age: "", gender: "", income: "", occupation: "", education_level: "", state: "", district: "", category: "" });
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useTranslation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { navigate("/login"); return; }
      setUser(session.user);
      loadData(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate("/login"); return; }
      setUser(session.user);
      loadData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    setLoading(true);
    const [profileRes, savedRes, recsRes, notifRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("saved_schemes").select("*, schemes(*)").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("recommendations").select("*, schemes(*)").eq("user_id", userId).order("created_at", { ascending: false }).limit(6),
      supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setProfileForm({
        full_name: profileRes.data.full_name || "",
        age: profileRes.data.age?.toString() || "",
        gender: profileRes.data.gender || "",
        income: profileRes.data.income?.toString() || "",
        occupation: profileRes.data.occupation || "",
        education_level: profileRes.data.education_level || "",
        state: profileRes.data.state || "",
        district: profileRes.data.district || "",
        category: profileRes.data.category || "",
      });
    }

    if (savedRes.data) {
      setSavedSchemes(savedRes.data.map((s: any) => ({
        id: s.schemes.id,
        scheme_name: s.schemes.scheme_name,
        category: s.schemes.category,
        target_group: s.schemes.target_group,
        benefits: s.schemes.benefits,
        deadline: s.schemes.deadline,
        official_link: s.schemes.official_link,
        state: s.schemes.state,
        match_percentage: 0,
        eligibility_status: "partial" as const,
      })));
    }

    if (recsRes.data) {
      setRecentRecs(recsRes.data.map((r: any) => ({
        id: r.schemes.id,
        scheme_name: r.schemes.scheme_name,
        category: r.schemes.category,
        target_group: r.schemes.target_group,
        benefits: r.schemes.benefits,
        deadline: r.schemes.deadline,
        official_link: r.schemes.official_link,
        state: r.schemes.state,
        match_percentage: r.match_percentage,
        eligibility_status: r.eligibility_status as SchemeResult["eligibility_status"],
        missing_criteria: r.missing_criteria,
        explanation: r.explanation,
      })));
    }

    setNotifications(notifRes.data ?? []);
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      full_name: profileForm.full_name || null,
      age: profileForm.age ? parseInt(profileForm.age) : null,
      gender: profileForm.gender || null,
      income: profileForm.income ? parseInt(profileForm.income) : null,
      occupation: profileForm.occupation || null,
      education_level: profileForm.education_level || null,
      state: profileForm.state || null,
      district: profileForm.district || null,
      category: profileForm.category || null,
    });
    if (error) toast({ title: "Error saving profile", variant: "destructive" });
    else toast({ title: "Profile updated!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const displayName = profileForm.full_name || user?.email?.split("@")[0] || "Citizen";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 animate-fade-up">
            <h1 className="font-display text-3xl font-bold mb-1">{t("welcome")}, {displayName}</h1>
            <p className="text-muted-foreground">{t("personalized_dashboard")}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Link to="/find-schemes" className="p-5 rounded-lg bg-card border border-border card-hover flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{t("find_schemes")}</h3>
                <p className="text-xs text-muted-foreground">{t("discover_new_schemes")}</p>
              </div>
            </Link>
            <div className="p-5 rounded-lg bg-card border border-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{t("saved_schemes")}</h3>
                <p className="text-xs text-muted-foreground">{t("saved_count", { count: savedSchemes.length })}</p>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-card border border-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-civic-orange/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-civic-orange" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{t("notifications")}</h3>
                <p className="text-xs text-muted-foreground">{t("unread_count", { count: notifications.filter(n => !n.is_read).length })}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="saved" className="animate-fade-up">
            <TabsList className="mb-6">
              <TabsTrigger value="saved" className="gap-1.5"><Bookmark className="h-4 w-4" /> {t("saved")}</TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5"><Clock className="h-4 w-4" /> {t("history")}</TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" /> {t("profile")}</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" /> {t("alerts")}</TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              {savedSchemes.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>{t("no_saved_schemes")} <Link to="/find-schemes" className="text-primary hover:underline">{t("find_schemes_to_save")}</Link></p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedSchemes.map(s => <SchemeCard key={s.id} scheme={s} isSaved />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {recentRecs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>{t("no_history")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentRecs.map(r => <SchemeCard key={r.id} scheme={r} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <div className="bg-card border border-border rounded-lg p-6 max-w-2xl space-y-4">
                <h3 className="font-display font-semibold text-lg">{t("your_profile")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("name")}</Label>
                    <Input value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("age")}</Label>
                    <Input type="number" value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("gender")}</Label>
                    <Select value={profileForm.gender} onValueChange={v => setProfileForm({ ...profileForm, gender: v })}>
                      <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t("male")}</SelectItem>
                        <SelectItem value="Female">{t("female")}</SelectItem>
                        <SelectItem value="Other">{t("other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("income")}</Label>
                    <Input type="number" value={profileForm.income} onChange={e => setProfileForm({ ...profileForm, income: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("state")}</Label>
                    <Input value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("district")}</Label>
                    <Input value={profileForm.district} onChange={e => setProfileForm({ ...profileForm, district: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("occupation")}</Label>
                    <Input value={profileForm.occupation} onChange={e => setProfileForm({ ...profileForm, occupation: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("category")}</Label>
                    <Input value={profileForm.category} onChange={e => setProfileForm({ ...profileForm, category: e.target.value })} />
                  </div>
                </div>
                <Button onClick={saveProfile} className="gap-2"><User className="h-4 w-4" /> {t("save_profile")}</Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>{t("no_notifications")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-lg border ${n.is_read ? "bg-card border-border" : "bg-civic-blue-light border-primary/20"}`}>
                      <h4 className="font-display font-semibold text-sm">{n.title || t("upcoming_deadline")}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
