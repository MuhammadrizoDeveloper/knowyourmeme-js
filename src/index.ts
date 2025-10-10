import axios from "axios";
import * as cheerio from "cheerio";

export interface MemeResult {
  title: string,
  link: string,
  thumbnail: string
}

export interface MemeSection {
  title: string,
  contents: Record<string, any>
}

export interface MemeDetails {
  title: string,
  link: string,
  image: string,
  imageAlt: string,
  views: number | null,
  sections: MemeSection[],
  googleTrends: string,
  type: string[],
  year: string,
  origin: string,
  region: string,
  tags: string[]
}

const BASE_URL = "https://knowyourmeme.com/search?q=";

/**
 * Search for memes on KnowYourMeme.com
 * @param query - The search query string
 * @param max - Maximum number of results to return (default = 10)
 * @returns Promise resolving to an array of MemeResult
 */
export async function search(
  query: string,
  max = 10
): Promise<MemeResult[]> {
  try {
    const { data } = await axios.get(BASE_URL + encodeURIComponent(query), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    });

    const $ = cheerio.load(data);

    const results: MemeResult[] = [];
    
    const sections = $("section.gallery");
    for (const sec of sections.toArray()) {
      const section = $(sec);
      const items = section.find("div.groups a.item").toArray();
      for (const el of items) {
        if (results.length >= max) break;

        const $el = $(el);
        const title = $el.attr("data-title")?.trim();
        const link = `https://knowyourmeme.com${$el.attr("href")}`;
        const img = $el.find("div > div:nth-child(1) > div.not-vertical-only > img");
        const thumbnail = img.attr("data-image") ?? img.attr("src") ?? "";

        if (!link) continue;

        results.push({
          title: title ?? "",
          link,
          thumbnail
        });
      }
      if (results.length >= max) break;
    }
    
    return results;
  } catch (err) {
    console.error("Searching failed: " + (err as Error).message);
    return [];
  }
}

/**
 * Get details of a meme on KnowYourMeme.com
 * @param url - The URL to the meme page
 * @returns Promise of MemeDetails
 */
export async function getMeme(url: string): Promise<MemeDetails | null> {
  try {
    if (!url.trim().startsWith("https://knowyourmeme.com")) {
      console.error("Please enter a valid KnowYourMeme.com URL!");
      return null;
    }
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    });

    const $ = cheerio.load(data);

    const result: MemeDetails = { title: "", link: "", image: "", imageAlt: "", views: null, sections: [], googleTrends: "", type: [], year: "", origin: "", region: "", tags: [] };

    const info = $("article.entry");

    const title = info
                  .children("div.desktop-only").first()
                  .children("header.rel")
                  .children("section.info")
                  .children("h1").text().trim();
    result.title = title;

    const link = url;
    result.link = link;

    const image = info
                  .children("div.desktop-only").first()
                  .children("header.rel")
                  .children("a");

    const imageUrl = image
                      .attr("href") ?? "";
    const imageAlt = image
                      .attr("alt") ?? "";

    result.image = imageUrl;
    result.imageAlt = imageAlt;

    const viewsText = info
                  .children("div.desktop-only").first()
                  .children("header.rel")
                  .children("section")
                  .children("div.cols")
                  .children("aside.stats")
                  .children("dl")
                  .children("dd.views")
                  .children("a").text().trim().replace(/,/g, "");
    const views = viewsText ? parseInt(viewsText, 10) : null;
    result.views = isNaN(views as number) ? null : views;
    
    const htmlSections = info.children("div.c").children("section.bodycopy");
    const sections: MemeSection[] = [];
    let current: MemeSection | null = null;
    htmlSections.children().each((_, el) => {
      if ($(el).is("h2")) {
        if ($(el).text().trim() === "Search Interest") {
          return false;          
        }
        if (current) sections.push(current);
        current = { title: $(el).text() ?? "", contents: [] };
      } else if ($(el).is("p") && current) {
        if ($(el).text() !== "") {
          current.contents.push($(el).text().replace(/\[\d+\]/g, "") ?? "");
        }
      } else if ($(el).is("center") && current) {
        let imageUrls: string[] = [];
        if ($(el).find("lite-youtube").length) {
          const videoId = $(el).children("lite-youtube").attr("videoid") ?? "";
          const params = $(el).children("lite-youtube").attr("params");
          let startAt = "";
          if (params) {
            const match = params.match(/start=(\d+)/);
            if (match) startAt = `&start=${match[1]}`
          }
          current.contents.push(`https://www.youtube.com/watch?v=${videoId}${startAt}`);
        } else if ($(el).find("lite-tiktok").length) {
          const videoUrl = $(el).children("lite-tiktok").children("blockquote").attr("cite") ?? "";
          current.contents.push(videoUrl);
        } else if ($(el).find("a").length) {
          const image = $(el).children("a").children("img");
          const imageUrl = image.attr("data-src") ?? image.attr("src") ?? "";
          imageUrls.push(imageUrl);
          current.contents.push(imageUrls);
        }
      }
    });
    if (current) sections.push(current);
    result.sections = sections;
    
    const googleTrends = info
                    .children("div.c")
                    .children("section.bodycopy")
                    .children("iframe.google-trends-iframe")
                    .attr("data-src") ?? "";
    result.googleTrends = googleTrends;

    const htmlStats = info.children("div.c").children("aside");

    const type = htmlStats
            .children("dl")
            .children("dt").filter((_, el) => $(el).text().trim() === "Type:")
            .next("dd")
            .children("a")
            .map((_, el) => $(el).text().trim()).get();
    const year = htmlStats
            .children("dl")
            .children("dt").filter((_, el) => $(el).text().trim() === "Year")
            .next("dd")
            .children("a").text().trim();
    const origin = htmlStats
              .children("dl")
              .children("dt").filter((_, el) => $(el).text().trim() === "Origin")
              .next("dd").text().trim();
    const region = htmlStats
              .children("dl")
              .children("dt").filter((_, el) => $(el).text().trim() === "Region")
              .next("dd")
              .children("a").text().trim();
    
    result.type = type;
    result.year = year;
    result.origin = origin;
    result.region = region;

    const tags = htmlStats.find("dl#entry_tags dd a")
      .map((_, el) => $(el).text().trim())
      .get()
    result.tags = tags as string[];

    return result;
  } catch (err) {
    console.error("Fetching meme failed: " + (err as Error).message);
    return null;
  }
}