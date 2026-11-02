import {parseSearchResults, searchLocalLibrary} from '../search';

const xml = `<?xml version="1.0"?><rss><channel>
  <item><title>Safe &amp; clean water</title>
  <link>/kiwix/content/wiki/Water</link><description>Drinking water.</description>
  <book><title>Wikipedia</title></book></item>
  <item><title>External</title><link>https://example.com/</link>
  <description>Not a local source</description></item>
</channel></rss>`;

describe('Knowledge to Go search', () => {
  afterEach(() => jest.restoreAllMocks());

  it('only returns local search hits with excerpts', () => {
    expect(parseSearchResults(xml)).toEqual([{
      title: 'Safe & clean water',
      url: 'http://127.0.0.1:8085/kiwix/content/wiki/Water',
      snippet: 'Drinking water.',
    }]);
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
    expect(fetchMock.mock.calls[0][0]).toContain('pattern=water%20%26%20safety');
    expect(fetchMock.mock.calls[0][0]).toContain('127.0.0.1:8085/kiwix/search');
  });
});
