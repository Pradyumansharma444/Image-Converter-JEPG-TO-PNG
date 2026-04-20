import React, { useState, useRef } from 'react';
import { Download, Upload, Image as ImageIcon, Settings, Trash2 } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [loading, setLoading] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image/(jpeg|jpg|png)')) {
      alert('Please select a JPG or PNG image');
      return;
    }
    
    setSelectedFile(file);
    setOriginalSize(file.size);
    setConvertedUrl(null);
    
    // Set output format based on input format
    if (file.type.includes('png')) {
      setOutputFormat('jpeg');
    } else {
      setOutputFormat('png');
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const convertImage = () => {
    if (!selectedFile || !previewUrl) return;
    
    setLoading(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setLoading(false);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Convert to the selected format with the specified quality
      const convertedImageUrl = canvas.toDataURL(`image/${outputFormat}`, quality / 100);
      setConvertedUrl(convertedImageUrl);
      
      // Calculate converted size
      const base64 = convertedImageUrl.split(',')[1];
      const binaryString = window.atob(base64);
      setConvertedSize(binaryString.length);
      
      setLoading(false);
    };
    
    img.src = previewUrl;
  };
  
  const downloadImage = () => {
    if (!convertedUrl) return;
    
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `converted-image.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setOriginalSize(0);
    setConvertedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Image Converter</h1>
          <p className="text-gray-600">Convert between JPG and PNG formats with quality control</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  ref={fileInputRef}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JPG or PNG only</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Original Image */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Original Image</h3>
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {previewUrl && (
                        <img 
                          src={previewUrl} 
                          alt="Original" 
                          className="w-full h-48 object-contain"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
                        <p className="text-center">
                          {selectedFile.name} ({formatFileSize(originalSize)})
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Converted Image */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Converted Image</h3>
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 h-48 flex items-center justify-center">
                      {loading ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Converting...</p>
                        </div>
                      ) : convertedUrl ? (
                        <>
                          <img 
                            src={convertedUrl} 
                            alt="Converted" 
                            className="w-full h-48 object-contain"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
                            <p className="text-center">
                              {`converted-image.${outputFormat}`} ({formatFileSize(convertedSize)})
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="h-8 w-8 mx-auto" />
                          <p className="mt-2 text-sm">Click convert to see result</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-1/2">
                      <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                        Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        id="quality"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    
                    <div className="w-full sm:w-1/2">
                      <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                        Output Format
                      </label>
                      <select
                        id="format"
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPG</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={convertImage}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Convert
                  </button>
                  
                  <button
                    onClick={downloadImage}
                    disabled={!convertedUrl}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      convertedUrl 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-gray-400 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </button>
                  
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset
                  </button>
                </div>
                
                {convertedUrl && convertedSize > 0 && originalSize > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Conversion Results</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Original Size:</p>
                        <p className="font-medium">{formatFileSize(originalSize)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">New Size:</p>
                        <p className="font-medium">{formatFileSize(convertedSize)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Difference:</p>
                        <p className={`font-medium ${convertedSize < originalSize ? 'text-green-600' : 'text-red-600'}`}>
                          {convertedSize < originalSize ? '-' : '+'}
                          {formatFileSize(Math.abs(convertedSize - originalSize))}
                          {' '}
                          ({Math.round((Math.abs(convertedSize - originalSize) / originalSize) * 100)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Format:</p>
                        <p className="font-medium">{selectedFile.type.split('/')[1].toUpperCase()} → {outputFormat.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-3 text-right text-xs text-gray-500">
            Image Converter Tool • Built with React and Canvas API
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;