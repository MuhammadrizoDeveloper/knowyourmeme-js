import * as cheerio from "cheerio";
import axios from "axios";

/**
 * Search for memes on Know Your Meme
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {number} options.limit - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Array of search results
 */
export async function search(query, options = {}) {
    const { limit = 10 } = options;
    
    try {
        const response = await axios.get(`https://knowyourmeme.com/search?context=&sort=&q=${encodeURIComponent(query)}`);
        const html = response.data;
        
        return parseSearchResults(html, limit);
    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
}

/**
 * Get detailed information about a specific meme
 * @param {string} url - URL of the meme page
 * @returns {Promise<Object>} Meme details
 */
export async function getMeme(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        
        return parseMemeDetails(html, url);
    } catch (error) {
        throw new Error(`Failed to fetch meme details: ${error.message}`);
    }
}

/**
 * Parse search results from HTML
 * @param {string} html - HTML content
 * @param {number} limit - Maximum number of results
 * @returns {Array} Array of search results
 */
function parseSearchResults(html, limit) {
    const $ = cheerio.load(html);
    const searchResults = [];
    
    // Try to find search result items - common selectors for search results
    $('.entry-grid-body .entry-grid-item, .search-result, .meme-entry, [class*="search"], [class*="result"]').each((index, element) => {
        if (searchResults.length >= limit) return false; // Stop if limit reached
        
        const $element = $(element);
        
        // Extract title/link
        const title = $element.find('h2, h3, .entry-title, .title, a').first().text().trim();
        const link = $element.find('a').first().attr('href');
        
        // Extract description/summary
        const description = $element.find('.entry-body, .description, .summary, p').first().text().trim();
        
        // Extract image if available
        const image = $element.find('img').first().attr('src');
        
        if (title && link) {
            searchResults.push({
                title,
                link: link.startsWith('http') ? link : `https://knowyourmeme.com${link}`,
                description: description || 'No description available',
                image: image || null
            });
        }
    });
    
    // If no results found with common selectors, try alternative approaches
    if (searchResults.length === 0) {
        // Look for any links that might be search results
        $('a[href*="/memes/"], a[href*="/photos/"], a[href*="/videos/"]').each((index, element) => {
            if (searchResults.length >= limit) return false;
            
            const $element = $(element);
            const title = $element.text().trim();
            const link = $element.attr('href');
            
            if (title && link && title.length > 3) { // Filter out very short text
                searchResults.push({
                    title,
                    link: link.startsWith('http') ? link : `https://knowyourmeme.com${link}`,
                    description: 'Link found',
                    image: null
                });
            }
        });
    }
    
    return searchResults.slice(0, limit);
}

/**
 * Parse meme details from HTML
 * @param {string} html - HTML content
 * @param {string} url - Original URL
 * @returns {Object} Meme details
 */
function parseMemeDetails(html, url) {
    const $ = cheerio.load(html);
    
    // Extract basic information
    const title = $('h1, .entry-title, .title').first().text().trim();
    const description = $('.entry-body, .description, .summary, .entry-content p').first().text().trim();
    
    // Extract images
    const images = [];
    $('img[src*="kym-cdn"], img[src*="knowyourmeme"]').each((index, element) => {
        const src = $(element).attr('src');
        const alt = $(element).attr('alt');
        if (src && !images.some(img => img.src === src)) {
            images.push({ src, alt: alt || '' });
        }
    });
    
    // Extract tags/categories
    const tags = [];
    $('.entry-tags a, .tags a, [class*="tag"] a').each((index, element) => {
        const tag = $(element).text().trim();
        if (tag && !tags.includes(tag)) {
            tags.push(tag);
        }
    });
    
    // Extract origin information
    const origin = $('.entry-origin, .origin, [class*="origin"]').text().trim();
    
    // Extract year
    const year = $('.entry-year, .year, [class*="year"]').text().trim();
    
    // Extract status
    const status = $('.entry-status, .status, [class*="status"]').text().trim();
    
    // Extract external links
    const externalLinks = [];
    $('a[href^="http"]:not([href*="knowyourmeme"]):not([href*="kym-cdn"])').each((index, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href && text && !externalLinks.some(link => link.url === href)) {
            externalLinks.push({ url: href, text });
        }
    });
    
    return {
        title: title || 'Unknown',
        description: description || 'No description available',
        url,
        images: images.slice(0, 10), // Limit to first 10 images
        tags: tags.slice(0, 20), // Limit to first 20 tags
        origin: origin || null,
        year: year || null,
        status: status || null,
        externalLinks: externalLinks.slice(0, 10), // Limit to first 10 external links
        scrapedAt: new Date().toISOString()
    };
}