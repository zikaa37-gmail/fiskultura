export const DISABLED_LINK_HOSTS = ['zdravitas.gov.rs'];

export const DISABLED_LINK_TITLE = 'Stranica trenutno ne radi';

export function isLinkDisabled(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    const host = new URL(url).hostname.toLowerCase();
    return DISABLED_LINK_HOSTS.some((disabled) => host === disabled || host.endsWith(`.${disabled}`));
  } catch {
    return false;
  }
}
