import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'simpleMarkdown' })
export class SimpleMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(/\r\n/g, '\n').split(/\n{2,}/).map(block => {
      const runs: { kind: 'ul' | 'ol' | 'p'; lines: string[] }[] = [];
      for (const line of block.split('\n').filter(l => l.trim())) {
        const kind = /^\s*- /.test(line) ? 'ul' : /^\s*\d+\.\s/.test(line) ? 'ol' : 'p';
        const last = runs[runs.length - 1];
        if (last && last.kind === kind) {
          last.lines.push(line);
        } else {
          runs.push({ kind, lines: [line] });
        }
      }
      return runs.map(run => run.kind === 'p'
        ? `<p>${run.lines.map(inline).join('<br>')}</p>`
        : `<${run.kind}>` + run.lines.map(l => `<li>${inline(l.replace(/^\s*(- |\d+\.\s)/, ''))}</li>`).join('') + `</${run.kind}>`).join('');
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
