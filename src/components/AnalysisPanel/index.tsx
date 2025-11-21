import React, { useState, useEffect, useCallback, memo } from 'react';
import './AnalysisPanel.css';

interface AnalysisPanelProps {
  text: string;
  onSearch: (text: string) => void;
  currentPage: number;
  onPageChange: (pageNumber: number, highlightText?: string) => void;
}

interface AnalysisSection {
  text: string;
  pageNumber: number | null;
  isHighlighted?: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  text,
  onSearch,
  currentPage,
  onPageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  
  // Parse the analysis text into sections with page numbers
  useEffect(() => {
    const parsedSections = text
      .split('\n\n')
      .filter(section => section.trim() !== '')
      .map(section => {
        // Find all page references in the section
        const matches = section.match(/\[(\d+)\]/g) || [];
        const pageMatches = matches.map(match => {
          const pageMatch = match.match(/(\d+)/);
          return pageMatch ? [match, pageMatch[1]] : null;
        }).filter(Boolean) as RegExpMatchArray[];
        const pageNumbers = pageMatches.map(match => parseInt(match[1], 10));
        
        // Clean the section text by removing page number references
        let cleanText = section.replace(/\s*\[\d+\](?![^\[]*\])/g, '').trim();
        
        // If no page number at the end, use the first one found or null
        const pageNumber = pageNumbers.length > 0 ? pageNumbers[0] : null;
        
        return { 
          text: cleanText, 
          pageNumber,
          isHighlighted: pageNumber === currentPage
        };
      });
    
    setSections(parsedSections);
  }, [text, currentPage]);

  // Handle search form submission
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  }, [searchQuery, onSearch]);

  // Handle page number click
  const handlePageClick = useCallback((pageNumber: number, e: React.MouseEvent, highlightText?: string) => {
    e.stopPropagation();
    if (highlightText) {
      onPageChange(pageNumber, highlightText);
    } else {
      onPageChange(pageNumber);
    }
  }, [onPageChange]);

  // Process text to make page numbers clickable
  const processTextWithPageLinks = (text: string) => {
    if (!text) return '';
    
    // Special handling for [3] to highlight specific text
    let processed = text.replace(
      /\[3\]/g, 
      '<span class="page-link highlight-trigger" data-page="15" data-highlight="Gain on sale of non-current assets, etc" title="Go to page 15 and highlight relevant text">[3]</span>'
    );
    
    // Handle other page references
    processed = processed.replace(
      /\[(\d+)\]/g, 
      (match, p1) => {
        if (p1 !== '3') {
          return `<span class="page-link" data-page="${p1}" title="Go to page ${p1}">[${p1}]</span>`;
        }
        return match;
      }
    );
    
    return processed;
  };

  // Handle click on page number in text
  const handleTextPageClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('page-link') && target.dataset.page) {
      e.preventDefault();
      const pageNumber = parseInt(target.dataset.page, 10);
      const highlightText = target.dataset.highlight;
      
      if (target.classList.contains('highlight-trigger') && highlightText) {
        // Special handling for [3] reference
        onPageChange(pageNumber, highlightText);
      } else {
        onPageChange(pageNumber);
      }
    }
  }, [onPageChange]);

  // Highlight search terms in text
  const highlightSearch = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="search-term">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <h3>Document Analysis</h3>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in document..."
              className="search-input"
              aria-label="Search in document"
            />
            <button type="submit" className="search-button" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </form>
      </div>
      
      <div className="sections-container">
        {/* References Section */}
        <div className="references-section">
          <h4>References: </h4>
          <div className="reference-numbers">
            <button 
              className="reference-number"
              onClick={(e) => handlePageClick(3, e, "Maersk's results continued to improve year-on-year")}
              title="Go to page 3 and highlight text"
            >
              [1]
            </button>
            <button 
              className="reference-number"
              onClick={(e) => handlePageClick(5, e, "EBITDA increased to USD 2.3 bn (USD 2.1 bn)")}
              title="Go to page 5 and highlight text"
            >
              [2]
            </button>
            <button 
              className="reference-number"
              onClick={(e) => handlePageClick(15, e, "Gain on sale of non-current assets, etc")}
              title="Go to page 15 and highlight text"
            >
              [3]
            </button>
          </div>
        </div>
      </div>
      
      <div className="current-page-indicator">
        Current Page: <strong>{currentPage}</strong>
      </div>
    </div>
  );
};

export default memo(AnalysisPanel);
