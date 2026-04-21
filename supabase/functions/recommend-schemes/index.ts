import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, profile, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active schemes
    const { data: schemes, error: schemeErr } = await supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true);

    if (schemeErr || !schemes || schemes.length === 0) {
      return new Response(JSON.stringify({ recommendations: [], message: "No schemes available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If we have an AI key, use AI for NLP mode
    if (LOVABLE_API_KEY && mode === "nlp" && query) {
      const schemeSummary = schemes.map(s =>
        `ID:${s.id}|Name:${s.scheme_name}|Cat:${s.category}|Target:${s.target_group}|Income:${s.income_limit || 'none'}|Age:${s.min_age}-${s.max_age}|State:${s.state}|Gender:${s.gender}|Edu:${s.education_level || 'any'}|Occ:${s.occupation || 'any'}|Benefits:${s.benefits}`
      ).join("\n");

      const systemPrompt = `You are YojanaMitraAI, an expert government scheme recommendation engine for India.
Given a user's natural language description and a list of government schemes, analyze eligibility and return recommendations.

SCHEMES DATABASE:
${schemeSummary}

Return a JSON array of recommendations. For each scheme, include:
- id (scheme ID from database)
- match_percentage (0-100)
- eligibility_status ("eligible", "partial", or "not_eligible")
- missing_criteria (array of strings describing what's missing)
- explanation (why this scheme is recommended)

Only include schemes with match_percentage >= 30.
Sort by match_percentage descending.
Return at most 10 results.
IMPORTANT: Return ONLY valid JSON array, no other text.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "[]";
          // Extract JSON from response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const aiRecs = JSON.parse(jsonMatch[0]);
            // Enrich with scheme data
            const enriched = aiRecs.map((rec: any) => {
              const scheme = schemes.find(s => s.id === rec.id);
              if (!scheme) return null;
              return {
                id: scheme.id,
                scheme_name: scheme.scheme_name,
                category: scheme.category,
                target_group: scheme.target_group,
                benefits: scheme.benefits,
                deadline: scheme.deadline,
                official_link: scheme.official_link,
                state: scheme.state,
                match_percentage: rec.match_percentage,
                eligibility_status: rec.eligibility_status,
                missing_criteria: rec.missing_criteria || [],
                explanation: rec.explanation || "",
              };
            }).filter(Boolean);

            return new Response(JSON.stringify({ recommendations: enriched }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (aiErr) {
        console.error("AI error, falling back to rule-based:", aiErr);
      }
    }

    // Rule-based fallback
    const age = profile?.age ? parseInt(profile.age) : 25;
    const income = profile?.income ? parseInt(profile.income) : 300000;
    const gender = profile?.gender || "All";
    const state = profile?.state || "All India";
    const occupation = profile?.occupation || "";
    const education = profile?.education_level || "";
    const category = profile?.category || "";

    const scored = schemes.map((s: any) => {
      let score = 0;
      const missing: string[] = [];

      if (age >= (s.min_age || 0) && age <= (s.max_age || 100)) score += 20;
      else missing.push(`Age must be ${s.min_age}-${s.max_age}`);

      if (!s.income_limit || income <= s.income_limit) score += 20;
      else missing.push(`Income must be under ₹${s.income_limit?.toLocaleString()}`);

      if (s.state === "All India" || s.state === state) score += 15;
      else missing.push(`Must be from ${s.state}`);

      if (s.gender === "All" || s.gender === gender) score += 10;
      else missing.push(`${s.gender} applicants only`);

      if (!s.education_level || s.education_level === education) score += 15;
      if (!s.occupation || s.occupation === occupation) score += 10;
      if (s.target_group === "All" || s.target_group?.toLowerCase().includes(category.toLowerCase())) score += 10;

      score = Math.min(score, 98);
      const status = score >= 70 ? "eligible" : score >= 40 ? "partial" : "not_eligible";

      return {
        id: s.id, scheme_name: s.scheme_name, category: s.category,
        target_group: s.target_group, benefits: s.benefits, deadline: s.deadline,
        official_link: s.official_link, state: s.state,
        match_percentage: score, eligibility_status: status,
        missing_criteria: missing,
        explanation: `Matched based on ${score >= 70 ? "strong" : "partial"} alignment with your demographic profile.`,
      };
    });

    const filtered = scored.filter((s: any) => s.match_percentage >= 30)
      .sort((a: any, b: any) => b.match_percentage - a.match_percentage)
      .slice(0, 10);

    return new Response(JSON.stringify({ recommendations: filtered }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
