import { X, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ImagePreviewer({ imageData, onClear, overlays = [] }) {
  const previewImgRef = useRef(null);
  const [previewScaledOverlays, setPreviewScaledOverlays] = useState([]);

  useEffect(() => {
    if (!previewImgRef.current || overlays.length === 0) {
      setPreviewScaledOverlays([]);
      return;
    }

    const updatePreviewOverlays = () => {
      const previewImg = previewImgRef.current;
      const previewNaturalWidth = previewImg.naturalWidth;
      const previewNaturalHeight = previewImg.naturalHeight;
      const previewDisplayedWidth = previewImg.clientWidth;
      const previewDisplayedHeight = previewImg.clientHeight;

      console.log('Natural size:', previewNaturalWidth, 'x', previewNaturalHeight);
      console.log('Displayed size:', previewDisplayedWidth, 'x', previewDisplayedHeight);

      // Calculate scale ratios
      const previewScaleX = previewDisplayedWidth / previewNaturalWidth;
      const previewScaleY = previewDisplayedHeight / previewNaturalHeight;

      console.log('Scale ratios:', previewScaleX, previewScaleY);

      // Scale all overlays
      const previewScaled = overlays.map(previewOverlay => ({
        ...previewOverlay,
        x: previewOverlay.x * previewScaleX,
        y: previewOverlay.y * previewScaleY,
        width: previewOverlay.width * previewScaleX,
        height: previewOverlay.height * previewScaleY,
      }));

      console.log('Original overlay sample:', overlays[0]);
      console.log('Scaled overlay sample:', previewScaled[0]);

      setPreviewScaledOverlays(previewScaled);
    };

    // Update overlays when image loads and when window resizes
    if (previewImgRef.current.complete) {
      updatePreviewOverlays();
    }

    const previewImg = previewImgRef.current;
    previewImg.addEventListener('load', updatePreviewOverlays);
    window.addEventListener('resize', updatePreviewOverlays);

    return () => {
      previewImg?.removeEventListener('load', updatePreviewOverlays);
      window.removeEventListener('resize', updatePreviewOverlays);
    };
  }, [overlays, imageData]);

  const handlePreviewDownload = () => {
    const previewDownloadLink = document.createElement('a');
    previewDownloadLink.href = imageData;
    previewDownloadLink.download = `processed-image-${Date.now()}.png`;
    document.body.appendChild(previewDownloadLink);
    previewDownloadLink.click();
    document.body.removeChild(previewDownloadLink);
  };

  return (
    <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handlePreviewDownload}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          title="Download image"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClear}
          className="p-2 bg-gray-800 hover:bg-red-600 text-white rounded-lg transition-colors"
          title="Clear image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <img
          ref={previewImgRef}
          src={imageData}
          alt="Preview"
          className="w-full h-auto max-h-[600px] object-contain"
        />
        {previewScaledOverlays.map((previewOverlay, previewIndex) => (
          <div
            key={previewIndex}
            className="absolute border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 pointer-events-none"
            style={{
              left: `${previewOverlay.x}px`,
              top: `${previewOverlay.y}px`,
              width: `${previewOverlay.width}px`,
              height: `${previewOverlay.height}px`,
            }}
            title={previewOverlay.text}
          />
        ))}
      </div>
    </div>
  );
}