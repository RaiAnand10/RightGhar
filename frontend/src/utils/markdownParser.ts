/**
 * Convert markdown text to HTML (basic conversion)
 * Supports: headers (h1-h3), lists, bold text, paragraphs
 */
export function renderMarkdownToHtml(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if this is a list item
    const isListItem = line.startsWith('- ') || line.startsWith('* ');
    
    // Handle transition out of list
    if (inList && !isListItem && line.trim() !== '') {
      result.push('</ul>');
      inList = false;
    }

    // Headers
    if (line.startsWith('### ')) {
      result.push(`<h3>${line.substring(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      result.push(`<h2>${line.substring(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      result.push(`<h1>${line.substring(2)}</h1>`);
      continue;
    }

    // Lists
    if (isListItem) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const content = line.startsWith('- ') ? line.substring(2) : line.substring(2);
      // Apply bold formatting within list items
      const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${formattedContent}</li>`);
      continue;
    }

    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Paragraphs
    if (line.trim() !== '') {
      result.push(`<p>${line}</p>`);
    }
  }

  // Close any open list at the end
  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
}
