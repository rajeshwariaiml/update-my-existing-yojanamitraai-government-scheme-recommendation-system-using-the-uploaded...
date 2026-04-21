import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Search, BarChart3, Bell, ArrowRight, CheckCircle2, Users, FileText, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: Sparkles, title: "AI-Powered Recommendations", desc: "Our NLP engine analyzes your profile to match you with the most relevant government schemes." },
  { icon: BarChart3, title: "Eligibility Gap Analysis", desc: "Understand exactly what criteria you meet and what steps you need to become fully eligible." },
  { icon: Bell, title: "Deadline Alerts", desc: "Never miss an application deadline with timely notifications for your saved schemes." },
  { icon: FileText, title: "Profile Autofill", desc: "Upload documents and let our system extract your demographic details automatically." },
];

const stats = [
  { value: "500+", label: "Government Schemes" },
  { value: "36", label: "States & UTs Covered" },
  { value: "15+", label: "Categories" },
  { value: "AI", label: "Powered Matching" },
];

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    {/* Hero */}
    <section className="relative pt-28 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.04 }} />
      <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl -z-10" />

      <div className="container mx-auto max-w-4xl text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6 border border-primary/15">
          <Shield className="h-4 w-4" /> Government Scheme Assistant
        </div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
          Find Government Schemes<br />
          <span className="text-gradient">You Are Eligible For</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Discover personalized welfare scheme recommendations using AI. Tell us about yourself and we'll find the best schemes matching your profile — with eligibility scoring, gap analysis, and explainable results.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/find-schemes">
            <Button size="lg" className="gap-2 px-8 h-12 text-base">
              <Search className="h-4 w-4" /> Check My Eligibility
            </Button>
          </Link>
          <Link to="/find-schemes">
            <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base">
              Explore Schemes <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-8 px-4 border-y border-border bg-card">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-3">How YojanaMitraAI Helps You</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Our intelligent system goes beyond simple search to provide personalized, explainable recommendations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-lg bg-card border border-border card-hover">
              <div className="w-11 h-11 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-bold text-center mb-12">Three Simple Steps</h2>
        <div className="space-y-6">
          {[
            { step: "1", title: "Share Your Profile", desc: "Enter your details or describe yourself naturally — age, income, occupation, state, goals." },
            { step: "2", title: "AI Analyzes Eligibility", desc: "Our recommendation engine matches your profile against 500+ government schemes using NLP and rule-based scoring." },
            { step: "3", title: "Get Personalized Results", desc: "View ranked schemes with match percentages, eligibility status, missing criteria, and direct apply links." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start bg-card border border-border rounded-lg p-5">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-display font-bold text-sm">{item.step}</span>
              </div>
              <div>
                <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-4">
      <div className="container mx-auto text-center max-w-2xl">
        <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-4">Ready to Find Your Schemes?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of citizens who have discovered schemes they didn't know they were eligible for.</p>
        <Link to="/find-schemes">
          <Button size="lg" className="gap-2 px-8 h-12">
            <CheckCircle2 className="h-4 w-4" /> Check Eligibility Now
          </Button>
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
