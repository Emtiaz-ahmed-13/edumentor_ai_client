import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "How does the AI adapt to my learning style?",
      answer: "Our engine continuously analyzes your quiz performance, reading speed, and interaction patterns. It uses this data to adjust the difficulty, format, and pacing of future lessons in real-time."
    },
    {
      question: "Can I use EduMentor for any subject?",
      answer: "We currently support over 150 subjects, including Mathematics, Sciences, Languages, History, and College Prep courses. We are constantly expanding our curriculum database."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! Every new user gets a 14-day fully featured free trial of our Pro plan. No credit card required to start."
    },
    {
      question: "Are the generated quizzes accurate?",
      answer: "Our AI is fine-tuned on verified educational datasets and cross-referenced with standard curriculum guidelines to ensure high accuracy and relevance."
    },
    {
      question: "Can I track my child's progress?",
      answer: "Absolutely. We offer a dedicated Parent/Educator dashboard that provides deep insights into completion rates, mastery levels, and areas needing attention."
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the platform and how it works.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border/50 px-2">
              <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
