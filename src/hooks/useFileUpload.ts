import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UploadProgress, UploadedFile } from '../types';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'image/jpeg', 'image/png', 'image/gif'];

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Plik jest za duży. Maksymalny rozmiar to 100MB (twój plik: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Nieobsługiwany format pliku. Dozwolone: wideo (mp4, webm, ogg, mov) i obrazy (jpg, png, gif)`;
    }

    return null;
  };

  const uploadFile = async (file: File, folder: string = ''): Promise<UploadedFile | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: validationError
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message);
      }

      setUploadProgress({
        fileName: file.name,
        progress: 100,
        status: 'success'
      });

      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      const uploadedFile: UploadedFile = {
        id: data.id || data.path,
        name: file.name,
        path: publicUrlData.publicUrl,
        fullPath: data.path,
        createdAt: new Date().toISOString(),
        size: file.size,
        type: file.type
      };

      return uploadedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd podczas uploadu';
      console.error('Upload failed:', error);

      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: errorMessage
      });

      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(null);
      }, 3000);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('videos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploadProgress,
    isUploading
  };
}
