import { useParams, Link } from "react-router-dom";
import { useLearnPost } from "@/hooks/useLearnPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, MotionButtonWrapper } from "@/components/ui/motion";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";

export function estimateReadTime(markdown: string): number {
  const words = markdown.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Escape HTML entities to prevent XSS before processing markdown
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function MarkdownRenderer({ content }: { content: string }) {
  // Process markdown with proper HTML escaping and sanitization
  const html = content
    .split("\n")
    .map((line) => {
      // Headers - escape content first
      if (line.startsWith("# ")) {
        return `<h1 class="text-3xl font-bold mt-8 mb-4">${escapeHtml(line.slice(2))}</h1>`;
      }
      if (line.startsWith("## ")) {
        return `<h2 class="text-2xl font-semibold mt-6 mb-3">${escapeHtml(line.slice(3))}</h2>`;
      }
      if (line.startsWith("### ")) {
        return `<h3 class="text-xl font-semibold mt-4 mb-2">${escapeHtml(line.slice(4))}</h3>`;
      }
      
      // Escape the line first, then apply safe markdown transformations
      let escapedLine = escapeHtml(line);
      
      // Bold (using escaped HTML entities for asterisks)
      escapedLine = escapedLine.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      // Inline code
      escapedLine = escapedLine.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 text-sm font-mono">$1</code>');
      
      // Lists
      if (line.startsWith("- ")) {
        return `<li class="ml-4 list-disc">${escapeHtml(line.slice(2))}</li>`;
      }
      if (/^\d+\)\s/.test(line)) {
        return `<li class="ml-4 list-decimal">${escapeHtml(line.replace(/^\d+\)\s/, ""))}</li>`;
      }
      // Empty lines
      if (line.trim() === "") {
        return "<br />";
      }
      // Regular paragraph
      return `<p class="mb-2">${escapedLine}</p>`;
    })
    .join("");

  // Sanitize the final HTML output with DOMPurify
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'code', 'li', 'br'],
    ALLOWED_ATTR: ['class'],
  });

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default function LearnPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useLearnPost(slug || "");

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container max-w-3xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20">
        <FadeIn className="container max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <MotionButtonWrapper>
            <Button asChild>
              <Link to="/learn">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Learn
              </Link>
            </Button>
          </MotionButtonWrapper>
        </FadeIn>
      </div>
    );
  }

  const readTime = estimateReadTime(post.body_markdown);
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-20">
      <div className="container max-w-3xl">
        {/* Back link */}
        <FadeIn>
          <Link
            to="/learn"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Learn
          </Link>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.1}>
          <header className="mb-10">
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category.name}
              </Badge>
            )}
            <h1 className="text-4xl font-bold mb-4 tracking-tight">{post.title}</h1>
            {post.summary && (
              <p className="text-xl text-muted-foreground mb-4">{post.summary}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        {/* Content */}
        <FadeIn delay={0.2}>
          <article className="text-foreground leading-relaxed">
            <MarkdownRenderer content={post.body_markdown} />
          </article>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={0.3}>
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <MotionButtonWrapper>
                <Button variant="outline" asChild>
                  <Link to="/learn">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    More articles
                  </Link>
                </Button>
              </MotionButtonWrapper>
            </div>
          </footer>
        </FadeIn>
      </div>
    </div>
  );
}
