/** Search the Kiwix server bundled with Knowledge to Go on this device. */
export const KIWIX_BASE = 'http://127.0.0.1:8085/kiwix';

export type LibraryHit = {title: string; url: string; snippet: string};

function decodeText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, number: string) => {
      const code =
        number[0].toLowerCase() === 'x'
          ? parseInt(number.slice(1), 16)
          : parseInt(number, 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(
      /&(amp|lt|gt|quot|apos);/g,
      (_, entity: string) =>
        ({amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"})[entity] || '',
    )
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function field(item: string, name: string): string {
  const match = item.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'),
  );
  return match ? decodeText(match[1]) : '';
}

/** Parse Kiwix's documented RSS/XML search format, never following links. */
export function parseSearchResults(xml: string): LibraryHit[] {
  if (!/<rss\b/i.test(xml) || !/<channel\b/i.test(xml)) {
    throw new Error('The library returned an unexpected search response.');
  }
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];
  return items
    .slice(0, 3)
    .map(item => {
      const title = field(item, 'title').slice(0, 200);
      const path = field(item, 'link');
      const snippet = field(item, 'description').slice(0, 900);
      // Only show paths on the same local Kiwix server. Do not request URLs
      // returned by archive contents or allow an external source to be cited.
      const localPath = path.startsWith('/kiwix/content/')
        ? path
        : path.startsWith('/content/')
          ? `/kiwix${path}`
          : '';
      const url =
        localPath && !/[\s<>"'\\]/.test(localPath)
          ? `http://127.0.0.1:8085${localPath}`
          : '';
      return {title, url, snippet};
    })
    .filter(hit => !!(hit.title && hit.url && hit.snippet));
}

export async function searchLocalLibrary(
  query: string,
  signal?: AbortSignal,
): Promise<LibraryHit[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > 300) {
    throw new Error('Enter a search of up to 300 characters after /library.');
  }
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) {
    cancel();
  } else {
    signal?.addEventListener('abort', cancel);
  }
  const timer = setTimeout(cancel, 15000);
  try {
    const url = `${KIWIX_BASE}/search?books.filter.lang=eng&format=xml&pageLength=3&pattern=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url, {signal: controller.signal});
    if (!response.ok) {
      throw new Error(`Kiwix search failed (HTTP ${response.status}).`);
    }
    const xml = await response.text();
    if (xml.length > 200000) {
      throw new Error('The library search response was too large.');
    }
    return parseSearchResults(xml);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
