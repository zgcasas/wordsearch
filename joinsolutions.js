import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const joinImages = (folder, amountSolutions) => {
    // Read the directory and filter PNG files
    fs.readdir(folder, (err, files) => {
        if (err) throw err;

        const imageFiles = files
            .filter(file => file.startsWith('solution-') && file.endsWith('.png'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/solution-(\d+)\.png/)[1]);
                const numB = parseInt(b.match(/solution-(\d+)\.png/)[1]);
                return numA - numB;
            });

        // Process files in batches of amountSolutions
        for (let i = 0; i < imageFiles.length; i += amountSolutions) {
            const batch = imageFiles.slice(i, i + amountSolutions);

            // Read all images in the batch into buffers
            Promise.all(batch.map(file => sharp(path.join(folder, file)).toBuffer()))
                .then(buffers => {
                    const rows = Math.ceil(Math.sqrt(amountSolutions));
                    const cols = Math.ceil(amountSolutions / rows);
                    const width = 2300; // Assume each image is 400x400
                    const height = 3300; // Assume each image is 400x400

                    // Create the composite image
                    return sharp({
                        create: {
                            width: cols * width,
                            height: rows * height,
                            channels: 4,
                            background: { r: 255, g: 255, b: 255, alpha: 1 }
                        },
                    }).composite(buffers.map((buffer, index) => ({
                            input: buffer,
                            top: Math.floor(index / cols) * height,
                            left: (index % cols) * width
                        })))
                    .extract({
                        left: 0,
                        top: 0,
                        width: 4430,
                        height: 6550
                    })
                    .toFile(path.join(folder, `page-solution-${i / amountSolutions + 1}.png`));
                })
                .then(async () => {
                    // let buffer = await sharp(path.join(folder, `page-solution-${i / amountSolutions + 1}.png`))
                    //     .resize(3000)
                    //     .toBuffer();
                    // return sharp(buffer)
                    //     .toFile(path.join(folder, `page-solution-${i / amountSolutions + 1}.png`));
                })
                .then(() => {
                    console.log(`Created solution-page-${i / amountSolutions + 1}.png`);
                })
                .catch(err => {
                    console.error('Error processing batch:', err);
                });
        }
    });
};

// Usage example
const folderPath = './output';
const amountSolutions = 4;
joinImages(folderPath, amountSolutions);
