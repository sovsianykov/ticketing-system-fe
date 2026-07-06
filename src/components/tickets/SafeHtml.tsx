"use client";

import { cn } from "@/lib/utils";

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
}

// Basic sanitizer: strips <script> tags and dangerous attributes.
// For production, replace with DOMPurify if installed.
function sanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "");
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  if (!html) return null;
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}
