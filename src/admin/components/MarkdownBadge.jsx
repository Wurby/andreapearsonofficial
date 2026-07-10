export const MARKDOWN_HINT = 'Supports Markdown — **bold**, *italic*, [links](url), lists. Separate paragraphs with a blank line.'

export default function MarkdownBadge() {
  return (
    <span className="text-[10px] font-medium text-deep-space-blue/60 bg-deep-space-blue/5 border border-deep-space-blue/15 rounded px-1.5 py-0.5 tracking-wide uppercase">
      Markdown
    </span>
  )
}
