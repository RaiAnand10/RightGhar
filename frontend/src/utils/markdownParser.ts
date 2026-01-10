/**
 * Convert markdown text to HTML (basic conversion)
 * Supports: headers (h1-h3), lists, bold text, paragraphs
 */
export function renderMarkdownToHtml(text: string): string {
  return text
    .split('\n')
    .map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return `<h3 key="${index}">${line.substring(4)}</h3>`;
      }
      if (line.startsWith('## ')) {
        return `<h2 key="${index}">${line.substring(3)}</h2>`;
      }
      if (line.startsWith('# ')) {
        return `<h1 key="${index}">${line.substring(2)}</h1>`;
      }
      // Lists
      if (line.startsWith('- ')) {
        return `<li key="${index}">${line.substring(2)}</li>`;
      }
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Paragraphs
      if (line.trim() !== '') {
        return `<p key="${index}">${line}</p>`;
      }
      return '';
    })
    .join('');
}
