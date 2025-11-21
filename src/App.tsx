import React, { useState, useRef, useCallback } from 'react';
import PDFViewer from './components/PDFViewer';
import AnalysisPanel from './components/AnalysisPanel';
import './App.css';

const App: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [highlightText, setHighlightText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfViewerRef = useRef<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setCurrentPage(1);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (pdfViewerRef.current) {
      pdfViewerRef.current.searchText(text);
    }
  };

  const handlePageChange = (pageNumber: number, highlightText?: string) => {
    setCurrentPage(pageNumber);
    if (pdfViewerRef.current) {
      pdfViewerRef.current.goToPage(pageNumber);
      if (highlightText) {
        setHighlightText(highlightText);
        // Clear the highlight after 3 seconds
        setTimeout(() => setHighlightText(''), 3000);
      }
    }
  };

  // Analysis text with references
  const analysisText = `No extraordinary or one-off items affecting EBITDA were reported in Maersk's Q2 2025 results.
  The report explicitly notes that EBITDA improvements stemmed from operational performance—
  including volume growth, cost control, and margin improvement across Ocean, Logistics &
  Services, and Terminals segments [1][2]. Gains or losses from asset sales, which could qualify as
  extraordinary items, are shown separately under EBIT and not included in EBITDA. The gain on
  sale of non-current assets was USD 25 m in Q2 2025, significantly lower than USD 208 m in Q2
  2024, but these affect EBIT, not EBITDA [3]. Hence, Q2 2025 EBITDA reflects core operating
  activities without one-off extraordinary adjustments.`;

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Viewer with Analysis</h1>
        <div className="file-upload-container">
          <button 
            className="upload-button"
            onClick={handleUploadClick}
          >
            Upload PDF
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            style={{ display: 'none' }}
          />
          {pdfFile && (
            <span className="file-name">
              {pdfFile.name}
            </span>
          )}
        </div>
      </header>
      <div className="main-content">
        {pdfUrl ? (
          <PDFViewer 
            ref={pdfViewerRef}
            file={pdfUrl}
            onPageChange={setCurrentPage}
            highlightText={highlightText}
          />
        ) : (
          <div className="upload-prompt">
            <p>Please upload a PDF file to get started</p>
          </div>
        )}
        <AnalysisPanel 
          text={analysisText} 
          onSearch={handleSearch}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default App;
