const ARTICLE = /(?<!\p{L})(čl(?:an(?:a|u|om)?)?\.?)\s+(\d+)/giu;

function articleAnchor(url: string, article: string): string | null {
  if (/^https:\/\/www\.paragraf\.rs\/propisi\//.test(url)) {
    return `${url.split('#')[0]}#clan_${article}`;
  }
  return null;
}

export function firstArticle(summary: string): string | null {
  ARTICLE.lastIndex = 0;
  const match = ARTICLE.exec(summary);
  return match ? match[2] : null;
}

export function regulationTextUrl(url: string | null, summary: string): string | null {
  if (!url) {
    return null;
  }
  const article = firstArticle(summary);
  return (article && articleAnchor(url, article)) || url;
}

export function linkArticles(html: string, url: string | null): string {
  if (!url || !articleAnchor(url, '1')) {
    return html;
  }
  return html
    .split(/(<a [^>]*>.*?<\/a>)/g)
    .map((part) =>
      part.startsWith('<a ')
        ? part
        : part.replace(ARTICLE, (all, word: string, article: string) => `<a href="${articleAnchor(url, article)}" target="_blank" rel="noopener">${word} ${article}</a>`),
    )
    .join('');
}
