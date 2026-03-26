import {
    BarChart3,
    Bell,
    BrainCircuit,
    CheckSquare,
    Code,
    FileText,
    Layers,
    Lightbulb,
    LineChart,
    MessageSquare,
    Mic,
    SearchIcon,
    Sliders,
    Sparkles,
    Target,
    Timer,
    Volume2
} from "lucide-react";
import { Link } from "react-router";

const FeatureCard = ({ title, description, icon, color, href, className = "" }) => (
  <div className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-0.5 ${className}`}>
    {/* Subtle gradient background on hover */}
    <div className={`absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-5 ${color}`} />
    
    <div className="relative z-10">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg`}>
        {icon}
      </div>
      <h3 className="mb-2 text-base font-bold text-zinc-900 transition-colors">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-500 transition-colors">
        {description}
      </p>
      {href && (
        <Link
          to={href}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-all"
        >
          Try it →
        </Link>
      )}
    </div>

    {/* Decorative corner element */}
    <div className="absolute right-4 top-4 h-12 w-12 opacity-5 transition-opacity group-hover:opacity-10 text-zinc-900">
       <Sparkles className="h-full w-full" />
    </div>
  </div>
);

export default function Features() {
  const sections = [
    {
      title: "Core Intelligence",
      subtitle: "The engine behind your academic success.",
      features: [
        {
          title: "Adaptive Questioning",
          description: "Ask any question and get logical, step-by-step breakdowns with numbered reasoning — just like a real tutor.",
          icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
          color: "from-blue-500 to-transparent",
          size: "lg",
          href: "/ask-ai"
        },
        {
          title: "Intelligent Mentor",
          description: "Analyze and optimize programming logic with real-time feedback.",
          icon: <Code className="h-6 w-6 text-indigo-600" />,
          color: "from-indigo-600 to-transparent",
          size: "sm"
        },
        {
          title: "Contextual Memory",
          description: "Full conversation history sent on every request — ask follow-up questions and the AI remembers exactly what you discussed.",
          icon: <BrainCircuit className="h-6 w-6 text-cyan-600" />,
          color: "from-cyan-500 to-transparent",
          size: "sm",
          href: "/ask-ai"
        },
        {
          title: "Concept Simplifier",
          description: "Abstract theories made simple through practical analogies.",
          icon: <Lightbulb className="h-6 w-6 text-amber-600" />,
          color: "from-amber-500 to-transparent",
          size: "md",
          href: "/concept-simplifier"
        }
      ]
    },
    {
      title: "Dynamic Interaction",
      subtitle: "Multi-modal learning bridging text, doc, and voice.",
      features: [
        {
          title: "RAG Summarization",
          description: "Intelligent extraction and generation from PDF materials.",
          icon: <FileText className="h-6 w-6 text-purple-600" />,
          color: "from-purple-500 to-transparent",
          size: "md"
        },
        {
          title: "Doc Intelligence",
          description: "Query specific details with high-precision contextual retrieval.",
          icon: <SearchIcon className="h-6 w-6 text-pink-600" />,
          color: "from-pink-500 to-transparent",
          size: "sm"
        },
        {
          title: "Neural Voice",
          description: "High-fidelity AI voice output for hands-free learning.",
          icon: <Volume2 className="h-6 w-6 text-violet-600" />,
          color: "from-violet-500 to-transparent",
          size: "lg"
        },
        {
          title: "Speech Input",
          description: "Advanced speech-to-text for intuitive question phrasing.",
          icon: <Mic className="h-6 w-6 text-fuchsia-600" />,
          color: "from-fuchsia-500 to-transparent",
          size: "sm",
          href: "/voice"
        }
      ]
    },
    {
      title: "Strategic Growth",
      subtitle: "Data-driven insights to measure and optimize goals.",
      features: [
        {
          title: "Dynamic Quiz Engine",
          description: "Customized assessments generated automatically from your notes.",
          icon: <CheckSquare className="h-6 w-6 text-emerald-600" />,
          color: "from-emerald-500 to-transparent",
          size: "sm"
        },
        {
          title: "Skill Gap Detection",
          description: "Identify weak topics automatically through performance analysis.",
          icon: <LineChart className="h-6 w-6 text-green-600" />,
          color: "from-green-500 to-transparent",
          size: "lg"
        },
        {
          title: "AI Evaluation",
          description: "Qualitative feedback and scoring on descriptive answers.",
          icon: <Layers className="h-6 w-6 text-teal-600" />,
          color: "from-teal-500 to-transparent",
          size: "md"
        },
        {
          title: "Adaptive Logic",
          description: "Content that scales based on your learning progression.",
          icon: <Sliders className="h-6 w-6 text-lime-600" />,
          color: "from-lime-600 to-transparent",
          size: "sm"
        },
        {
          title: "Study Modes",
          description: "Pomodoro, Active Recall, and Spaced Repetition frameworks.",
          icon: <Timer className="h-6 w-6 text-orange-600" />,
          color: "from-orange-600 to-transparent",
          size: "sm"
        },
        {
          title: "Smart Reminders",
          description: "Context-aware notifications for scheduled revisions.",
          icon: <Bell className="h-6 w-6 text-red-600" />,
          color: "from-red-600 to-transparent",
          size: "md"
        },
        {
          title: "Analytics Hub",
          description: "Track velocity, accuracy, and overall growth metrics.",
          icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
          color: "from-blue-400 to-transparent",
          size: "sm"
        },
        {
          title: "Goal Coaching",
          description: "Personal milestones and productivity index monitoring.",
          icon: <Target className="h-6 w-6 text-indigo-600" />,
          color: "from-indigo-400 to-transparent",
          size: "sm"
        }
      ]
    }
  ];

  return (
    <section id="features" className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Learning Engineering</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-500">
            A surgical, high-precision ecosystem of 16 intelligent features designed to prioritize your academic evolution.
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, sidx) => (
            <div key={sidx} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
                <div className="text-center px-4">
                   <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-[0.2em]">{section.title}</h3>
                   <p className="text-sm text-zinc-500 mt-1">{section.subtitle}</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-flow-row-dense">
                {section.features.map((feature, fidx) => (
                  <FeatureCard 
                    key={fidx} 
                    {...feature} 
                    className={
                      feature.size === "lg" ? "md:col-span-2 md:row-span-2" : 
                      feature.size === "md" ? "md:col-span-2" : ""
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
