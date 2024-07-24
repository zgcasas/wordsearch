import fs from 'fs';
import path from 'path';
import potrace from 'potrace';
import { promisify } from 'util';

const inputDir = 'output';
const outputDir = 'output';

// Promisify the potrace functions
const trace = promisify(potrace.posterize);

// Ensure input and output directories exist
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir);
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to process each image file
const processImage = async (inputFilePath, outputFilePath) => {
    try {
        var params = { steps: 4, color: true };
        const svg = await trace(inputFilePath, params);
        fs.writeFileSync(outputFilePath, svg);
        console.log(`Processed: ${inputFilePath}`);
    } catch (err) {
        console.error(`Error processing image: ${inputFilePath}`, err);
    }
};

// Read all PNG files from the input directory
const imageExtension = '.png';
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext === imageExtension) {
            const inputFilePath = path.join(inputDir, file);
            const outputFilePath = path.join(outputDir, `${path.parse(file).name}.svg`);
            processImage(inputFilePath, outputFilePath);
        }
    });
});
