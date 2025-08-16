declare module "knowyourmeme-js" {
    export interface SearchResult {
        title: string;
        link: string;
        description: string;
        image: string | null;
    }

    export interface MemeDetails {
        title: string;
        description: string;
        url: string;
        images: Array<{ src: string; alt: string }>;
        tags: Array<string>;
        origin: string | null;
        year: string | null;
        status: string | null;
        externalLinks: Array<{ url: string; text: string }>;
        scrapedAt: string;
    }

    export interface SearchOptions {
        limit?: number;
    }

    /**
     * Search for memes on Know Your Meme
     * @param query - Search query
     * @param options - Search options
     * @returns Promise<Array> - Array of search result objects
     */
    export function search(
        query: string,
        options?: SearchOptions
    ): Promise<SearchResult[]>;

    /**
     * Get detailed information about a specific meme
     * @param url - URL of the meme page
     * @returns Promise<Object> - Meme details object
     */
    export function getMeme(url: string): Promise<MemeDetails>;
}
