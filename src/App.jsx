import { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ImagePreviewer } from './components/ImagePreviewer';
import ModuleTabs from './components/ModuleTabs';
import { VQAModule } from './components/VQAModule';
import { OCRModule } from './components/OCRModule';
import { EnhancementModule } from './components/EnhancementModule';
import { useProcessingSession } from './hooks/useProcessingSession';
import { Eye, Sparkles } from 'lucide-react';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [activeModule, setActiveModule] = useState('vqa');
  const [ocrOverlays, setOcrOverlays] = useState([]);

  const {
    createSession,
    saveVQAInteraction,
    saveOCRResult,
    saveEnhancement,
    clearSession,
  } = useProcessingSession();

  const currentImage = enhancedImage || uploadedImage;

  const handleImageUpload = async (imageData) => {
    setUploadedImage(imageData);
    setEnhancedImage(null);
    setOcrOverlays([]);
    await createSession(imageData, imageData.length);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setOcrOverlays([]);
    clearSession();
  };

  const handleEnhancedImage = (imageData) => {
    setEnhancedImage(imageData);
  };

  const handleOverlaysChange = (overlays) => {
    setOcrOverlays(overlays);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Vision Tool
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload an image and unlock powerful AI capabilities: Visual Question Answering, Text
            Extraction, and Image Enhancement
          </p>
        </header>

        {!uploadedImage ? (
          <div className="max-w-2xl mx-auto">
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ImagePreviewer
                imageData={currentImage}
                onClear={handleClearImage}
                overlays={activeModule === 'ocr' ? ocrOverlays : []}
              />
              {enhancedImage && (
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Showing enhanced version. Download or reset to see original.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <ModuleTabs activeModule={activeModule} onModuleChange={setActiveModule} />

              {activeModule === 'vqa' && (
                <VQAModule imageData={currentImage} onSaveInteraction={saveVQAInteraction} />
              )}
              {activeModule === 'ocr' && (
                <OCRModule
                  imageData={currentImage}
                  onOverlaysChange={handleOverlaysChange}
                  onSaveResult={saveOCRResult}
                />
              )}
              {activeModule === 'enhancement' && (
                <EnhancementModule
                  imageData={uploadedImage}
                  onEnhancedImage={handleEnhancedImage}
                  onSaveEnhancement={saveEnhancement}
                />
              )}
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            Built with React, Tailwind CSS, and AI Processing APIs
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
