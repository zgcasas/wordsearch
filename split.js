import fs from 'fs';
import path from 'path';

// Function to split an array into chunks of specified size
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

// Main function to process the JSON file
async function processJson(inputFilePath, wordsPerChunk) {
    // Read and parse the JSON file
    const rawData = await fs.promises.readFile(inputFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    // Initialize a list to hold the chunks for output files
    const outputChunks = [];

    // Process each category
    for (const category in data) {
        if (data.hasOwnProperty(category)) {
            const chunks = chunkArray(data[category], wordsPerChunk);

            // Add each chunk to the outputChunks array
            chunks.forEach((chunk, index) => {
                if (!outputChunks[index]) {
                    outputChunks[index] = {};
                }
                outputChunks[index][category] = chunk;
            });
        }
    }

    // Write each chunk to a new JSON file
    for (let i = 0; i < outputChunks.length; i++) {
        const outputFilePath = path.join(process.cwd(), `json/output_chunk_${i + 1}.json`);
        await fs.promises.writeFile(outputFilePath, JSON.stringify(outputChunks[i], null, 2));
        console.log(`Created ${outputFilePath}`);
    }
}

// Get the 'words' parameter from command line arguments
const words = parseInt(process.argv[2], 10);
if (isNaN(words) || words <= 0) {
    console.error('Please provide a valid number for the "words" parameter.');
    process.exit(1);
}

// Define the input JSON file path
const inputFilePath = path.join(process.cwd(), 'words.json');

// Run the main function
processJson(inputFilePath, words);
