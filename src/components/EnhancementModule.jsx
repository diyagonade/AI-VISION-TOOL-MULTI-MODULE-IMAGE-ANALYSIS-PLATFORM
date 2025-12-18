// Image Enhancement Module - Diya & Alisha Implementation
// Created: December 2024 for AI Vision Tool Project
// DTU Software Engineering Department

import { useState } from 'react';
import { Loader2, Wand2, RotateCcw, Download } from 'lucide-react';
import { ImageProcessorService } from '../services/ImageProcessorService';

export function EnhancementModule({ imageData, onEnhancedImage, onSaveEnhancement }) {
  // State management - Diya's implementation
  const [isEnhancementInProgress, setIsEnhancementInProgress] = useState(false);
  const [customEnhancementParams, setCustomEnhancementParams] = useState({
    brightnessLevel: 0,
    contrastLevel: 0,
    saturationLevel: 0,
  });
  const [enhancementApplied, setEnhancementApplied] = useState(false);

  // Quick auto-enhance function - Alisha's contribution
  // Optimized settings: brightness +40, contrast +20, saturation +10
  const applyQuickEnhancement = async () => {
    setIsEnhancementInProgress(true);
    console.log('[Diya-Alisha Tool] Starting quick enhancement...');
    
    try {
      const enhancementResult = await ImageProcessorService.removeDarkness(imageData);
      onEnhancedImage(enhancementResult.enhancedImage);
      setEnhancementApplied(true);

      if (onSaveEnhancement) {
        onSaveEnhancement('auto', enhancementResult.appliedSettings, enhancementResult.enhancedImage);
      }
      console.log('[Diya-Alisha Tool] Quick enhancement successful!');
    } catch (enhancementError) {
      console.error('[Diya-Alisha Tool] Enhancement failed:', enhancementError);
      alert('Enhancement failed! Please try again.');
    } finally {
      setIsEnhancementInProgress(false);
    }
  };

  // Custom enhancement with user-defined parameters
  // Diya's implementation - Dec 2024
  const applyCustomEnhancement = async () => {
    setIsEnhancementInProgress(true);
    console.log('[Diya-Alisha Tool] Applying custom settings:', customEnhancementParams);
    
    try {
      const enhancementResult = await ImageProcessorService.enhanceImage(
        imageData, 
        customEnhancementParams
      );
      onEnhancedImage(enhancementResult.enhancedImage);
      setEnhancementApplied(true);

      if (onSaveEnhancement) {
        onSaveEnhancement('custom', customEnhancementParams, enhancementResult.enhancedImage);
      }
      console.log('[Diya-Alisha Tool] Custom enhancement applied successfully!');
    } catch (enhancementError) {
      console.error('[Diya-Alisha Tool] Custom enhancement error:', enhancementError);
      alert('Could not apply enhancement. Please check your settings.');
    } finally {
      setIsEnhancementInProgress(false);
    }
  };

  // Reset all enhancements to default - Alisha's function
  const resetEnhancementSettings = () => {
    console.log('[Diya-Alisha Tool] Resetting enhancement settings to default');
    setCustomEnhancementParams({
      brightnessLevel: 0,
      contrastLevel: 0,
      saturationLevel: 0,
    });
    onEnhancedImage(null);
    setEnhancementApplied(false);
  };

  // Handle slider value changes - shared implementation
  const updateSliderValue = (parameterName, newValue) => {
    console.log(`[Diya-Alisha Tool] Updating ${parameterName} to ${newValue}`);
    setCustomEnhancementParams((previousParams) => ({
      ...previousParams,
      [parameterName]: parseInt(newValue),
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header section - Diya's design */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Image Enhancement Tool
        </h2>
        <p className="text-gray-600">
          Enhance your images with our custom brightness, contrast, and saturation controls.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Developed by Diya & Alisha - DTU SE 2024
        </p>
      </div>

      <div className="space-y-6">
        {/* Quick enhancement section - Alisha's design */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🚀 One-Click Enhancement
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Apply optimized settings instantly (Brightness: +40, Contrast: +20, Saturation: +10)
          </p>
          <button
            onClick={applyQuickEnhancement}
            disabled={isEnhancementInProgress}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
          >
            {isEnhancementInProgress ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Quick Enhance
              </>
            )}
          </button>
        </div>

        {/* Custom adjustment controls - Diya's implementation */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ⚙️ Manual Adjustment Controls
          </h3>

          <div className="space-y-5">
            {/* Brightness control */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Brightness Level
                </label>
                <span className="text-sm text-gray-600 font-mono">
                  {customEnhancementParams.brightnessLevel}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={customEnhancementParams.brightnessLevel}
                onChange={(e) => updateSliderValue('brightnessLevel', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Contrast control */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Contrast Level
                </label>
                <span className="text-sm text-gray-600 font-mono">
                  {customEnhancementParams.contrastLevel}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={customEnhancementParams.contrastLevel}
                onChange={(e) => updateSliderValue('contrastLevel', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Saturation control */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Saturation Level
                </label>
                <span className="text-sm text-gray-600 font-mono">
                  {customEnhancementParams.saturationLevel}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={customEnhancementParams.saturationLevel}
                onChange={(e) => updateSliderValue('saturationLevel', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={applyCustomEnhancement}
              disabled={isEnhancementInProgress}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply Custom Settings
            </button>
            <button
              onClick={resetEnhancementSettings}
              disabled={isEnhancementInProgress || !enhancementApplied}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>

        {/* Success message */}
        {enhancementApplied && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium mb-2">
              ✅ Enhancement Successfully Applied!
            </p>
            <p className="text-sm text-green-600">
              Your enhanced image is displayed in the preview above. You can download it or apply more adjustments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}