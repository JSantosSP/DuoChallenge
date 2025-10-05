import { useUpload } from '../../hooks/useUpload';

const FileUploader = ({ onUploadComplete, currentImage }) => {
  const { uploadFile, uploading, progress, preview, generatePreview, clearPreview, error } = useUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    generatePreview(file);
    const path = await uploadFile(file);
    
    if (path && onUploadComplete) {
      onUploadComplete(path);
    }
  };

  const imageUrl = preview || (currentImage ? `${import.meta.env.VITE_API_URL}${currentImage}` : null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100">
          {imageUrl ? (
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearPreview();
                  if (onUploadComplete) onUploadComplete(null);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-5xl mb-4">📁</p>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
};

export default FileUploader;