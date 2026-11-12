import { NEWS_CATEGORY_LABELS, NewsCategory } from '../../core/content/content.model';
import { SITE_URL } from '../../core/seo/seo.service';
import { shareCaption, SocialShareData } from './social.model';

export function newsShare(item: { id: number; slug: string; title: string; summary: string | null; category: NewsCategory }): SocialShareData {
  const url = `${SITE_URL}/vesti/${item.slug}`;
  return { title: item.title, label: NEWS_CATEGORY_LABELS[item.category], caption: shareCaption(item.title, item.summary, url), url, sourceType: 'news', sourceId: item.id };
}

export function questionShare(item: { id: number; slug: string; title: string; excerpt: string | null }): SocialShareData {
  const url = `${SITE_URL}/pitanja/${item.slug}`;
  return { title: item.title, label: 'Pitanja i odgovori', caption: shareCaption(`Pitanje: ${item.title}`, item.excerpt, url), url, sourceType: 'question', sourceId: item.id };
}

export function debateShare(item: { id: number; slug: string; title: string; description: string | null }): SocialShareData {
  const url = `${SITE_URL}/debate/${item.slug}`;
  return { title: item.title, label: 'Stručna debata', caption: shareCaption(`Stručna debata: ${item.title}`, item.description, url), url, sourceType: 'debate', sourceId: item.id };
}
