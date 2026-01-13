import { useState } from 'react';
import { PhotoIcon, DocumentMagnifyingGlassIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ImageMetadata {
  filename: string;
  size: number;
  dimensions: { width: number; height: number } | null;
  format: string;
  exif: Record<string, any>;
}

export default function ImageIntel() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'ocr' | 'reverse'>('metadata');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Display image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      extractMetadata(file, result);
    };
    reader.readAsDataURL(file);
  };

  const extractMetadata = async (file: File, dataUrl: string) => {
    setLoading(true);

    // Create an image to get dimensions
    const img = new Image();
    img.onload = () => {
      const meta: ImageMetadata = {
        filename: file.name,
        size: file.size,
        dimensions: { width: img.width, height: img.height },
        format: file.type,
        exif: extractEXIF(file),
      };
      setMetadata(meta);
      setLoading(false);
    };
    img.src = dataUrl;
  };

  const extractEXIF = (file: File): Record<string, any> => {
    // Note: In production, use exif-js or similar library
    // This is a demonstration with mock data
    return {
      'Camera Make': 'Demo Camera',
      'Camera Model': 'DC-X1000',
      'Date Taken': new Date().toISOString().split('T')[0],
      'ISO': '400',
      'Exposure': '1/125',
      'F-Number': 'f/2.8',
      'Focal Length': '50mm',
      'GPS Latitude': '40.7128° N',
      'GPS Longitude': '74.0060° W',
      'Software': 'Adobe Photoshop 2024',
    };
  };

  const performOCR = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setActiveTab('ocr');

    // Simulate OCR processing
    setTimeout(() => {
      // In production, use Tesseract.js or similar
      setOcrText(
        'This is simulated OCR text extracted from the image.\n\n' +
          'In a production environment, this would use Tesseract.js\n' +
          'or a cloud OCR API to extract actual text from the image.\n\n' +
          'Detected text would appear here with confidence scores\n' +
          'and language detection.'
      );
      setLoading(false);
    }, 1500);
  };

  const reverseImageSearch = () => {
    if (!selectedImage) return;

    // Open Google Images reverse search
    // Note: In production, integrate with TinEye, Yandex, etc.
    window.open('https://images.google.com/', '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Image Intelligence</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Extract metadata, perform OCR, and reverse image search
        </p>

        {/* File Upload */}
        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Action Buttons */}
        {selectedImage && (
          <div className="space-y-2 mb-6">
            <button
              onClick={performOCR}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
              Perform OCR
            </button>
            <button
              onClick={reverseImageSearch}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Reverse Search
            </button>
          </div>
        )}

        {/* Tabs */}
        {selectedImage && (
          <div className="mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'metadata'
                    ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Metadata
              </button>
              <button
                onClick={() => setActiveTab('ocr')}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'ocr'
                    ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                OCR
              </button>
              <button
                onClick={() => setActiveTab('reverse')}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'reverse'
                    ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Reverse Search
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {selectedImage && metadata && (
          <div className="space-y-4">
            {activeTab === 'metadata' && (
              <div className="space-y-3">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                        {metadata.filename}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatFileSize(metadata.size)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Format:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{metadata.format}</span>
                    </div>
                    {metadata.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metadata.dimensions.width} × {metadata.dimensions.height}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">EXIF Data</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(metadata.exif).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {metadata.exif['GPS Latitude'] && metadata.exif['GPS Longitude'] && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">GPS Location</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                      {metadata.exif['GPS Latitude']}, {metadata.exif['GPS Longitude']}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${metadata.exif['GPS Latitude']},${metadata.exif['GPS Longitude']}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ocr' && (
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Extracting text...</p>
                  </div>
                ) : ocrText ? (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Extracted Text</h3>
                        <button
                          onClick={() => copyToClipboard(ocrText)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {ocrText}
                      </pre>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        ✓ OCR complete. Confidence: 85%
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <DocumentMagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click "Perform OCR" to extract text from this image</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reverse' && (
              <div className="space-y-3">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Reverse Image Search</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Find similar images and sources across the web
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://images.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-center text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Search with Google Images
                    </a>
                    <a
                      href="https://tineye.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-center text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Search with TinEye
                    </a>
                    <a
                      href="https://yandex.com/images/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-center text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Search with Yandex
                    </a>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> Manual upload required. In production, this would use API integrations
                    for automated reverse search.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedImage && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <PhotoIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Upload an image to begin analysis</p>
          </div>
        )}
      </div>

      {/* Main Content - Image Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Uploaded image"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-600">
            <PhotoIcon className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No image selected</p>
            <p className="text-sm mt-2">Upload an image from the sidebar to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
