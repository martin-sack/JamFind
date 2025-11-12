export type NewsItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  imageUrl?: string | null;
  publishedAt: string; // ISO
};

const demoNews: NewsItem[] = [
  {
    id: "n1",
    title: "New Album Release: Artist Spotlight",
    source: "Music Weekly",
    summary: "The latest album from rising star has taken the charts by storm with its innovative sound.",
    imageUrl: null,
    publishedAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "n2",
    title: "Music Festival Lineup Announced",
    source: "Festival News",
    summary: "Major artists confirmed for this year's biggest music festival happening next month.",
    imageUrl: null,
    publishedAt: "2025-01-14T00:00:00.000Z",
  },
  {
    id: "n3",
    title: "Behind the Scenes: Studio Sessions",
    source: "Studio Insider",
    summary: "Exclusive look at how top producers are creating the hits of tomorrow.",
    imageUrl: null,
    publishedAt: "2025-01-13T00:00:00.000Z",
  },
  // add more placeholders so "See more" shows work
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `nx${i}`,
    title: `Indie Highlight #${i + 1}`,
    source: "JamFind Editorial",
    summary: "Emerging artists you should add to your queue this week.",
    imageUrl: null,
    publishedAt: new Date(Date.now() - (i + 4) * 86400000).toISOString(),
  })),
];

export async function getNewsPage(page = 1, limit = 6): Promise<{ items: NewsItem[]; total: number }> {
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = demoNews.slice(start, end);
  return { items, total: demoNews.length };
}
