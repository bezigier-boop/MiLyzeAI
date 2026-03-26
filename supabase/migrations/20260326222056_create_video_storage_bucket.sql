/*
  # Create Video Storage Bucket

  1. Storage Setup
    - Create a public storage bucket called 'videos' for storing user uploaded video files
    - Enable public access for viewing videos

  2. Notes
    - Videos are stored with unique filenames to prevent collisions
    - Public bucket allows direct video playback without signed URLs
    - File size limit: 100MB per file
    - Allowed formats: video files (mp4, webm, ogg, mov) and images (jpg, png, gif)
*/

-- Create the videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;