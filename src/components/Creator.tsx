import { useState, useRef } from 'react';
import { Upload, Folder, Video, Image, Trash2, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import type { UploadedFile } from '../types';

export function Creator() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folders] = useState<string[]>(['Videos', 'Images', 'Projects']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, deleteFile, uploadProgress, isUploading } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const uploadedFile = await uploadFile(file, currentFolder);

      if (uploadedFile) {
        setFiles(prev => [...prev, uploadedFile]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    const success = await deleteFile(file.fullPath);
    if (success) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      const uploadedFile = await uploadFile(file, currentFolder);

      if (uploadedFile) {
        setFiles(prev => [...prev, uploadedFile]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="creator-container">
      <div className="creator-sidebar">
        <h2>Foldery</h2>
        <div className="folder-list">
          <button
            className={`folder-item ${currentFolder === '' ? 'active' : ''}`}
            onClick={() => setCurrentFolder('')}
          >
            <Folder size={20} />
            <span>Wszystkie pliki</span>
          </button>
          {folders.map(folder => (
            <button
              key={folder}
              className={`folder-item ${currentFolder === folder ? 'active' : ''}`}
              onClick={() => setCurrentFolder(folder)}
            >
              <Folder size={20} />
              <span>{folder}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="creator-main">
        <div className="creator-header">
          <h1>Creator</h1>
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload size={20} />
            Wgraj plik
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {uploadProgress && (
          <div className={`upload-progress ${uploadProgress.status}`}>
            {uploadProgress.status === 'uploading' && (
              <>
                <div className="spinner"></div>
                <span>Wgrywanie: {uploadProgress.fileName}...</span>
              </>
            )}
            {uploadProgress.status === 'success' && (
              <>
                <CheckCircle size={20} />
                <span>Upload zakończony: {uploadProgress.fileName}</span>
              </>
            )}
            {uploadProgress.status === 'error' && (
              <>
                <AlertCircle size={20} />
                <span>Błąd: {uploadProgress.error}</span>
              </>
            )}
          </div>
        )}

        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload size={48} />
          <p>Przeciągnij i upuść pliki tutaj</p>
          <p className="drop-zone-hint">lub kliknij przycisk "Wgraj plik"</p>
        </div>

        <div className="files-grid">
          {files
            .filter(file => !currentFolder || file.fullPath.startsWith(currentFolder))
            .map(file => (
              <div key={file.id} className="file-card">
                <div className="file-preview">
                  {file.type.startsWith('video/') ? (
                    <video src={file.path} controls />
                  ) : (
                    <img src={file.path} alt={file.name} />
                  )}
                </div>
                <div className="file-info">
                  <div className="file-icon">
                    {file.type.startsWith('video/') ? (
                      <Video size={20} />
                    ) : (
                      <Image size={20} />
                    )}
                  </div>
                  <div className="file-details">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(file)}
                    title="Usuń plik"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {files.length === 0 && (
          <div className="empty-state">
            <Video size={64} />
            <p>Brak plików</p>
            <p className="empty-hint">Wgraj swój pierwszy plik, aby zacząć</p>
          </div>
        )}
      </div>
    </div>
  );
}
