# Know Your Meme JS

A scraper npm package to search and get information about memes from [KnowYourMeme.com](https://knowyourmeme.com/).

GitHub: [knowyourmeme-js](https://github.com/MuhammadrizoDeveloper/knowyourmeme-js)

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
const results = await search('shrek');
console.log(results);
```

### Search with Options

```javascript
import { search } from 'knowyourmeme-js';

// Search with custom limit
const results = await search('shrek', 5); // default is 10
console.log(`Found ${results.length} results`);
console.log(results);
```

### Get Meme Details

```javascript
import { getMeme } from 'knowyourmeme-js';

// Get detailed information about a specific meme
const meme = await getMeme('https://knowyourmeme.com/memes/shrek-rizz');
console.log(meme);
```

## API Reference

### `search(query, options)`

Searches for memes on KnowYourMeme.com.

**Parameters:**
- `query` (string): Search query
- `max` (number): Maximum number of results (default: 10)

**Returns:** Promise<Array> - Promise resolving to an array of MemeResult

**Search Result Object:**
```javascript
{
  title: string,
  link: string,
  thumbnail: string
}
```

### `getMeme(url)`

Gets detailed information about a specific meme.

**Parameters:**
- `url` (string): URL of the meme page on KnowYourMeme.com

**Returns:** Promise<Object> - Promise of MemeDetails

**MemeDetails Object:**
```javascript
{
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
```

## Requirements

- Node.js 14.0.0 or higher
- ES6 modules support

## Dependencies

- `axios`: HTTP client for making requests
- `cheerio`: HTML parsing and manipulation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
