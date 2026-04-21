import React, { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { API_URL } from '../config';

export const ResumeImport = () => {
  const { setResumeData } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (fileToValidate: File) => {
    if (fileToValidate.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return false;
    }
    const type = fileToValidate.type;
    const isDocx = type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileToValidate.name.endsWith('.docx');
    const isPdf = type === 'application/pdf';
    
    if (!isPdf && !isDocx) {
      setError('Only PDF and DOCX files are supported.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    setSuccessMsg(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    
    const formData = new FormData();
    formData.append('resumeFile', file);
    
    try {
      const response = await fetch(`${API_URL}/api/resume/import`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process resume');
      }
      
      setResumeData(result.data);
      setSuccessMsg(result.message);
      
      // Auto-close after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setFile(null);
        setSuccessMsg(null);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-outline flex items-center gap-2"
        style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
      >
        <UploadCloud size={16} />
        Import Existing Resume
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col pt-0">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <UploadCloud size={18} className="text-blue-600" />
                Import Your Resume
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {!file ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleChange}
                  />
                  
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UploadCloud size={24} />
                  </div>
                  <h4 className="text-gray-700 font-medium mb-1">Click to upload or drag & drop</h4>
                  <p className="text-sm text-gray-400 mb-4">Strictly PDF or DOCX (Max: 5MB)</p>
                  
                  <button className="btn btn-primary btn-sm mx-auto">
                    Select File
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-100/50 text-blue-600 p-2 rounded">
                      <File size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!isProcessing && !successMsg && (
                    <button onClick={resetState} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              {successMsg && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex gap-2 text-green-700 text-sm">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <p>{successMsg}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-outline"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                className="btn btn-primary flex items-center gap-2"
                disabled={!file || isProcessing || !!successMsg}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Import Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
