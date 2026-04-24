import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  const location = useLocation();
  const { toast } = useToast();
  const t = useTranslation();

  // Determine active tab from URL query (?tab=saved|history|profile|notifications)
  const params = new URLSearchParams(location.search);
  const initialTab = params.get("tab") || (params.get("saved") === "true" ? "saved" : "saved");
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const tab = p.get("tab");
    if (tab && tab !== activeTab) setActiveTab(tab);
    else if (p.get("saved") === "true" && activeTab !== "saved") setActiveTab("saved");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Mark notifications as read when alerts tab opens
  useEffect(() => {
    if (activeTab !== "notifications") return;
    if (notifications.length === 0) return;
    if (!notifications.some(n => !n.is_read)) return;
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const merged = stored.map((n: any) => ({ ...n, is_read: true }));
      localStorage.setItem("notifications", JSON.stringify(merged));
    } catch (e) {
      console.error("notifications mark-read failed", e);
    }
  }, [activeTab, notifications]);

  // Local storage helpers (fallback for unauthenticated demo flow)
  const loadLocalProfile = () => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  };

  const loadLocalSaved = (): SchemeResult[] => {
    try {
      const raw = localStorage.getItem("savedSchemes");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const loadLocalHistory = (): SchemeResult[] => {
    try {
      const raw = localStorage.getItem("schemeHistory");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const loadLocalNotifications = (): any[] => {
    try {
      const raw = localStorage.getItem("notifications");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const hydrateFromLocal = () => {
    const localProfile = loadLocalProfile();
    if (localProfile) {
      setProfile(localProfile);
      setProfileForm({
        full_name: localProfile.full_name || "",
        age: localProfile.age?.toString() || "",
        gender: localProfile.gender || "",
        income: localProfile.income?.toString() || "",
        occupation: localProfile.occupation || "",
        education_level: localProfile.education_level || "",
        state: localProfile.state || "",
        district: localProfile.district || "",
        category: localProfile.category || "",
      });
    }
    setSavedSchemes(loadLocalSaved());
    setRecentRecs(loadLocalHistory());
    setNotifications(loadLocalNotifications());
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadData(session.user.id);
      } else {
        // Demo / unauthenticated mode — use localStorage so UI still works
        hydrateFromLocal();
        setLoading(false);
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadData(session.user.id);
      } else {
        setUser(null);
        hydrateFromLocal();
        setLoading(false);
      }
    });

    // Refresh when other tabs / pages change localStorage
    const onStorage = () => hydrateFromLocal();
    window.addEventListener("storage", onStorage);
    // Refresh on focus so saves from FindSchemes show up immediately
    const onFocus = () => { if (!user) hydrateFromLocal(); };
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
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
      } else {
        // Fall back to local profile if backend has none
        const localProfile = loadLocalProfile();
        if (localProfile) {
          setProfileForm({
            full_name: localProfile.full_name || "",
            age: localProfile.age?.toString() || "",
            gender: localProfile.gender || "",
            income: localProfile.income?.toString() || "",
            occupation: localProfile.occupation || "",
            education_level: localProfile.education_level || "",
            state: localProfile.state || "",
            district: localProfile.district || "",
            category: localProfile.category || "",
          });
        }
      }

      if (savedRes.data && savedRes.data.length > 0) {
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
      } else {
        setSavedSchemes(loadLocalSaved());
      }

      if (recsRes.data && recsRes.data.length > 0) {
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
      } else {
        setRecentRecs(loadLocalHistory());
      }

      const localNotifs = loadLocalNotifications();
      setNotifications([...(notifRes.data ?? []), ...localNotifs]);
    } catch (e) {
      console.error("loadData error", e);
      hydrateFromLocal();
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    // Build the profile payload once
    const payload = {
      full_name: profileForm.full_name || null,
      age: profileForm.age ? parseInt(profileForm.age) : null,
      gender: profileForm.gender || null,
      income: profileForm.income ? parseInt(profileForm.income) : null,
      occupation: profileForm.occupation || null,
      education_level: profileForm.education_level || null,
      state: profileForm.state || null,
      district: profileForm.district || null,
      category: profileForm.category || null,
    };

    // Always persist locally so refresh restores values even if backend fails
    try {
      localStorage.setItem("userProfile", JSON.stringify(payload));
    } catch (e) {
      console.error("localStorage save failed", e);
    }

    if (user) {
      try {
        const { error } = await supabase
          .from("user_profiles")
          .upsert({ user_id: user.id, ...payload }, { onConflict: "user_id" });
        if (error) throw error;
        toast({ title: t("toast_profile_updated") });
        return;
      } catch (e) {
        console.error("Backend profile save failed, using localStorage", e);
        toast({ title: t("toast_profile_saved_local") });
        return;
      }
    }

    toast({ title: t("toast_profile_saved") });
  };

  const handleToggleSavedScheme = async (scheme: SchemeResult) => {
    const exists = savedSchemes.some((item) => item.id === scheme.id);
    const updated = exists
      ? savedSchemes.filter((item) => item.id !== scheme.id)
      : [scheme, ...savedSchemes];

    setSavedSchemes(updated);

    try {
      localStorage.setItem("savedSchemes", JSON.stringify(updated));
    } catch (e) {
      console.error("saved schemes localStorage update failed", e);
    }

    try {
      if (!user) return;
      if (exists) {
        await supabase.from("saved_schemes").delete().eq("user_id", user.id).eq("scheme_id", scheme.id);
      } else {
        await supabase.from("saved_schemes").insert({ user_id: user.id, scheme_id: scheme.id });
      }
    } catch (e) {
      console.error("saved schemes backend sync failed", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const displayName = profileForm.full_name || user?.email?.split("@")[0] || t("default_citizen_name");

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
            <button
              type="button"
              onClick={() => { setActiveTab("saved"); navigate("/dashboard?tab=saved"); }}
              className="text-left p-5 rounded-lg bg-card border border-border card-hover flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{t("saved_schemes")}</h3>
                <p className="text-xs text-muted-foreground">{t("saved_count", { count: savedSchemes.length })}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("notifications"); navigate("/dashboard?tab=notifications"); }}
              className="text-left p-5 rounded-lg bg-card border border-border card-hover flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="w-10 h-10 rounded-lg bg-civic-orange/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-civic-orange" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">{t("notifications")}</h3>
                <p className="text-xs text-muted-foreground">{t("unread_count", { count: notifications.filter(n => !n.is_read).length })}</p>
              </div>
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); navigate(`/dashboard?tab=${v}`, { replace: true }); }} className="animate-fade-up">
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
                  {savedSchemes.map(s => <SchemeCard key={s.id} scheme={s} onSave={handleToggleSavedScheme} isSaved />)}
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
