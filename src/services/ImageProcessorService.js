import Tesseract from 'tesseract.js';

export class ImageProcessorService {

  static async processVQA(imageData, question) {
    console.log('[VQA] Starting with Groq API...');

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.warn('[VQA] No Groq key found');
      return this.getFallbackVQA(question);
    }

    try {
      const base64Image = imageData.split(',')[1];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                },
                {
                  type: 'text',
                  text: question
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('[VQA] Groq error:', err);
        throw new Error(`Groq API Error: ${response.status}`);
      }

      const result = await response.json();
      const answer = result.choices?.[0]?.message?.content || 'No answer returned.';

      console.log('[VQA] ✅ Groq SUCCESS!');
      return {
        success: true,
        answer,
        confidence: 0.95,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[VQA] Groq failed:', error);
      return this.getFallbackVQA(question);
    }
  }

  static getFallbackVQA(question) {
    const responses = {
      'what': 'This image contains various visual elements. (Demo mode - add API key for real analysis)',
      'describe': 'The image shows a scene with multiple components. (Demo mode)',
      'how many': 'Multiple objects are visible in the image. (Demo mode)',
      'color': 'Various colors are present in the image. (Demo mode)',
      'default': `Regarding "${question}" - the image contains relevant visual information. (Demo mode)`
    };

    const lowerQuestion = question.toLowerCase();
    let answer = responses.default;

    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        answer = value;
        break;
      }
    }

    return {
      success: true,
      answer,
      confidence: 0.75,
      timestamp: new Date().toISOString()
    };
  }

  // ---- OCR and Enhancement below are unchanged ----

  static async processOCR(imageData) {
    try {
      console.log('Starting OCR with line-level extraction...');

      const worker = await Tesseract.createWorker('eng');
      const { data } = await worker.recognize(imageData);

      console.log('OCR Complete!');
      await worker.terminate();

      if (!data.text || !data.text.trim()) {
        return {
          success: true,
          textBlocks: [],
          fullText: 'No text detected',
          language: 'en',
          timestamp: new Date().toISOString()
        };
      }

      let textBlocks = [];
      const img = await this.loadImage(imageData);
      const lines = data.text.trim().split('\n');
      const lineHeight = img.height * 0.15;
      const paddingY = img.height * 0.09;
      const paddingX = img.width * 0.04;

      lines.forEach((lineText, index) => {
        if (lineText.trim()) {
          const words = lineText.trim().split(/\s+/);
          const avgCharWidth = img.width * 0.022;
          const spaceWidth = avgCharWidth * 0.5;
          let currentX = paddingX;
          const currentY = paddingY + (index * lineHeight);

          words.forEach(word => {
            const wordWidth = word.length * avgCharWidth;
            textBlocks.push({
              text: word,
              x: Math.round(currentX),
              y: Math.round(currentY),
              width: Math.round(wordWidth),
              height: Math.round(lineHeight * 0.55),
              confidence: 0.95
            });
            currentX += wordWidth + spaceWidth + (avgCharWidth * 0.8);
          });
        }
      });

      return {
        success: true,
        textBlocks,
        fullText: data.text.trim(),
        language: 'en',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ OCR Error:', error);
      return this.getMockOCRResponse();
    }
  }

  static loadImage(imageData) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageData;
    });
  }

  static getMockOCRResponse() {
    return {
      success: true,
      textBlocks: [{ text: 'Sample Text', x: 50, y: 50, width: 200, height: 30, confidence: 0.95 }],
      fullText: 'Sample Text',
      language: 'en',
      timestamp: new Date().toISOString()
    };
  }

  static async enhanceImage(imageData, options = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        const brightness = options.brightness || 0;
        const contrast = options.contrast || 0;
        const saturation = options.saturation || 0;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          r += brightness;
          g += brightness;
          b += brightness;

          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;

          if (saturation !== 0) {
            const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
            r = gray + (r - gray) * (1 + saturation / 100);
            g = gray + (g - gray) * (1 + saturation / 100);
            b = gray + (b - gray) * (1 + saturation / 100);
          }

          data[i] = Math.max(0, Math.min(255, r));
          data[i + 1] = Math.max(0, Math.min(255, g));
          data[i + 2] = Math.max(0, Math.min(255, b));
        }

        ctx.putImageData(imageDataObj, 0, 0);

        resolve({
          success: true,
          enhancedImage: canvas.toDataURL('image/png'),
          timestamp: new Date().toISOString(),
          appliedSettings: options
        });
      };
      img.src = imageData;
    });
  }

  static async removeDarkness(imageData) {
    return this.enhanceImage(imageData, {
      brightness: 40,
      contrast: 20,
      saturation: 10
    });
  }
}