import ReactMarkdown from 'react-markdown'

function isExternal(href) {
  return /^https?:\/\//.test(href || '')
}

const LinkRenderer = ({ children, href }) => (
  <a
    href={href}
    target={isExternal(href) ? '_blank' : undefined}
    rel={isExternal(href) ? 'noopener noreferrer' : undefined}
    className="underline decoration-1 underline-offset-2 hover:text-blood-red transition-colors"
  >
    {children}
  </a>
)

const BLOCK_COMPONENTS = {
  p:      ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em:     ({ children }) => <em className="italic">{children}</em>,
  a:      LinkRenderer,
  ul:     ({ children }) => <ul className="list-disc pl-5 mb-4 last:mb-0 space-y-1">{children}</ul>,
  ol:     ({ children }) => <ol className="list-decimal pl-5 mb-4 last:mb-0 space-y-1">{children}</ol>,
}

// Single-line contexts (headings, buttons, quotes) — no block-level <p> wrapper.
const INLINE_COMPONENTS = {
  ...BLOCK_COMPONENTS,
  p: ({ children }) => <>{children}</>,
}

/**
 * Renders admin-authored Markdown. `inline` unwraps the top-level paragraph so this can
 * safely nest inside headings, buttons, and blockquotes without breaking HTML nesting.
 */
export default function Markdown({ children, inline = false, className }) {
  if (!children) return null
  const Wrapper = inline ? 'span' : 'div'
  return (
    <Wrapper className={className}>
      <ReactMarkdown components={inline ? INLINE_COMPONENTS : BLOCK_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </Wrapper>
  )
}
