// Plain-text preview of Markdown source — for contexts (e.g. a truncated homepage teaser)
// where parsing+truncating rendered output isn't safe, since a hard cutoff can land mid-token.
export function stripMarkdown(text) {
  return (text ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
}
