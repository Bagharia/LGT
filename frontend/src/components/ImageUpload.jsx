import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const ImageUpload = ({
  onImageUploaded,
  currentImage = null,
  type = 'product', // 'product' ou 'design'
  className = '',
  aspectRatio = '3/4' // Ratio d'affichage
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    // Validation de la taille (5MB pour produit, 10MB pour design)
    const maxSize = type === 'product' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Fichier trop volumineux. Maximum ${type === 'product' ? '5' : '10'}MB.`);
      return;
    }

    setError(null);
    setIsUploading(true);

    // Preview locale immédiate
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    try {
      const uploadFn = type === 'product'
        ? uploadAPI.uploadProductImage
        : uploadAPI.uploadDesignImage;

      const result = await uploadFn(file);

      if (result.success) {
        setPreview(result.image.url);
        onImageUploaded(result.image);
      } else {
        setError('Erreur lors de l\'upload');
        setPreview(currentImage);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
      setPreview(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: 'relative',
          aspectRatio: aspectRatio,
          border: isDragging ? '2px dashed #fff' : '2px dashed rgba(255,255,255,0.3)',
          borderRadius: '12px',
          cursor: 'pointer',
          overflow: 'hidden',
          backgroundColor: isDragging ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isUploading ? 0.5 : 1,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.7)' }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ marginBottom: '12px', opacity: 0.7 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Glissez une image ou cliquez
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.6 }}>
              JPG, PNG, WebP - Max {type === 'product' ? '5' : '10'}MB
            </p>
          </div>
        )}

        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px' }}>
          {error}
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
