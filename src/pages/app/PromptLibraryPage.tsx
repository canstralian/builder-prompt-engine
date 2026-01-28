import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { CardGrid } from "@/components/ui/card-grid";
import { FadeIn, MotionCard } from "@/components/ui/motion";
import {
  Search,
  Filter,
  Plus,
  Copy,
  Eye,
  Tag,
  Folder,
  Star,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample prompts data
const samplePrompts = [
  {
    id: "1",
    title: "Marketing Email Generator",
    description: "Generate compelling marketing emails with customizable tone and call-to-action.",
    category: "Marketing",
    tags: ["email", "marketing", "copywriting"],
    model: "GPT-4",
    version: "v3",
    starred: true,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "Code Review Assistant",
    description: "Analyze code for bugs, performance issues, and best practices.",
    category: "Coding",
    tags: ["code", "review", "development"],
    model: "Claude 3",
    version: "v2",
    starred: false,
    createdAt: "1 week ago",
  },
  {
    id: "3",
    title: "Product Description Writer",
    description: "Create SEO-optimized product descriptions for e-commerce.",
    category: "Product",
    tags: ["product", "seo", "ecommerce"],
    model: "GPT-4",
    version: "v5",
    starred: true,
    createdAt: "3 days ago",
  },
  {
    id: "4",
    title: "Research Summary Generator",
    description: "Summarize academic papers and research documents into key insights.",
    category: "Research",
    tags: ["research", "summary", "academic"],
    model: "Claude 3",
    version: "v1",
    starred: false,
    createdAt: "5 days ago",
  },
  {
    id: "5",
    title: "Blog Post Outline",
    description: "Generate structured outlines for blog posts with SEO considerations.",
    category: "Writing",
    tags: ["blog", "outline", "content"],
    model: "GPT-4",
    version: "v4",
    starred: false,
    createdAt: "1 day ago",
  },
  {
    id: "6",
    title: "Interview Question Generator",
    description: "Create tailored interview questions based on job role and level.",
    category: "Career",
    tags: ["interview", "hiring", "hr"],
    model: "GPT-4",
    version: "v2",
    starred: true,
    createdAt: "4 days ago",
  },
];

const categories = ["All", "Marketing", "Coding", "Product", "Research", "Writing", "Career"];

export default function PromptLibraryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Prompt Library"
        description={`${samplePrompts.length} prompts in your workspace`}
        actions={
          <Button asChild>
            <Link to="/app/prompts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </FadeIn>

      {/* Prompts Grid */}
      <CardGrid
        items={samplePrompts}
        keyExtractor={(prompt) => prompt.id}
        columns={3}
        renderItem={(prompt) => (
          <MotionCard className="h-full">
            <Link
              to={`/app/prompts/${prompt.id}`}
              className="block p-5 h-full group"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant="muted" className="text-xs">
                  {prompt.category}
                </Badge>
                <div className="flex items-center gap-1">
                  {prompt.starred && (
                    <Star className="h-4 w-4 text-accent fill-accent" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Quick View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {prompt.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {prompt.model}
                </span>
                <span>{prompt.version} • {prompt.createdAt}</span>
              </div>
            </Link>
          </MotionCard>
        )}
        emptyState={
          <EmptyState
            icon={Folder}
            title="No prompts yet"
            description="Get started by creating your first prompt or importing from the public library."
            action={{
              label: "Create prompt",
              onClick: () => {},
              icon: Plus,
            }}
            secondaryAction={{
              label: "Browse library",
              onClick: () => {},
            }}
          />
        }
      />
    </div>
  );
}
