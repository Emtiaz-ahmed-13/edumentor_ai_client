import { ChartBar, FileSearch, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Ask Any Question",
      description: "Type your question — whether it's a concept, formula, theory, or follow-up from a previous answer. Conversation history is preserved so the AI always has context.",
      icon: <FileSearch className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      link: null
    },
    {
      number: "02",
      title: "Get Step-by-Step Breakdown",
      description: "EduMentor AI returns a logical, numbered breakdown of every answer — plus an analogy, real-life example, and key takeaways — all in one structured response.",
      icon: <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      link: { label: "Try Ask AI →", to: "/ask-ai" }
    },
    {
      number: "03",
      title: "Assess & Optimize Growth",
      description: "Take AI-generated quizzes, review qualitative answer feedback, and track your personalized productivity and mastery via the analytics dashboard.",
      icon: <ChartBar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      link: null
    }
  ];

  return (
    <section id="how-it-works" className="py-12 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Workflow of Mastery</h2>
            <p className="text-base text-muted-foreground mb-6 max-w-xl leading-relaxed">
              We leverage sophisticated AI infrastructure to bridge the gap between information and understanding, creating a seamless, data-driven learning cycle.
            </p>

            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                      {step.icon}
                    </div>
                    {idx !== steps.length - 1 && (
                      <div className="w-px h-full bg-border mt-4 absolute top-16 group-hover:bg-primary/30 transition-colors"></div>
                    )}
                  </div>
                  <div className="pb-10">
                    <span className="text-sm font-bold tracking-widest text-primary/70 mb-2 block uppercase">Step {step.number}</span>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">{step.description}</p>
                    {step.link && (
                      <Link
                        to={step.link.to}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-all"
                      >
                        {step.link.label}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative hidden md:block">
             <div className="aspect-square rounded-[4rem] bg-gradient-to-tr from-primary/10 via-blue-500/5 to-emerald-500/5 border border-border p-3 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                
                {/* Simulated AI Interface Elements */}
                <div className="absolute top-[15%] left-[10%] right-[10%] p-6 rounded-2xl bg-card/90 backdrop-blur shadow-xl border border-border transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="h-4 w-40 bg-muted rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-muted/60 rounded-full"></div>
                    <div className="h-2 w-[90%] bg-muted/60 rounded-full"></div>
                    <div className="h-2 w-[75%] bg-muted/60 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-[20%] left-[20%] right-[5%] p-6 rounded-2xl bg-card/90 backdrop-blur shadow-2xl border border-border transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 w-24 bg-muted rounded-full"></div>
                    <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-tight">System Optimized</div>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    <div className="flex-1 bg-primary/20 rounded-t-lg h-[40%] animate-in slide-in-from-bottom duration-700"></div>
                    <div className="flex-1 bg-primary/40 rounded-t-lg h-[65%] animate-in slide-in-from-bottom duration-700 delay-100"></div>
                    <div className="flex-1 bg-primary/60 rounded-t-lg h-[85%] animate-in slide-in-from-bottom duration-700 delay-200"></div>
                    <div className="flex-1 bg-primary/80 rounded-t-lg h-[55%] animate-in slide-in-from-bottom duration-700 delay-300"></div>
                  </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
