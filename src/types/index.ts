export interface UploadedFile {
  id: string;
  name: string;
  path: string;
  fullPath: string;
  createdAt: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}
