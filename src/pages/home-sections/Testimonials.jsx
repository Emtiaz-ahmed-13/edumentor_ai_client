import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "High School Junior",
      image: "https://i.pravatar.cc/150?u=sarah",
      content: "EduMentor completely changed how I study for AP Calculus. The AI realized I was struggling with derivatives and built a custom path that finally made it click. I went from a C to an A- in one semester!"
    },
    {
      name: "David Chen",
      role: "College Freshman",
      image: "https://i.pravatar.cc/150?u=david",
      content: "The generated flashcards and practice quizzes save me hours of prep time. It's like having a 24/7 personal tutor that knows exactly what's going to be on the exam."
    },
    {
      name: "Elena Rodriguez",
      role: "Parent",
      image: "https://i.pravatar.cc/150?u=elena",
      content: "I love the detailed analytics dashboard. I can see exactly where my son is excelling and where he needs help without having to constantly look over his shoulder. The progress has been incredible."
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Loved by students & parents</h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. See how EduMentor AI is transforming education for thousands of learners worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="bg-background/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 opacity-50"></div>
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-6">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
