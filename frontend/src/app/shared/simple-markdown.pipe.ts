import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'simpleMarkdown' })
export class SimpleMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(/\r\n/g, '\n').split(/\n{2,}/).map(block => {
      const runs: { list: boolean; lines: string[] }[] = [];
      for (const line of block.split('\n').filter(l => l.trim())) {
        const list = /^\s*- /.test(line);
        const last = runs[runs.length - 1];
        if (last && last.list === list) {
          last.lines.push(line);
        } else {
          runs.push({ list, lines: [line] });
        }
      }
      return runs.map(run => run.list
        ? '<ul>' + run.lines.map(l => `<li>${inline(l.replace(/^\s*- /, ''))}</li>`).join('') + '</ul>'
        : `<p>${run.lines.map(inline).join('<br>')}</p>`).join('');
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
