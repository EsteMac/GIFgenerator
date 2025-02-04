const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');

// Configuration Parameters
const CONFIG = {
    // Canvas dimensions
    WIDTH: 600,
    HEIGHT: 200,
    
    // Animation settings
    FRAMES_PER_SECOND: 15,
    TOTAL_FRAMES: 60,
    
    // Symbol settings
    BINARY_FONT_SIZE: 16,
    SPECIAL_FONT_SIZE: 14,
    SYMBOLS: ['1', '0', '1', '0', '•', '◆', '○', '□'],
    
    // Layer settings
    NUMBER_OF_LAYERS: 4,
    BASE_ALPHA: 0.8,
    ALPHA_DECREASE: 0.15,
    
    // Movement settings
    BASE_SPEED: 4,
    SPEED_DECREASE: 0.5,
    
    // Distribution settings
    SYMBOLS_PER_LAYER: 5,
    HORIZONTAL_SPREAD: 0.05,
    
    // New margin settings
    EDGE_MARGIN: 40,     // Pixels to leave empty at edges
    
    // Color settings
    SYMBOL_COLOR: '120, 235, 126'
};

class DataRainGenerator {
    constructor(config = CONFIG) {
        this.config = config;
    }

    generateFrame(ctx, frameIndex, layer) {
        const tileHeight = this.config.HEIGHT / (this.config.NUMBER_OF_LAYERS - layer);
        const symbols = Math.floor(this.config.SYMBOLS_PER_LAYER / (layer + 1));
        const alpha = this.config.BASE_ALPHA - (layer * this.config.ALPHA_DECREASE);
        const speed = this.config.BASE_SPEED - (layer * this.config.SPEED_DECREASE);
        
        ctx.fillStyle = `rgba(${this.config.SYMBOL_COLOR}, ${alpha})`;
        
        for (let i = 0; i < symbols; i++) {
            // Adjust base position to account for margins
            const usableWidth = this.config.WIDTH - (2 * this.config.EDGE_MARGIN);
            const baseX = this.config.EDGE_MARGIN + ((i / (symbols - 1)) * usableWidth);
            const offset = Math.sin(i * 397) * (usableWidth * this.config.HORIZONTAL_SPREAD);
            
            // Clamp x position to stay within margins
            const x = Math.max(
                this.config.EDGE_MARGIN,
                Math.min(
                    this.config.WIDTH - this.config.EDGE_MARGIN,
                    baseX + offset
                )
            );
            
            let y = (frameIndex * speed + (i * tileHeight / symbols)) % tileHeight;
            
            for (let repeat = 0; repeat < (this.config.NUMBER_OF_LAYERS - layer); repeat++) {
                const symbol = this.config.SYMBOLS[Math.floor(Math.random() * this.config.SYMBOLS.length)];
                
                if (symbol === '1' || symbol === '0') {
                    ctx.font = `${this.config.BINARY_FONT_SIZE - (layer * 3)}px monospace`;
                } else {
                    ctx.font = `${this.config.SPECIAL_FONT_SIZE - (layer * 3)}px monospace`;
                }
                
                ctx.fillText(symbol, x, y + (repeat * tileHeight));
            }
        }
    }

    generate() {
        const encoder = new GIFEncoder(this.config.WIDTH, this.config.HEIGHT);
        const canvas = createCanvas(this.config.WIDTH, this.config.HEIGHT);
        const ctx = canvas.getContext('2d');

        encoder.setDelay(1000 / this.config.FRAMES_PER_SECOND);
        encoder.start();
        encoder.setTransparent(true);
        encoder.setRepeat(0);
        
        for (let frameIndex = 0; frameIndex < this.config.TOTAL_FRAMES; frameIndex++) {
            ctx.clearRect(0, 0, this.config.WIDTH, this.config.HEIGHT);
            
            for (let layer = 0; layer < this.config.NUMBER_OF_LAYERS; layer++) {
                this.generateFrame(ctx, frameIndex, layer);
            }
            
            encoder.addFrame(ctx);
        }
        
        encoder.finish();
        
        const buffer = encoder.out.getData();
        fs.writeFileSync('dist/header-animation.gif', buffer);
        console.log('GIF generated successfully with transparency!');
    }
}

module.exports = DataRainGenerator;