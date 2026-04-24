import opentype from 'opentype.js';

const fontCache = {};

/**
 * Dynamically loads a font from the jsdelivr fontsource CDN using opentype.js.
 * Implements a robust fallback strategy (400 -> 700 -> normal).
 * 
 * @param {string} fontName The exact name of the font (e.g., 'Bebas Neue')
 * @returns {Promise<opentype.Font>} A promise that resolves to the loaded OpenType font.
 */
export async function loadFont(fontName) {
  if (fontCache[fontName]) return fontCache[fontName];
  
  const id = fontName.toLowerCase().replace(/ /g, '-');
  const url400 = `https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/latin-400-normal.ttf`;
  const url700 = `https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/latin-700-normal.ttf`;
  const urlRegular = `https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/latin-normal.ttf`;
  
  return new Promise((resolve, reject) => {
    opentype.load(url400, (err, font) => {
      if (err) {
        opentype.load(url700, (err2, font2) => {
          if (err2) {
             opentype.load(urlRegular, (err3, font3) => {
                if (err3) reject(new Error(`Failed to load font ${fontName} (tried 400, 700, and normal).`));
                else {
                  fontCache[fontName] = font3;
                  resolve(font3);
                }
             });
          } else {
            fontCache[fontName] = font2;
            resolve(font2);
          }
        });
      } else {
        fontCache[fontName] = font;
        resolve(font);
      }
    });
  });
}
