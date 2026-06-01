import { useState } from 'react';
import { Loader2, Copy, CheckCheck, FileText } from 'lucide-react';
import { ImageProcessorService } from '../services/ImageProcessorService';

export function OCRModule({ imageData, onOverlaysChange, onSaveResult }) {
  const [ocrResult, setOcrResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleExtractText = async () => {
    setIsProcessing(true);
    console.log('OCR Module: Starting text extraction...');
    console.log('Image data length:', imageData?.length);
    
    try {
      const result = await ImageProcessorService.processOCR(imageData);
      console.log('OCR Module: Result received:', result);
      
      setOcrResult(result);
      onOverlaysChange(result.textBlocks);
  
      if (onSaveResult) {
        onSaveResult(result.fullText, result.textBlocks, result.language);
      }
    } catch (error) {
      console.error('OCR Module: Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    if (ocrResult?.fullText) {
      navigator.clipboard.writeText(ocrResult.fullText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Text Extraction (OCR)</h2>
        <p className="text-gray-600">
          Extract and highlight text from your image using optical character recognition.
        </p>
      </div>

      {!ocrResult ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <button
            onClick={handleExtractText}
            disabled={isProcessing}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Extract Text'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Found {ocrResult.textBlocks.length} text blocks
            </div>
            <button
              onClick={handleCopyText}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              {copiedText ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy All Text
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {ocrResult.textBlocks.map((block, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border border-gray-200 hover:border-yellow-400 transition-colors"
                >
                  <p className="text-gray-800 font-medium mb-1">{block.text}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Confidence: {(block.confidence * 100).toFixed(1)}%</span>
                    <span>
                      Position: ({block.x}, {block.y})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Text:</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{ocrResult.fullText}</p>
          </div>
        </div>
      )}
    </div>
  );
}