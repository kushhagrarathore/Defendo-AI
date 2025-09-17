import { useState, useRef } from 'react'
import { validateImageFiles } from '../utils/imageUpload'

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`)
      return
    }

    // Validate files
    const validationErrors = validateImageFiles(fileArray)
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    setError(null)
    onImagesChange([...images, ...fileArray])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    setError(null)
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10'
            : 'border-[#29382f] hover:border-[var(--primary-color)]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#111714] text-xl">
              {uploading ? 'hourglass_empty' : 'add_photo_alternate'}
            </span>
          </div>
          
          <div>
            <p className="text-white font-medium">
              {uploading ? 'Uploading...' : 'Upload Service Images'}
            </p>
            <p className="text-white/60 text-sm mt-1">
              Drag & drop images here or click to browse
            </p>
            <p className="text-white/40 text-xs mt-1">
              Max {maxImages} images, 5MB each (JPEG, PNG, WebP, GIF)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-sm">error</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white font-medium">Selected Images ({images.length}/{maxImages})</p>
            {!disabled && (
              <button
                onClick={openFileDialog}
                className="text-[var(--primary-color)] hover:text-[#2a5a3a] text-sm font-medium transition-colors"
              >
                Add More
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-[#29382f]">
                  {typeof image === 'string' ? (
                    // URL string (already uploaded)
                    <img
                      src={image}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjkzODJmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
                      }}
                    />
                  ) : (
                    // File object (preview)
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {!disabled && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    aria-label="Remove image"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
