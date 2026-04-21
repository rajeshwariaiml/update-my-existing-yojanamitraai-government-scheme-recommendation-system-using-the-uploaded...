import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, FileText, Loader2 } from "lucide-react";
import SchemeCard, { type SchemeResult } from "@/components/SchemeCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const states = ["All India", "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];
const occupations = ["Student", "Farmer", "Self-employed", "Salaried", "Unemployed", "Retired", "Homemaker", "Entrepreneur"];
const educationLevels = ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "PhD", "Diploma/ITI"];
const categories = ["General", "SC", "ST", "OBC", "EWS", "Minority"];

const FindSchemes = () => {
  const [nlpQuery, setNlpQuery] = useState("");
  const [formData, setFormData] = useState({ age: "", gender: "", income: "", occupation: "", education_level: "", state: "", category: "", goals: "" });
  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleNlpSearch = async () => {
    if (!nlpQuery.trim()) { toast({ title: "Please describe yourself", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-schemes", {
        body: { query: nlpQuery, mode: "nlp" },
      });
      if (error) throw error;
      setResults(data?.recommendations ?? []);
    } catch {
      toast({ title: "Error fetching recommendations", variant: "destructive" });
      // Fallback to local matching
      await handleLocalFallback(nlpQuery);
    }
    setLoading(false);
  };

  const handleFormSearch = async () => {
    if (!formData.age || !formData.state) { toast({ title: "Please fill age and state at minimum", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-schemes", {
        body: { profile: formData, mode: "form" },
      });
      if (error) throw error;
      setResults(data?.recommendations ?? []);
    } catch {
      await handleLocalFallback();
    }
    setLoading(false);
  };

  const handleLocalFallback = async (query?: string) => {
    // Fetch all schemes and do client-side matching
    const { data: schemes } = await supabase.from("schemes").select("*").eq("is_active", true);
    if (!schemes || schemes.length === 0) {
      setResults([]);
      return;
    }
    const age = parseInt(formData.age) || 25;
    const income = parseInt(formData.income) || 300000;

    const scored: SchemeResult[] = schemes.map((s: any) => {
      let score = 0;
      const missing: string[] = [];

      // Age check
      if (age >= (s.min_age || 0) && age <= (s.max_age || 100)) score += 20;
      else missing.push(`Age must be ${s.min_age}-${s.max_age}`);

      // Income check
      if (!s.income_limit || income <= s.income_limit) score += 20;
      else missing.push(`Income must be under ₹${s.income_limit?.toLocaleString()}`);

      // State check
      if (s.state === "All India" || s.state === formData.state) score += 15;
      else missing.push(`Must be from ${s.state}`);

      // Gender check
      if (s.gender === "All" || s.gender === formData.gender) score += 10;
      else missing.push(`${s.gender} applicants only`);

      // Education
      if (!s.education_level || s.education_level === formData.education_level) score += 15;

      // Occupation
      if (!s.occupation || s.occupation === formData.occupation) score += 10;

      // Category
      if (s.target_group === "All" || s.target_group?.toLowerCase().includes(formData.category?.toLowerCase() || "")) score += 10;

      score = Math.min(score, 98);
      const status = score >= 70 ? "eligible" : score >= 40 ? "partial" : "not_eligible";

      return {
        id: s.id,
        scheme_name: s.scheme_name,
        category: s.category,
        target_group: s.target_group,
        benefits: s.benefits,
        deadline: s.deadline,
        official_link: s.official_link,
        state: s.state,
        match_percentage: score,
        eligibility_status: status as SchemeResult["eligibility_status"],
        missing_criteria: missing,
        explanation: `Matched based on ${score >= 70 ? "strong" : "partial"} alignment with your age, income, and location profile.`,
      };
    });

    setResults(scored.sort((a, b) => b.match_percentage - a.match_percentage).slice(0, 10));
  };

  const handleSave = async (scheme: SchemeResult) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please login to save schemes" });
      return;
    }
    if (savedIds.has(scheme.id)) {
      await supabase.from("saved_schemes").delete().eq("user_id", session.user.id).eq("scheme_id", scheme.id);
      setSavedIds(prev => { const n = new Set(prev); n.delete(scheme.id); return n; });
      toast({ title: "Removed from saved schemes" });
    } else {
      await supabase.from("saved_schemes").insert({ user_id: session.user.id, scheme_id: scheme.id });
      setSavedIds(prev => new Set(prev).add(scheme.id));
      toast({ title: "Scheme saved!" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Find Government Schemes</h1>
            <p className="text-muted-foreground">Describe yourself naturally or fill in your details — our AI will find the best schemes for you.</p>
          </div>

          {!results ? (
            <Tabs defaultValue="conversational" className="animate-fade-up">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="conversational" className="gap-2"><MessageSquare className="h-4 w-4" /> Conversational</TabsTrigger>
                <TabsTrigger value="form" className="gap-2"><FileText className="h-4 w-4" /> Detailed Form</TabsTrigger>
              </TabsList>

              <TabsContent value="conversational">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <Label className="text-base font-display font-semibold">Tell us about yourself</Label>
                  <Textarea
                    placeholder='Example: "I am a 22-year-old female student from Karnataka, SC category, family income below 2 lakhs. I am looking for scholarships and education loans."'
                    className="min-h-[120px] text-sm"
                    value={nlpQuery}
                    onChange={e => setNlpQuery(e.target.value)}
                  />
                  <Button onClick={handleNlpSearch} disabled={loading} size="lg" className="w-full gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "Analyzing..." : "Find Matching Schemes"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="form">
                <div className="bg-card border border-border rounded-lg p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age *</Label>
                      <Input type="number" placeholder="e.g. 25" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select onValueChange={v => setFormData({ ...formData, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Annual Income (₹)</Label>
                      <Input type="number" placeholder="e.g. 200000" value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Occupation</Label>
                      <Select onValueChange={v => setFormData({ ...formData, occupation: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {occupations.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Education Level</Label>
                      <Select onValueChange={v => setFormData({ ...formData, education_level: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {educationLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select onValueChange={v => setFormData({ ...formData, state: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={v => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Goals</Label>
                      <Input placeholder="e.g. Higher education, Housing" value={formData.goals} onChange={e => setFormData({ ...formData, goals: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={handleFormSearch} disabled={loading} size="lg" className="w-full gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "Finding Schemes..." : "Get Recommendations"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">{results.length} Schemes Found</h2>
                  <p className="text-sm text-muted-foreground">Ranked by eligibility match</p>
                </div>
                <Button variant="outline" onClick={() => setResults(null)}>New Search</Button>
              </div>
              {results.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No schemes found. Try adjusting your criteria or add more scheme data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map(s => (
                    <SchemeCard key={s.id} scheme={s} onSave={handleSave} isSaved={savedIds.has(s.id)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindSchemes;
