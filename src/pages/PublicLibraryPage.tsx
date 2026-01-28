import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardGrid } from "@/components/ui/card-grid";
import { FadeIn, MotionCard, MotionButtonWrapper } from "@/components/ui/motion";
import {
  Search,
  Copy,
  Eye,
  Tag,
  User,
  Star,
  Filter,
} from "lucide-react";

// Featured public prompts
const publicPrompts = [
  {
    id: "1",
    title: "Ultimate Code Reviewer",
    description: "Comprehensive code review with security, performance, and best practices analysis.",
    author: "PromptCrafting Team",
    category: "Coding",
    tags: ["code", "review", "best-practices"],
    uses: 1243,
    starred: true,
  },
  {
    id: "2",
    title: "SEO Blog Writer",
    description: "Generate SEO-optimized blog posts with proper heading structure and keywords.",
    author: "Content Pro",
    category: "Writing",
    tags: ["blog", "seo", "content"],
    uses: 892,
    starred: true,
  },
  {
    id: "3",
    title: "Data Analysis Assistant",
    description: "Analyze datasets and generate insights with visualization recommendations.",
    author: "DataWiz",
    category: "Research",
    tags: ["data", "analysis", "visualization"],
    uses: 567,
    starred: false,
  },
  {
    id: "4",
    title: "Product Launch Email",
    description: "Create compelling product launch emails that drive conversions.",
    author: "PromptCrafting Team",
    category: "Marketing",
    tags: ["email", "launch", "marketing"],
    uses: 1089,
    starred: true,
  },
  {
    id: "5",
    title: "Technical Documentation",
    description: "Generate clear, structured technical documentation from code or specs.",
    author: "DocMaster",
    category: "Product",
    tags: ["documentation", "technical", "api"],
    uses: 423,
    starred: false,
  },
  {
    id: "6",
    title: "Interview Prep Coach",
    description: "Practice interview questions with detailed feedback and improvement tips.",
    author: "CareerBoost",
    category: "Career",
    tags: ["interview", "career", "coaching"],
    uses: 756,
    starred: true,
  },
];

const categories = ["All", "Marketing", "Coding", "Product", "Research", "Writing", "Career"];

export default function PublicLibraryPage() {
  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <PageHeader
          badge="Public Library"
          badgeVariant="accent"
          title="Prompt Templates"
          description="Browse community-created prompts. Copy, customize, and use them in your own workflows."
          centered
          className="mb-16"
        />

        {/* Search & Filters */}
        <FadeIn delay={0.1} className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search templates..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </FadeIn>

        {/* Prompts Grid */}
        <CardGrid
          items={publicPrompts}
          keyExtractor={(prompt) => prompt.id}
          columns={3}
          gap="lg"
          className="max-w-6xl mx-auto"
          renderItem={(prompt) => (
            <MotionCard className="group p-6 shadow-sm h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="muted">{prompt.category}</Badge>
                {prompt.starred && (
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-accent" />
                    <span className="text-xs">Featured</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {prompt.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {prompt.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {prompt.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-xs px-2 py-0.5 bg-secondary text-secondary-foreground"
                  >
                    <Tag className="mr-1 h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {prompt.author}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </div>
            </MotionCard>
          )}
        />

        {/* CTA */}
        <FadeIn delay={0.2} className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Want to share your own prompts with the community?
          </p>
          <MotionButtonWrapper>
            <Button asChild>
              <Link to="/auth?mode=signup">Create an account</Link>
            </Button>
          </MotionButtonWrapper>
        </FadeIn>
      </div>
    </div>
  );
}
