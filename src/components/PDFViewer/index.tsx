import React, { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFViewer.css';

// Set worker path with version matching react-pdf's internal PDF.js version
// Get the version from react-pdf's peer dependency
const pdfjsVersion = '3.11.174'; // This should match react-pdf's internal PDF.js version

// Set up the worker
if (typeof window !== 'undefined' && 'pdfjs-dist' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

// Error handling for worker loading
const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
const script = document.createElement('script');
script.src = workerSrc;
script.onerror = () => {
  console.error('Failed to load PDF.js worker');
};
document.head.appendChild(script);

interface PDFViewerProps {
  file: string;
  onPageChange?: (pageNumber: number) => void;
  highlightText?: string;
}

const PDFViewer = forwardRef(({ file, onPageChange, highlightText = '' }: PDFViewerProps, ref) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<{pageNumber: number, index: number}[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  
  const textLayerRef = React.useRef<HTMLDivElement>(null);
  
  useImperativeHandle(ref, () => ({
    searchText: (text: string) => {
      setSearchText(text);
      setCurrentMatch(0);
      if (text) {
        // This will trigger the search when the component re-renders
        setSearchResults(prev => [...prev]);
      } else {
        setSearchResults([]);
      }
    },
    goToPage: (pageNum: number) => {
      setPageNumber(pageNum);
      if (onPageChange) {
        onPageChange(pageNum);
      }
    }
  }));

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber > 0 && numPages && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
      if (onPageChange) {
        onPageChange(newPageNumber);
      }
    }
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  }

  // Highlight search results - returns HTML string
  const textRenderer = (textItem: { str: string }): string => {
    let result = textItem.str;
    
    // Highlight search text if any
    if (searchText) {
      const searchRegex = new RegExp(`(${searchText})`, 'gi');
      result = result.replace(searchRegex, '<mark class="search-highlight">$1</mark>');
    }
    
    // Highlight the specified text if it matches
    if (highlightText) {
      const highlightRegex = new RegExp(`(${highlightText})`, 'gi');
      result = result.replace(highlightRegex, (match) => {
        // Only replace if not already highlighted by search
        return match.includes('search-highlight') ? match : 
          `<mark class="text-highlight">${match}</mark>`;
      });
    }
    
    return result;
  };

  return (
    <div className="pdf-container">
      <div className="pdf-toolbar">
        <div className="pagination">
          <button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            onClick={() => changePage(1)}
            disabled={!numPages || pageNumber >= numPages}
          >
            Next
          </button>
        </div>
        <div className="zoom-controls">
          <button onClick={zoomOut} disabled={scale <= 0.5}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 2.0}>+</button>
        </div>
      </div>
      
      <div className="pdf-document" ref={textLayerRef}>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="loading-pdf">Loading PDF...</div>}
          error={<div className="error-loading">Failed to load PDF. Please check the console for errors.</div>}
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            customTextRenderer={textRenderer}
            loading={<div>Loading page {pageNumber}...</div>}
          />
        </Document>
      </div>
    </div>
  );
});

export default PDFViewer;
