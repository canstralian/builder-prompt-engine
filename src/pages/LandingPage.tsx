import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NetworkPattern } from "@/components/ui/network-pattern";
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

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://promptcrafting.com/#organization",
      name: "PromptCrafting",
      url: "https://promptcrafting.com",
      logo: "https://promptcrafting.com/og-image.png",
      description: "Professional-grade tools for versioning, testing, and collaborating on AI prompts.",
      sameAs: ["https://twitter.com/PromptCrafting"]
    },
    {
      "@type": "WebSite",
      "@id": "https://promptcrafting.com/#website",
      url: "https://promptcrafting.com",
      name: "PromptCrafting",
      publisher: { "@id": "https://promptcrafting.com/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://promptcrafting.com/#app",
      name: "PromptCrafting",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: "The professional toolkit for prompt engineering. Build, test, version, and share high-quality prompts for your LLM workflows.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to start, no credit card required"
      },
      featureList: [
        "Prompt Library with versioning",
        "Step-by-step Prompt Builder",
        "Test & Iterate workflows",
        "Team Workspaces with collaboration",
        "JSON/Markdown export",
        "Developer-friendly API structure"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://promptcrafting.com/#webpage",
      url: "https://promptcrafting.com",
      name: "PromptCrafting - Design prompts you can trust",
      description: "Professional-grade tools for versioning, testing, and collaborating on AI prompts. Built for teams who demand reliability.",
      isPartOf: { "@id": "https://promptcrafting.com/#website" },
      about: { "@id": "https://promptcrafting.com/#app" }
    }
  ]
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section - Neural Precision */}
      <section className="relative overflow-hidden bg-hero-gradient py-28 md:py-40">
        {/* Neural network pattern overlay */}
        <NetworkPattern id="hero-network" opacity={0.08} colorClass="text-white" />
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn delay={0}>
              <Badge variant="premium" className="mb-6 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <Zap className="mr-1.5 h-3.5 w-3.5 text-accent" />
                Now in Public Beta
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Craft prompts
                <br />
                <span className="bg-gradient-to-r from-accent via-accent to-orange-300 bg-clip-text text-transparent">
                  with precision.
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                The professional toolkit for prompt engineering. Build, test, version, and share high-quality prompts for your LLM workflows.
              </p>
            </FadeIn>
            <FadeIn delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <MotionButtonWrapper>
                <Button variant="accent" size="xl" asChild className="shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30">
                  <Link to="/auth?mode=signup">
                    Start crafting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </MotionButtonWrapper>
              <MotionButtonWrapper>
                <Button variant="hero-outline" size="xl" asChild className="backdrop-blur-sm">
                  <Link to="/library">Browse library</Link>
                </Button>
              </MotionButtonWrapper>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="mt-10 text-sm text-white/50 tracking-wide flex items-center justify-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Free to start
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>No credit card required</span>
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
      <section className="py-20 md:py-32 relative overflow-hidden">
        <NetworkPattern id="features-network" opacity={0.03} variant="sparse" />
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
      <section className="py-20 md:py-32 bg-muted/50 relative overflow-hidden">
        <NetworkPattern id="howitworks-network" opacity={0.04} size={80} />
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
      <section className="py-20 md:py-32 relative overflow-hidden">
        <NetworkPattern id="testimonials-network" opacity={0.025} variant="sparse" size={100} />
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
      <section className="py-24 md:py-36 bg-hero-gradient relative overflow-hidden">
        {/* Neural network pattern */}
        <NetworkPattern id="cta-network" opacity={0.06} size={80} colorClass="text-white" variant="dense" />
        {/* Accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/15 rounded-full blur-3xl" />
        
        <div className="container relative">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to craft better prompts?
            </h2>
            <p className="text-lg md:text-xl text-white/70 mb-10">
              Join thousands of builders using PromptCrafting to design, test, and ship reliable prompts.
            </p>
            <MotionButtonWrapper>
              <Button variant="accent" size="xl" asChild className="shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30">
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
      <section className="py-20 md:py-32 relative overflow-hidden">
        <NetworkPattern id="resources-network" opacity={0.03} variant="sparse" size={70} />
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
