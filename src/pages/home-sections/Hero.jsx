import dashboardMockup from "@/assets/dashboard-mockup.png";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-40 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium mb-4 border border-border pb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Step-by-Step AI Breakdowns · Follow-up Questions · Powered by Gemini</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground max-w-5xl mx-auto leading-[1.1]">
          Master Any Subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">EduMentor AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
          Ask any question and receive logical, step-by-step breakdowns with full conversation memory — so you can ask follow-ups just like talking to a real tutor.
        </p>
        
        <div className="flex justify-center gap-4 flex-col sm:flex-row">
          <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25" asChild>
            <Link to="/ask-ai">
              Ask EduMentor AI
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full" asChild>
            <a href="#features">
              Explore Features
            </a>
          </Button>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-10 mx-auto max-w-5xl relative group">
          <div className="rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden p-2 transition-all duration-700 hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] hover:-translate-y-2">
            <div className="rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 relative">
               <img 
                 src={dashboardMockup} 
                 alt="EduMentor AI Dashboard" 
                 className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
               />
               
               {/* Surface reflection effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
            
            {/* Soft accent glows behind the mockup */}
            <div className="absolute -top-20 -left-20 -z-10 h-64 w-64 rounded-full bg-blue-400/10 blur-[100px] opacity-60"></div>
            <div className="absolute -bottom-20 -right-20 -z-10 h-64 w-64 rounded-full bg-purple-400/10 blur-[100px] opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
