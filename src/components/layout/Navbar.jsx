import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/clerk-react";
import { 
  Brain, 
  Menu, 
  ChevronDown, 
  FileText, 
  Layers, 
  MessageCircle, 
  Terminal, 
  Lightbulb, 
  ClipboardList, 
  CheckCircle, 
  Activity, 
  Timer,
  Sparkles,
  Zap,
  BookOpen
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import NotificationCenter from "./NotificationCenter";

const FEATURE_GROUPS = [
  {
    title: "AI Studio",
    icon: Sparkles,
    links: [
      { name: "Note Summarizer", href: "/notes", icon: FileText, desc: "AI-powered PDF summaries" },
      { name: "Document IQ", href: "/document-qa", icon: Layers, desc: "Chat with your files" },
      { name: "Ask AI", href: "/ask-ai", icon: MessageCircle, desc: "Personal logic tutor" },
      { name: "Code Optimizer", href: "/code-ai", icon: Terminal, desc: "Debug & clean code" },
      { name: "Concept Simplifier", href: "/concept-simplifier", icon: Lightbulb, desc: "ELIs format conversion" },
    ]
  },
  {
    title: "Assessments",
    icon: Zap,
    links: [
      { name: "Quiz Generator", href: "/quiz", icon: ClipboardList, desc: "Generate custom tests" },
      { name: "Answer Evaluator", href: "/evaluate", icon: CheckCircle, desc: "AI descriptive grading" },
    ]
  },
  {
    title: "Growth",
    icon: Activity,
    links: [
      { name: "Skill Gap", href: "/skill-gap", icon: BookOpen, desc: "Track progress & gaps" },
      { name: "Study Modes", href: "/study-modes", icon: Timer, desc: "Pomodoro & Active Recall" },
    ]
  }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Brain className="w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter text-foreground">
            EduMentor <span className="text-primary italic">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {FEATURE_GROUPS.map((group) => (
            <div 
              key={group.title}
              className="relative group/menu"
              onMouseEnter={() => setActiveDropdown(group.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-primary hover:bg-primary/5 transition-all">
                <group.icon className="w-4 h-4" />
                {group.title}
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === group.title ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Card */}
              <div className={`absolute top-full left-0 mt-2 w-72 p-3 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl transition-all duration-300 origin-top-left ${
                activeDropdown === group.title ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}>
                {/* Hover Bridge */}
                <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                
                <div className="grid gap-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group/item"
                    >
                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                        <link.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-white">{link.name}</div>
                        <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{link.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Static Links */}
          <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-4" />
          
          <a href="#features" className="px-5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="px-5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Manual</a>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="hidden sm:block">
              <NotificationCenter />
            </div>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/50 transition-all shadow-xl"
                }
              }}
            />
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden sm:flex rounded-full px-6 font-black text-xs uppercase tracking-widest">Log In</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="rounded-full px-8 h-11 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">Get Started</Button>
            </SignInButton>
          </SignedOut>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] bg-white dark:bg-zinc-950 p-0 border-l-0">
                <div className="p-8 space-y-8 h-full overflow-y-auto">
                  <div className="flex items-center gap-3 pt-4 mb-12">
                     <Brain className="w-8 h-8 text-primary" />
                     <span className="font-black text-2xl tracking-tighter">EduMentor AI</span>
                  </div>

                  {FEATURE_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 pl-2">{group.title}</h3>
                      <div className="grid gap-2">
                        {group.links.map((link) => (
                          <Link
                            key={link.name}
                            to={link.href}
                            className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-transparent hover:border-primary/20 transition-all"
                          >
                            <link.icon className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold">{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
