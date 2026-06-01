/*
  # Create Image Processing History Tables

  ## Overview
  This migration creates tables to store image processing history for the AI Vision Tool,
  including VQA conversations, OCR results, and enhancement operations.

  ## New Tables
  
  ### `processing_sessions`
  Stores information about image upload sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `image_url` (text) - URL or path to the uploaded image
  - `image_size` (integer) - File size in bytes
  - `created_at` (timestamptz) - Session creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `vqa_interactions`
  Stores Visual Question Answering interactions
  - `id` (uuid, primary key) - Unique interaction identifier
  - `session_id` (uuid, foreign key) - Reference to processing session
  - `question` (text) - User's question about the image
  - `answer` (text) - AI-generated answer
  - `confidence` (decimal) - Confidence score of the answer
  - `created_at` (timestamptz) - Interaction timestamp

  ### `ocr_results`
  Stores Optical Character Recognition results
  - `id` (uuid, primary key) - Unique result identifier
  - `session_id` (uuid, foreign key) - Reference to processing session
  - `extracted_text` (text) - Full extracted text
  - `text_blocks` (jsonb) - Array of text blocks with positions
  - `language` (text) - Detected language
  - `created_at` (timestamptz) - Processing timestamp

  ### `enhancement_operations`
  Stores image enhancement operations
  - `id` (uuid, primary key) - Unique operation identifier
  - `session_id` (uuid, foreign key) - Reference to processing session
  - `operation_type` (text) - Type of enhancement (auto/custom)
  - `settings` (jsonb) - Enhancement settings applied
  - `enhanced_image_url` (text) - URL to enhanced image
  - `created_at` (timestamptz) - Enhancement timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for public access (for demo purposes)
  - In production, these should be restricted to authenticated users

  ## Notes
  - All tables use UUID primary keys with automatic generation
  - Timestamps are automatically managed
  - Foreign key constraints ensure referential integrity
  - JSONB columns allow flexible storage of complex data structures
*/

-- Create processing sessions table
CREATE TABLE IF NOT EXISTS processing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  image_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create VQA interactions table
CREATE TABLE IF NOT EXISTS vqa_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES processing_sessions(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  confidence decimal(4,3) DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

-- Create OCR results table
CREATE TABLE IF NOT EXISTS ocr_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES processing_sessions(id) ON DELETE CASCADE,
  extracted_text text NOT NULL,
  text_blocks jsonb DEFAULT '[]'::jsonb,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Create enhancement operations table
CREATE TABLE IF NOT EXISTS enhancement_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES processing_sessions(id) ON DELETE CASCADE,
  operation_type text NOT NULL DEFAULT 'custom',
  settings jsonb DEFAULT '{}'::jsonb,
  enhanced_image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE processing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vqa_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_operations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Allow public read access to sessions"
  ON processing_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to sessions"
  ON processing_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to VQA interactions"
  ON vqa_interactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to VQA interactions"
  ON vqa_interactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to OCR results"
  ON ocr_results FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to OCR results"
  ON ocr_results FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to enhancement operations"
  ON enhancement_operations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to enhancement operations"
  ON enhancement_operations FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vqa_session_id ON vqa_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ocr_session_id ON ocr_results(session_id);
CREATE INDEX IF NOT EXISTS idx_enhancement_session_id ON enhancement_operations(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON processing_sessions(created_at DESC);
