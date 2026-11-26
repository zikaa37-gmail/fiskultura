import { isLinkDisabled } from '../../core/disabled-links';
import { pickVoice, speechChunks } from './read-aloud';

const voice = (lang: string, name = lang) => ({ lang, name }) as SpeechSynthesisVoice;

describe('ReadAloud helpers', () => {
  it('prefers Serbian, then Croatian or Bosnian voices', () => {
    expect(pickVoice([voice('en-US'), voice('hr-HR'), voice('sr-RS')])?.lang).toBe('sr-RS');
    expect(pickVoice([voice('en-US'), voice('hr-HR')])?.lang).toBe('hr-HR');
    expect(pickVoice([voice('sr-RS', 'Cyrillic'), voice('sr-Latn-RS')])?.lang).toBe('sr-Latn-RS');
    expect(pickVoice([voice('en-US')])).toBeNull();
  });

  it('splits long text into sentence chunks', () => {
    const chunks = speechChunks('Prva rečenica. Druga rečenica! Treća?', 20);
    expect(chunks).toEqual(['Prva rečenica.', 'Druga rečenica!', 'Treća?']);
    expect(speechChunks('Kratko. Isto kratko.')).toEqual(['Kratko. Isto kratko.']);
  });

  it('disables links to Zdravitas', () => {
    expect(isLinkDisabled('https://admin.zdravitas.gov.rs/')).toBe(true);
    expect(isLinkDisabled('https://zdravitas.gov.rs')).toBe(true);
    expect(isLinkDisabled('https://e-pripreme.fiskultura.rs/')).toBe(false);
  });
});
