import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Basic",
      description: "Perfect for casual learners.",
      price: "Free",
      features: [
        "Basic skill assessments",
        "Limited subject access (5 subjects)",
        "Standard AI generation",
        "Community support"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      description: "For serious students seeking mastery.",
      price: "$12",
      period: "/month",
      features: [
        "Unlimited subjects & courses",
        "Advanced adaptive learning engine",
        "Unlimited AI quizzes & flashcards",
        "Deep predictive analytics",
        "Priority email support"
      ],
      buttonText: "Start 14-Day Free Trial",
      popular: true
    },
    {
      name: "Family/Tutor",
      description: "Manage multiple learning paths.",
      price: "$29",
      period: "/month",
      features: [
        "Everything in Pro",
        "Up to 5 learner profiles",
        "Parent/Tutor monitoring dashboard",
        "Custom assignment creation",
        "Advanced reporting exports"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">
            Invest in your education with plans designed to fit every learning need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, idx) => (
            <Card key={idx} className={`relative pt-6 ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-border/50 shadow-sm mt-4 md:mt-0'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-8 border-b border-border/50">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base mb-6">{plan.description}</CardDescription>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-8 bg-muted/20">
                <Button className="w-full h-12 text-lg" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
