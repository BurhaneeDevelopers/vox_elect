'use client';

/**
 * Custom ReactMarkdown renderer with election-themed components.
 * Renders timelines, callouts, deadlines inline in chat messages.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';

interface response_renderer_props {
  content: string;
  class_name?: string;
}

const markdown_components: Components = {
  // Serif headers with forest green colour
  h1: ({ children }) => (
    <h1 className="font-serif text-xl font-bold text-[#2D5016] mt-4 mb-2 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-lg font-semibold text-[#2D5016] mt-3 mb-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-base font-semibold text-[#2D5016] mt-2 mb-1">
      {children}
    </h3>
  ),
  // Paragraphs
  p: ({ children }) => (
    <p className="text-[#1C1917] leading-relaxed mb-2 last:mb-0 text-sm">
      {children}
    </p>
  ),
  // Ordered lists — numbered steps get step-counter treatment
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5 text-sm text-[#1C1917]">
      {children}
    </ol>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-sm text-[#1C1917]">
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  // Blockquote → callout box (used for deadlines/important dates)
  blockquote: ({ children }) => (
    <div
      className="border-l-4 border-[#C9A84C] bg-[#FDF8ED] rounded-r-lg px-3 py-2 my-3 text-sm"
      role="note"
      aria-label="Important information"
    >
      <div className="text-[#1C1917]">{children}</div>
    </div>
  ),
  // Inline code
  code: ({ children, className }) => {
    const is_block = className?.includes('language-');
    if (is_block) {
      return (
        <pre className="bg-[#F0EBE0] rounded-lg p-3 overflow-x-auto text-xs my-2">
          <code className="text-[#1C1917]">{children}</code>
        </pre>
      );
    }
    return (
      <code className="bg-[#F0EBE0] text-[#2D5016] rounded px-1 py-0.5 text-xs font-mono">
        {children}
      </code>
    );
  },
  // Links — open external links safely
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#2D5016] underline underline-offset-2 hover:text-[#3d6b1f] focus-visible:outline-[#C9A84C]"
      aria-label={typeof children === 'string' ? `${children} (opens in new tab)` : undefined}
    >
      {children}
    </a>
  ),
  // Horizontal rule
  hr: () => (
    <hr className="border-t border-[#E7E0D0] my-3" />
  ),
  // Strong/bold
  strong: ({ children }) => (
    <strong className="font-semibold text-[#2D5016]">{children}</strong>
  ),
  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full text-sm border-collapse border border-[#E7E0D0] rounded">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#2D5016] text-white">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-t border-[#E7E0D0] text-[#1C1917]">{children}</td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-[#F5F0E8]">{children}</tr>
  ),
};

export function response_renderer({ content, class_name }: response_renderer_props) {
  return (
    <div className={cn('elara_prose', class_name)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdown_components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
