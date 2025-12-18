import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProcessingSession() {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSession = useCallback(async (imageUrl, imageSize) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('processing_sessions')
        .insert([{
          image_url: imageUrl,
          image_size: imageSize
        }])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      return data.id;
    } catch (err) {
      console.error('[Session] Creation error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveVQAInteraction = useCallback(async (
    currentSessionId, question, answer, confidence
  ) => {
    try {
      const { error } = await supabase
        .from('vqa_interactions')
        .insert([{
          session_id: currentSessionId,
          question,
          answer,
          confidence
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[VQA] Save error:', err);
      return false;
    }
  }, []);

  const saveOCRResult = useCallback(async (
    currentSessionId, extractedText, textBlocks, language = 'en'
  ) => {
    try {
      const { error } = await supabase
        .from('ocr_results')
        .insert([{
          session_id: currentSessionId,
          extracted_text: extractedText,
          text_blocks: textBlocks,
          language
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[OCR] Save error:', err);
      return false;
    }
  }, []);

  const saveEnhancement = useCallback(async (
    currentSessionId, operationType, settings, enhancedImageUrl
  ) => {
    try {
      const { error } = await supabase
        .from('enhancement_operations')
        .insert([{
          session_id: currentSessionId,
          operation_type: operationType,
          settings,
          enhanced_image_url: enhancedImageUrl
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Enhancement] Save error:', err);
      return false;
    }
  }, []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    setError(null);
  }, []);

  return {
    sessionId,
    loading,
    error,
    createSession,
    saveVQAInteraction,
    saveOCRResult,
    saveEnhancement,
    clearSession,
  };
}