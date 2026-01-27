import { describe, it, expect } from "vitest";
import { estimateReadTime, escapeHtml } from "./LearnPostPage";

describe("estimateReadTime", () => {
  it("should return 1 minute for short content", () => {
    expect(estimateReadTime("Hello world")).toBe(1);
    expect(estimateReadTime("")).toBe(1);
  });

  it("should calculate read time based on 200 words per minute", () => {
    const twoHundredWords = Array(200).fill("word").join(" ");
    expect(estimateReadTime(twoHundredWords)).toBe(1);

    const fourHundredWords = Array(400).fill("word").join(" ");
    expect(estimateReadTime(fourHundredWords)).toBe(2);
  });

  it("should round up to the nearest minute", () => {
    const twoFiftyWords = Array(250).fill("word").join(" ");
    expect(estimateReadTime(twoFiftyWords)).toBe(2);
  });

  it("should handle content with multiple whitespace characters", () => {
    const content = "word1  word2\n\nword3\tword4";
    expect(estimateReadTime(content)).toBe(1);
  });
});

describe("escapeHtml", () => {
  it("should escape ampersand", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("should escape less than sign", () => {
    expect(escapeHtml("a < b")).toBe("a &lt; b");
  });

  it("should escape greater than sign", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("should escape double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("should escape single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("should escape all dangerous characters together", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("should prevent XSS via event handlers", () => {
    expect(escapeHtml('<img onerror="alert(1)">')).toBe(
      "&lt;img onerror=&quot;alert(1)&quot;&gt;"
    );
  });

  it("should handle empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("should not modify safe text", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });

  it("should handle multiple occurrences", () => {
    expect(escapeHtml("<<>>&&")).toBe("&lt;&lt;&gt;&gt;&amp;&amp;");
  });
});
