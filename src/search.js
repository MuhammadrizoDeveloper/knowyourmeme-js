import { search, getMeme } from './utils.js';

// Example usage of the search function
async function exampleSearch() {
    try {
        console.log('Searching for "rickroll"...');
        const results = await search('rickroll', { limit: 5 });
        
        console.log(`Found ${results.length} results:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.title}`);
            console.log(`   Link: ${result.link}`);
            if (result.description && result.description !== 'No description available') {
                console.log(`   Description: ${result.description}`);
            }
            console.log('');
        });
        
        // Example of getting details for the first result
        if (results.length > 0) {
            console.log('Getting details for first result...');
            const memeDetails = await getMeme(results[0].link);
            console.log('Meme Details:', JSON.stringify(memeDetails, null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the example
exampleSearch();