import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/30 py-10 px-4">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">YojanaMitraAI</span>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered government scheme recommendation system. Helping citizens discover welfare schemes they are eligible for.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
            <li><a href="/find-schemes" className="hover:text-foreground transition-colors">Find Schemes</a></li>
            <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">About</h4>
          <p className="text-sm text-muted-foreground">YojanaMitraAI is an AI-powered platform that uses NLP and eligibility matching to recommend government schemes personalized for every citizen.</p>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} YojanaMitraAI. All rights reserved. Built for public welfare.
      </div>
    </div>
  </footer>
);

export default Footer;
