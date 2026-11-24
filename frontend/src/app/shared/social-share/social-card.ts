export type SocialKind = 'post' | 'story';

const WIDTH = 1080;
const HEIGHTS: Record<SocialKind, number> = { post: 1350, story: 1920 };
const PADDING = 96;
const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Slika ${src} nije učitana.`));
    image.src = src;
  });
}

function wrap(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitTitle(context: CanvasRenderingContext2D, title: string, maxWidth: number, maxHeight: number): { lines: string[]; size: number } {
  for (let size = 96; size >= 44; size -= 4) {
    context.font = `800 ${size}px ${FONT}`;
    const lines = wrap(context, title, maxWidth);
    if (lines.length * size * 1.15 <= maxHeight) {
      return { lines, size };
    }
  }
  context.font = `800 44px ${FONT}`;
  const lines = wrap(context, title, maxWidth);
  const max = Math.floor(maxHeight / (44 * 1.15));
  return { lines: lines.length > max ? [...lines.slice(0, max - 1), `${lines[max - 1]}…`] : lines, size: 44 };
}

export async function renderSocialCard(title: string, label: string, kind: SocialKind = 'post'): Promise<string> {
  const height = HEIGHTS[kind];
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  await document.fonts?.ready;

  const background = context.createLinearGradient(0, 0, WIDTH, height);
  background.addColorStop(0, '#1d4ed8');
  background.addColorStop(1, '#0b1736');
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, height);

  context.fillStyle = 'rgba(255, 255, 255, 0.06)';
  context.beginPath();
  context.arc(WIDTH - 60, 220, 360, 0, Math.PI * 2);
  context.fill();

  const top = kind === 'story' ? 220 : PADDING;
  const logo = await loadImage('/logo/logo-plain-white.png');
  const logoWidth = 420;
  context.drawImage(logo, PADDING, top, logoWidth, (logo.height / logo.width) * logoWidth);

  const titleTop = top + 260;
  let y = titleTop;
  if (label) {
    context.font = `700 34px ${FONT}`;
    const text = label.toUpperCase();
    const pill = context.measureText(text).width + 48;
    context.fillStyle = '#c6f432';
    context.beginPath();
    context.roundRect(PADDING, y, pill, 64, 32);
    context.fill();
    context.fillStyle = '#0b1736';
    context.textBaseline = 'middle';
    context.fillText(text, PADDING + 24, y + 33);
    y += 120;
  }

  const footer = height - (kind === 'story' ? 260 : PADDING);
  const { lines, size } = fitTitle(context, title, WIDTH - PADDING * 2, footer - y - 80);
  context.fillStyle = '#ffffff';
  context.textBaseline = 'top';
  context.font = `800 ${size}px ${FONT}`;
  for (const line of lines) {
    context.fillText(line, PADDING, y);
    y += size * 1.15;
  }

  context.fillStyle = 'rgba(255, 255, 255, 0.85)';
  context.font = `600 38px ${FONT}`;
  context.textBaseline = 'alphabetic';
  context.fillText('fiskultura.rs', PADDING, footer);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export function fileToJpeg(file: File, kind: SocialKind = 'post'): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    loadImage(url)
      .then((image) => {
        const height = HEIGHTS[kind];
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = height;
        const context = canvas.getContext('2d')!;
        const scale = Math.max(WIDTH / image.width, height / image.height);
        const w = image.width * scale;
        const h = image.height * scale;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, WIDTH, height);
        context.drawImage(image, (WIDTH - w) / 2, (height - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      })
      .catch(reject)
      .finally(() => URL.revokeObjectURL(url));
  });
}
