import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-white py-32">
      <div className="container relative z-10 mx-auto px-4">
        {/* Large Rounded Container matching the user's reference image */}
        <div className="mx-auto max-w-6xl rounded-[4rem] border border-zinc-200 bg-zinc-100/50 p-16 text-center shadow-2xl shadow-zinc-200/50 md:p-24 lg:p-32">
          
          <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-600 border border-zinc-200 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Step-by-Step AI Breakdowns · Available Now</span>
          </div>
          
          <h2 className="mb-10 text-5xl font-extrabold tracking-tight text-zinc-900 md:text-7xl lg:text-8xl leading-[1.1]">
            Ask a question. <br className="hidden md:block" />
            Get a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              step-by-step answer.
            </span>
          </h2>
          
          <p className="mx-auto mb-16 max-w-3xl text-xl text-zinc-500 md:text-2xl leading-relaxed">
            EduMentor AI remembers your conversation — ask follow-up questions, dig deeper into any step, and build real understanding at your own pace.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button size="lg" className="group h-16 rounded-full bg-zinc-900 px-10 text-xl font-bold text-white hover:bg-zinc-800 transition-all duration-300 shadow-xl shadow-zinc-900/20" asChild>
              <Link to="/ask-ai">
                Ask EduMentor AI Now
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 rounded-full border-zinc-300 bg-white px-10 text-xl font-bold text-zinc-900 hover:bg-zinc-50 shadow-sm" asChild>
              <Link to="/concept-simplifier">
                Try Concept Simplifier
              </Link>
            </Button>
          </div>
          
          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
             <div className="text-zinc-900 font-extrabold tracking-tighter text-2xl italic">MIT Tech</div>
             <div className="text-zinc-900 font-extrabold tracking-tighter text-2xl italic">Stanford Daily</div>
             <div className="text-zinc-900 font-extrabold tracking-tighter text-2xl italic">Turing Labs</div>
          </div>
        </div>
      </div>
    </section>
  );
}

