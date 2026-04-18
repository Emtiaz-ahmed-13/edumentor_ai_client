import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from "@clerk/clerk-react";
import { Brain, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Note Summarizer", href: "/notes", isInternal: true },
    { name: "Document IQ", href: "/document-qa", isInternal: true },
    { name: "Study Modes", href: "/study-modes", isInternal: true },
    { name: "Skill Gap", href: "/skill-gap", isInternal: true },
    { name: "Quiz Generator", href: "/quiz", isInternal: true },
    { name: "Answer Evaluator", href: "/evaluate", isInternal: true },
    { name: "Concept Simplifier", href: "/concept-simplifier", isInternal: true },
    { name: "Ask AI", href: "/ask-ai", isInternal: true },
    { name: "Code Optimizer", href: "/code-ai", isInternal: true },
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            EduMentor AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              link.isInternal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              <NotificationCenter />
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Log in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button>Get Started</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  link.isInternal ? (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  )
                ))}
                <div className="flex flex-col gap-3 mt-4 pt-6 border-t">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="outline" className="w-full">Log in</Button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <Button className="w-full">Get Started</Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4">
                        <UserButton 
                          appearance={{
                            elements: {
                              userButtonAvatarBox: "w-10 h-10"
                            }
                          }}
                        />
                        <span className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Profile</span>
                      </div>
                      <NotificationCenter />
                    </div>
                  </SignedIn>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
