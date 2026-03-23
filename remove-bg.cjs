const Jimp = require('jimp');

async function processImage(filename) {
  try {
    const image = await Jimp.read(filename);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    
    // Get background color from top-left pixel
    const bg = Jimp.intToRGBA(image.getPixelColor(0, 0));
    
    const tolerance = 60; // Enough to catch antialiased borders slightly
    
    image.scan(0, 0, w, h, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      const rDiff = Math.abs(red - bg.r);
      const gDiff = Math.abs(green - bg.g);
      const bDiff = Math.abs(blue - bg.b);
      
      if (rDiff < tolerance && gDiff < tolerance && bDiff < tolerance) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });

    await image.writeAsync(filename);
    console.log("Processed " + filename);
  } catch (err) {
    console.error("Skipping " + filename, err.message);
  }
}

async function main() {
  await processImage('public/poule.png');
  await processImage('public/minotaure.png');
}

main();
