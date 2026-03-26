import { Award, BookOpen, Sparkles, Users } from "lucide-react";

export default function Stats() {
  const stats = [
    { value: "50K+", label: "Active Students", icon: <Users className="w-5 h-5 text-blue-500" /> },
    { value: "2M+", label: "Questions Answered", icon: <BookOpen className="w-5 h-5 text-emerald-500" /> },
    { value: "98%", label: "Grade Improvement", icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
    { value: "150+", label: "Subjects Covered", icon: <Award className="w-5 h-5 text-primary" /> },
  ];

  return (
    <section className="py-10 border-y border-border bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center divide-x divide-border/50">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center space-y-1">
              <div className="p-3 bg-muted/50 rounded-full mb-2">
                {stat.icon}
              </div>
              <h4 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {stat.value}
              </h4>
              <p className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
