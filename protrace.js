import fs from 'fs';
import path from 'path';
import ImageTracer from 'imagetracerjs';
import PNG from 'pngjs';

const inputDir = 'output';
const outputDir = 'output';

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
        fs.readFile(inputFilePath, function (err, bytes) { // fs.readFile callback
            let reader = new PNG.PNG();
            reader.parse(bytes, function (err, png) {
                if (err) {
                    console.log(err);
                    throw err;
                }

                // creating an ImageData object
                const myImageData = {
                    width: png.width,
                    height: png.height,
                    data: png.data
                };

                // tracing to SVG string
                const options = {colorsampling: 1, numberofcolors: 8}

                const svgstring = ImageTracer.imagedataToSVG(myImageData, { pathomit:0, roundcoords:2, ltres:0.5, qtres:0.5, numberofcolors:32 });

                // writing to file
                fs.writeFile(
                    outputFilePath,
                    svgstring,
                    function (err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        console.log(`Processed: ${inputFilePath}`);
                    }
                );
            });
        });
    } catch (err) {
        console.error(`Error processing image: ${inputFilePath}`, err);
    }
};

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
