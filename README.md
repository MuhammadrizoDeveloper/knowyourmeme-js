# Know Your Meme JS

A scraper npm package to search and get meme details from [KnowYourMeme.com](https://knowyourmeme.com/).

## Features

- 🔍 **Search memes** by query with customizable result limits
- 📖 **Get detailed meme information** including images, tags, origin, and more
- 🚀 **Fast and lightweight** using Cheerio for HTML parsing
- 📦 **ES6 modules** support
- 🛡️ **Error handling** with descriptive error messages

## Installation

```bash
npm install knowyourmeme-js
```

## Usage

### Basic Search

```javascript
import { search } from 'knowyourmeme-js';

// Search for memes
const results = await search('rickroll');
console.log(results);
```

### Search with Options

```javascript
import { search } from 'knowyourmeme-js';

// Search with custom limit
const results = await search('doge', { limit: 20 });
console.log(`Found ${results.length} results`);
```

### Get Meme Details

```javascript
import { getMeme } from 'knowyourmeme-js';

// Get detailed information about a specific meme
const memeDetails = await getMeme('https://knowyourmeme.com/memes/rickroll');
console.log(memeDetails);
```

### Complete Example

```javascript
import { search, getMeme } from 'knowyourmeme-js';

async function exploreMeme() {
    try {
        // Search for memes
        const searchResults = await search('pepe', { limit: 5 });
        
        console.log('Search Results:');
        searchResults.forEach((result, index) => {
            console.log(`${index + 1}. ${result.title}`);
            console.log(`   Link: ${result.link}`);
            console.log(`   Description: ${result.description}`);
        });
        
        // Get details for the first result
        if (searchResults.length > 0) {
            const memeDetails = await getMeme(searchResults[0].link);
            console.log('\nMeme Details:');
            console.log(`Title: ${memeDetails.title}`);
            console.log(`Tags: ${memeDetails.tags.join(', ')}`);
            console.log(`Images: ${memeDetails.images.length} found`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

exploreMeme();
```

## API Reference

### `search(query, options)`

Searches for memes on KnowYourMeme.com.

**Parameters:**
- `query` (string): Search query
- `options` (object, optional):
  - `limit` (number): Maximum number of results (default: 10)

**Returns:** Promise<Array> - Array of search result objects

**Search Result Object:**
```javascript
{
    title: string,
    link: string,
    description: string,
    image: string | null
}
```

### `getMeme(url)`

Gets detailed information about a specific meme.

**Parameters:**
- `url` (string): URL of the meme page on Know Your Meme

**Returns:** Promise<Object> - Meme details object

**Meme Details Object:**
```javascript
{
    title: string,
    description: string,
    url: string,
    images: Array<{src: string, alt: string}>,
    tags: Array<string>,
    origin: string | null,
    year: string | null,
    status: string | null,
    externalLinks: Array<{url: string, text: string}>,
    scrapedAt: string
}
```

## Error Handling

The package throws descriptive errors for common issues:

```javascript
try {
    const results = await search('invalid-query');
} catch (error) {
    if (error.message.includes('Search failed')) {
        console.log('Search request failed');
    } else if (error.message.includes('Failed to fetch meme details')) {
        console.log('Could not fetch meme details');
    }
}
```

## Requirements

- Node.js 14.0.0 or higher
- ES6 modules support

## Dependencies

- `axios`: HTTP client for making requests
- `cheerio`: HTML parsing and manipulation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
