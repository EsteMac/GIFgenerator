const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

class DataRainGenerator {
    constructor(width = 600, height = 200) {
        this.width = width;
        this.height = height;
        this.layers = 4;
        this.framesPerSecond = 24;
        this.symbols = ['0', '1', '•', '◆', '○', '□'];
        this.colors = ['#1c7ff2', '#4c9ff4', '#7cbff7', '#acdffa'];
        this.backgroundColor = '#fafafa';
    }

    generateFrame(ctx, frameIndex, layer) {
        const tileHeight = this.height / (this.layers - layer);
        const symbols = Math.floor(10 / (layer + 1)); // Fewer symbols in back layers
        const alpha = 0.8 - (layer * 0.15); // More transparent in back
        const speed = 8 - (layer * 1.5); // Slower in back
        
        ctx.fillStyle = `rgba(28, 127, 242, ${alpha})`; // Using brand blue
        ctx.font = `${16 - (layer * 3)}px monospace`; // Smaller in back

        // Create repeating pattern for each layer
        for (let i = 0; i < symbols; i++) {
            const x = (Math.sin(i * 397) * this.width) % this.width;
            let y = (frameIndex * speed + (i * tileHeight / symbols)) % tileHeight;
            
            // Repeat pattern vertically
            for (let repeat = 0; repeat < (this.layers - layer); repeat++) {
                const symbol = this.symbols[Math.floor(i % this.symbols.length)];
                ctx.fillText(symbol, x, y + (repeat * tileHeight));
            }
        }
    }

    generate() {
        const encoder = new GIFEncoder(this.width, this.height);
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');
        const frameCount = 60; // Using optimal frame count

        encoder.createReadStream().pipe(require('fs').createWriteStream('dist/header-animation.gif'));
        encoder.start();
        encoder.setRepeat(0); // Loop forever
        encoder.setDelay(1000 / this.framesPerSecond);
        encoder.setQuality(10); // Lower = better compression
        
        // Generate each frame
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            // Clear canvas with background color
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw each layer
            for (let layer = 0; layer < this.layers; layer++) {
                this.generateFrame(ctx, frameIndex, layer);
            }
            
            // Add gradient fade at bottom using background color
            const gradient = ctx.createLinearGradient(0, this.height - 50, 0, this.height);
            gradient.addColorStop(0, `${this.backgroundColor}00`); // Transparent background
            gradient.addColorStop(1, this.backgroundColor); // Solid background
            ctx.fillStyle = gradient;
            ctx.fillRect(0, this.height - 50, this.width, this.height);
            
            encoder.addFrame(ctx);
        }
        
        encoder.finish();
        console.log('GIF generated successfully!');
    }
}

module.exports = DataRainGenerator;