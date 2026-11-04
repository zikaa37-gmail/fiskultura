import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'simpleMarkdown' })
export class SimpleMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(/\r\n/g, '\n').split(/\n{2,}/).map(block => {
      const lines = block.split('\n').filter(l => l.trim());
      if (lines.length && lines.every(l => /^\s*- /.test(l))) {
        return '<ul>' + lines.map(l => `<li>${inline(l.replace(/^\s*- /, ''))}</li>`).join('') + '</ul>';
      }
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
  }
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(text: string): string {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
