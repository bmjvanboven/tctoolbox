import { XMLParser } from "fast-xml-parser";

export type BrancheNieuwsItem = {
  titel: string;
  url: string;
  datum: string | null;
  bron: string;
};

type Feed = {
  bron: string;
  url: string;
  // Optioneel: alleen items tonen die hierop matchen (titel wordt getoetst).
  relevant?: RegExp;
};

const TELECOM_PROVIDERS = /vodafone|kpn|odido|t-mobile|telecom|smartphone/i;
const TELECOM_RELEVANT = new RegExp(`${TELECOM_PROVIDERS.source}|iphone|galaxy|apple|samsung`, "i");

// Deals/advertenties (bijv. iculture.nl/deals/... of androidplanet.nl/deals/...) zijn
// sponsored content, geen nieuws — koopadvies (/koopadvies/...) mag wel blijven staan.
const IS_DEAL = /\/deals\//i;

const FEEDS: Feed[] = [
  // Officiële merk-newsrooms, gefilterd op de toestellen die onze winkels verkopen.
  { bron: "Apple", url: "https://www.apple.com/newsroom/rss-feed.rss", relevant: /iphone/i },
  { bron: "Samsung", url: "https://news.samsung.com/global/feed", relevant: /galaxy/i },
  // Nederlandstalige community-sites, volledig gericht op Apple resp. Android/Samsung —
  // hier is geen extra filter nodig, alles is al relevant voor onze winkels. Label ze
  // op onderwerp (Apple/Samsung) i.p.v. sitenaam, zodat alle Apple- en Samsung-nieuws
  // visueel bij elkaar staat.
  { bron: "Apple", url: "https://www.iculture.nl/feed/" },
  { bron: "Samsung", url: "https://www.androidplanet.nl/feed/" },
  // Bredere Nederlandse telecom/techmarkt: providers (Vodafone, KPN, Odido) en telefoonnieuws.
  { bron: "Tweakers", url: "https://tweakers.net/feeds/nieuws.xml", relevant: TELECOM_RELEVANT },
  { bron: "NU.nl", url: "https://www.nu.nl/rss/Tech", relevant: TELECOM_RELEVANT },
];

// Eén centrale kleurendefinitie per label, gebruikt door zowel de dashboard-widget
// als de volledige nieuwspagina.
export const BRON_KLEUR: Record<string, string> = {
  Apple: "bg-gray-100 text-gray-700",
  Samsung: "bg-[#1428A0]/10 text-[#1428A0]",
  Tweakers: "bg-orange-50 text-[#ef8400]",
  "NU.nl": "bg-red-50 text-red-600",
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", htmlEntities: true });

function alsArray<T>(waarde: T | T[] | undefined): T[] {
  if (!waarde) return [];
  return Array.isArray(waarde) ? waarde : [waarde];
}

function parseFeed(xml: string, bron: string): BrancheNieuwsItem[] {
  const data = parser.parse(xml);

  // Atom-formaat (bijv. Apple Newsroom): <feed><entry>...
  if (data.feed?.entry) {
    return alsArray(data.feed.entry).map((entry: any) => ({
      titel: String(entry.title ?? "").trim(),
      url: typeof entry.link === "object" ? entry.link["@_href"] : entry.link,
      datum: entry.updated ?? null,
      bron,
    }));
  }

  // RSS 2.0-formaat (bijv. Samsung Newsroom, Tweakers): <rss><channel><item>...
  if (data.rss?.channel?.item) {
    return alsArray(data.rss.channel.item).map((item: any) => ({
      titel: String(item.title ?? "").trim(),
      url: item.link,
      datum: item.pubDate ?? null,
      bron,
    }));
  }

  return [];
}

async function haalFeedOp(feed: Feed): Promise<BrancheNieuwsItem[]> {
  const res = await fetch(feed.url, {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "TC Toolbox nieuwswidget" },
  });
  if (!res.ok) throw new Error(`${feed.bron}-feed gaf status ${res.status}`);
  const xml = await res.text();
  const items = parseFeed(xml, feed.bron).filter((item) => !IS_DEAL.test(item.url));
  return feed.relevant ? items.filter((item) => feed.relevant!.test(item.titel)) : items;
}

export async function haalBrancheNieuwsOp(aantalPerBron = 4, totaal = 20): Promise<BrancheNieuwsItem[]> {
  const resultaten = await Promise.allSettled(FEEDS.map(haalFeedOp));

  const items = resultaten.flatMap((resultaat) => {
    if (resultaat.status !== "fulfilled") return [];
    return resultaat.value.slice(0, aantalPerBron);
  });

  items.sort((a, b) => {
    const tijdA = a.datum ? new Date(a.datum).getTime() : 0;
    const tijdB = b.datum ? new Date(b.datum).getTime() : 0;
    return tijdB - tijdA;
  });

  return items.slice(0, totaal);
}
