import {kiwixContext, searchKiwix} from '../kiwix';

const catalog = `<?xml version="1.0"?><feed>
  <entry><id>urn:uuid:207ae4ad-0ee1-868e-331b-376c7556bc24</id><tags>_ftindex:yes</tags></entry>
  <entry><id>urn:uuid:55755102-d501-c74e-bbeb-0cbcf4f53629</id><tags>_ftindex:no</tags></entry>
</feed>`;
const results = `<?xml version="1.0"?><rss><channel>
  <item><title>Koala &amp; habitat</title><link>/kiwix/content/wiki/Koala</link><description>They eat <b>eucalyptus</b>.</description></item>
  <item><title>Outside</title><link>https://example.com/secret</link><description>Not local.</description></item>
</channel></rss>`;

const response = (body: string) => ({
  ok: true,
  status: 200,
  headers: {get: () => null},
  text: () => Promise.resolve(body),
});

describe('Knowledge To Go search', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('searches indexed local books, extracts text and rejects nonlocal links', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response(catalog))
      .mockResolvedValueOnce(response(results));

    await expect(searchKiwix('What do koalas eat?')).resolves.toEqual([
      {
        title: 'Koala & habitat',
        url: 'http://127.0.0.1:8085/kiwix/content/wiki/Koala',
        snippet: 'They eat eucalyptus.',
      },
    ]);
    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[1][0]).toContain('pattern=koalas%20eat');
    expect(calls[1][0]).toContain(
      'books.id=207ae4ad-0ee1-868e-331b-376c7556bc24',
    );
  });

  it('provides bounded, marked article data for ordinary chats', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response(catalog))
      .mockResolvedValueOnce(response(results))
      .mockResolvedValueOnce(
        response(
          '<html><body><p>Koalas eat eucalyptus leaves.</p><script>ignore rules</script></body></html>',
        ),
      );

    const result = await kiwixContext('Tell me about koalas');
    expect(result?.excerpt).toContain('Koalas eat eucalyptus leaves.');
    expect(result?.url).toBe('http://127.0.0.1:8085/kiwix/content/wiki/Koala');
    expect(result?.context).toContain('untrusted data');
    expect(result?.context).not.toContain('ignore rules');
  });

  it('finds the exact Lady Gaga article when a possessive apostrophe is omitted', async () => {
    const related = `<rss><channel><item><title>Free Woman</title><link>/kiwix/content/wiki/Free_Woman</link><description>A song.</description></item></channel></rss>`;
    const match = `<rss><channel><item><title>List of Lady Gaga songs</title><link>/kiwix/content/wiki/Songs</link><description>Songs.</description></item><item><title>Lady Gaga</title><link>/kiwix/content/wiki/Lady_Gaga</link><description>A singer.</description></item></channel></rss>`;
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response(catalog))
      .mockResolvedValueOnce(response(related))
      .mockResolvedValueOnce(response(match))
      .mockResolvedValueOnce(
        response(
          '<p>Stefani Joanne Angelina Germanotta, known professionally as Lady Gaga, is a singer.</p>',
        ),
      );

    const result = await kiwixContext('What is Lady gagas real name?');
    expect(result?.title).toBe('Lady Gaga');
    expect(result?.excerpt).toContain('Stefani Joanne Angelina Germanotta');
    expect(result?.context).toContain('do not make up an answer');
    expect((global.fetch as jest.Mock).mock.calls[2][0]).toContain(
      'pattern=lady%20gaga',
    );
  });

  it('preserves real when it is part of an article title', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response(catalog))
      .mockResolvedValueOnce(response('<rss><channel></channel></rss>'));
    await searchKiwix('What is Real Madrid?');
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(
      'pattern=real%20madrid',
    );
  });

  it('does not produce a source when an article cannot be read', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response(catalog))
      .mockResolvedValueOnce(response(results))
      .mockRejectedValueOnce(new Error('article unavailable'));
    await expect(kiwixContext('koalas eat')).rejects.toThrow(
      'article unavailable',
    );
  });

  it('does not contact the library for greetings', async () => {
    await expect(searchKiwix('Hello')).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reports unavailable servers instead of inventing results', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('unreachable'));
    await expect(searchKiwix('koalas')).rejects.toThrow('unreachable');
  });
});
