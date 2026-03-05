import { Brain, Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                EduMentor AI
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Empowering students and educators with adaptive, AI-driven learning tools that personalize the educational journey.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Group 1 */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>

          {/* Links Group 2 */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Links Group 3 */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduMentor AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>Designed with ❤️ by Emtiaz</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
