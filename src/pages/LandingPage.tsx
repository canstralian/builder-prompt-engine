import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  MotionCard,
  MotionButtonWrapper,
} from "@/components/ui/motion";
import {
  Sparkles,
  Library,
  FlaskConical,
  Users,
  ArrowRight,
  Zap,
  Shield,
  Code2,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Library,
    title: "Prompt Library",
    description:
      "Organize, version, and share your prompts with powerful tagging, folders, and full-text search.",
  },
  {
    icon: Sparkles,
    title: "Prompt Builder",
    description:
      "Step-by-step wizard to craft high-quality prompts with guardrails for goal, context, style, and safety.",
  },
  {
    icon: FlaskConical,
    title: "Test & Iterate",
    description:
      "Run test variants, evaluate outputs, and track improvements across prompt versions.",
  },
  {
    icon: Users,
    title: "Team Workspaces",
    description:
      "Collaborate with roles, approvals, and audit trails. Keep your team aligned.",
  },
  {
    icon: Shield,
    title: "Built for Production",
    description:
      "Version control, immutable history, and export options ready for real workflows.",
  },
  {
    icon: Code2,
    title: "Developer-Friendly",
    description:
      "JSON/Markdown export, API-ready structure, and variable schemas for automation.",
  },
];

const testimonials = [
  {
    quote: "Finally, a tool that treats prompts like real engineering artifacts.",
    author: "Alex Chen",
    role: "ML Engineer",
  },
  {
    quote: "Cut our prompt iteration time by 60%. The version control is a game-changer.",
    author: "Sarah Kim",
    role: "Product Manager",
  },
  {
    quote: "The builder wizard helped our team standardize prompt quality across projects.",
    author: "Marcus Johnson",
    role: "Technical Lead",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Digital Precision */}
      <section className="relative overflow-hidden bg-hero-gradient py-24 md:py-36">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgMCBMNDAgMCBMNDAgNDAgTDAgNDBaIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-100" />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn delay={0}>
              <Badge variant="premium" className="mb-6 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <Zap className="mr-1 h-3 w-3" />
                Now in Public Beta
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 tracking-tight">
                Craft prompts
                <br />
                <span className="text-accent">with precision.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                The professional toolkit for prompt engineering. Build, test, version, and share high-quality prompts for your LLM workflows.
              </p>
            </FadeIn>
            <FadeIn delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <MotionButtonWrapper>
                <Button variant="accent" size="xl" asChild className="shadow-lg">
                  <Link to="/auth?mode=signup">
                    Start crafting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </MotionButtonWrapper>
              <MotionButtonWrapper>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/library">Browse library</Link>
                </Button>
              </MotionButtonWrapper>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="mt-8 text-sm text-primary-foreground/50 tracking-wide">
                Free to start • No credit card required
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <FadeIn>
            <p className="text-center text-sm text-muted-foreground mb-8">
              Trusted by prompt engineers at
            </p>
          </FadeIn>
          <StaggerContainer className="flex flex-wrap justify-center gap-8 md:gap-16">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map((company) => (
              <StaggerItem key={company} className="opacity-50">
                <span className="text-lg font-semibold text-muted-foreground">
                  {company}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32">
        <div className="container">
          <FadeIn className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Everything you need for professional prompt engineering
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From solo builders to enterprise teams, PromptCrafting provides the infrastructure to create reliable, high-quality prompts.
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <MotionCard className="group p-6 shadow-sm h-full">
                  <div className="h-12 w-12 bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors border border-accent/20">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container">
          <FadeIn className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How it works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From idea to production in minutes
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Define your goal",
                description: "Use the guided builder to specify what you need: output type, audience, constraints.",
              },
              {
                step: "02",
                title: "Test & refine",
                description: "Run variants, evaluate results, and iterate until your prompt performs reliably.",
              },
              {
                step: "03",
                title: "Ship with confidence",
                description: "Export to JSON/Markdown, share with your team, or integrate via our upcoming API.",
              },
            ].map((item) => (
              <StaggerItem key={item.step} className="text-center">
                <div className="inline-flex h-12 w-12 bg-primary text-primary-foreground items-center justify-center text-lg font-bold mb-4 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container">
          <FadeIn className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Loved by prompt engineers
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <MotionCard className="p-6 shadow-sm h-full">
                  <p className="text-lg mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgMCBMNDAgMCBMNDAgNDAgTDAgNDBaIi8+PC9nPjwvZz48L3N2Zz4=')]" />
        <div className="container relative">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
              Ready to craft better prompts?
            </h2>
            <p className="text-lg text-primary-foreground/70 mb-8">
              Join thousands of builders using PromptCrafting to design, test, and ship reliable prompts.
            </p>
            <MotionButtonWrapper>
              <Button variant="accent" size="xl" asChild className="shadow-lg">
                <Link to="/auth?mode=signup">
                  Start crafting — it's free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </MotionButtonWrapper>
          </FadeIn>
        </div>
      </section>

      {/* Resources Preview */}
      <section className="py-20 md:py-32">
        <div className="container">
          <FadeIn className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div>
              <Badge variant="secondary" className="mb-4">Resources</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Learn prompt engineering
              </h2>
            </div>
            <MotionButtonWrapper className="mt-4 md:mt-0">
              <Button variant="outline" asChild>
                <Link to="/learn">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View all resources
                </Link>
              </Button>
            </MotionButtonWrapper>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {[
              { title: "The RACE Framework", category: "Framework", readTime: "5 min" },
              { title: "Writing Effective System Prompts", category: "Guide", readTime: "8 min" },
              { title: "Output Schema Design", category: "Tutorial", readTime: "6 min" },
            ].map((article) => (
              <StaggerItem key={article.title}>
                <Link to="/learn" className="block h-full">
                  <MotionCard className="group p-6 shadow-sm h-full">
                    <Badge variant="muted" className="mb-3">{article.category}</Badge>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{article.readTime} read</p>
                  </MotionCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
