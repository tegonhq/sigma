import { Key } from 'ts-key-enum';

export function toProperCase(text: string) {
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function convertToTitleCase(input: string): string {
  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getTiptapJSON(input: string) {
  try {
    return JSON.parse(input);
  } catch (e) {
    return {};
  }
}

export const hash = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export function extractTextFromHTML(html: string) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export const getPlatformModifierKey = () => {
  const isMac =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).userAgentData?.platform === 'macOS' ||
    navigator.userAgent.toLowerCase().includes('mac');
  return isMac ? Key.Meta : Key.Control;
};

export const getPlatform = () => {
  // Check userAgentData first (modern browsers)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platform = (navigator as any).userAgentData?.platform;
  if (platform) {
    return platform;
  }

  // Fallback to userAgent string
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) {
    return 'macOS';
  }
  if (userAgent.includes('windows')) {
    return 'Windows';
  }
  if (userAgent.includes('linux')) {
    return 'Linux';
  }

  return 'macOS';
};
