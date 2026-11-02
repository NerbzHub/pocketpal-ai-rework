import {parseSearchResults, searchLocalLibrary} from '../search';

const xml = `<?xml version="1.0"?><rss><channel>
  <item><title>Bottled water</title>
  <link>/kiwix/content/wikipedia_en_top1m_maxi_2026-04/Bottled_water</link>
  <description>...&lt;b&gt;water&lt;/b&gt;. Bottled mineral &lt;b&gt;water&lt;/b&gt; being poured into a glass</description>
  <book><title>Wikipedia</title></book></item>
  <item><title>External</title><link>https://example.com/</link>
  <description>Not a local source</description></item>
</channel></rss>`;

describe('Knowledge to Go search', () => {
  afterEach(() => jest.restoreAllMocks());

  it('only returns local search hits with excerpts', () => {
    expect(parseSearchResults(xml)).toEqual([
      {
        title: 'Bottled water',
        url: 'http://127.0.0.1:8085/kiwix/content/wikipedia_en_top1m_maxi_2026-04/Bottled_water',
        snippet: '... water . Bottled mineral water being poured into a glass',
      },
    ]);
  });

  it('rejects a response from an unexpected server', () => {
    expect(() => parseSearchResults('<html>error</html>')).toThrow();
  });

  it('encodes the query and uses the local Kiwix endpoint', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => xml,
    } as Response);
    await expect(searchLocalLibrary('water & safety')).resolves.toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toContain(
      'pattern=water%20%26%20safety',
    );
    expect(fetchMock.mock.calls[0][0]).toContain('127.0.0.1:8085/kiwix/search');
  });
});
