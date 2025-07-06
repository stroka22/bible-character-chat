import React, { useState, useEffect, useRef } from 'react';

interface ScriptureReferenceProps {
  /**
   * The Bible reference string (e.g., "John 3:16", "Genesis 1:1-3", "Psalm 23")
   */
  reference: string;
  
  /**
   * Optional CSS class name for the reference link
   */
  className?: string;
  
  /**
   * Optional callback when the reference is clicked
   */
  onClick?: (reference: string) => void;
}

/**
 * A component that renders a Bible reference as a clickable link with a tooltip
 * showing the verse text when hovered.
 */
const ScriptureReference: React.FC<ScriptureReferenceProps> = ({
  reference,
  className = '',
  onClick
}) => {
  const [verseText, setVerseText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Validate the reference format
  const isValidReference = /^[1-3]?\s*[A-Za-z]+\s*\d+:\d+(-\d+)?$/.test(reference.trim());

  // Fetch the verse text when the reference changes
  useEffect(() => {
    if (!reference || !isValidReference) return;

    const fetchVerse = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Format the reference for the API (remove spaces, etc.)
        const formattedRef = reference.trim().replace(/\s+/g, '+');
        
        // Use the ESV API (you'll need to replace with your API key)
        // const response = await fetch(
        //   `https://api.esv.org/v3/passage/text/?q=${formattedRef}&include-headings=false&include-footnotes=false`,
        //   {
        //     headers: {
        //       'Authorization': 'Token YOUR_ESV_API_KEY'
        //     }
        //   }
        // );

        // For demo purposes, we'll use a mock API response
        // In production, uncomment the fetch above and use a real API
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        // Mock response based on the reference
        let mockText = '';
        if (reference.includes('John 3:16')) {
          mockText = '"For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."';
        } else if (reference.includes('Genesis 1:1')) {
          mockText = '"In the beginning, God created the heavens and the earth."';
        } else if (reference.includes('Psalm 23:1')) {
          mockText = '"The LORD is my shepherd; I shall not want."';
        } else {
          mockText = `Verse text for "${reference}" would appear here.`;
        }
        
        setVerseText(mockText);
      } catch (err) {
        console.error('Error fetching verse:', err);
        setError('Failed to load verse text');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch when the tooltip is shown
    if (showTooltip && !verseText && !isLoading) {
      fetchVerse();
    }
  }, [reference, showTooltip, verseText, isLoading, isValidReference]);

  // Position the tooltip relative to the link
  useEffect(() => {
    if (showTooltip && tooltipRef.current && linkRef.current) {
      const linkRect = linkRef.current.getBoundingClientRect();
      tooltipRef.current.style.left = `${linkRect.left}px`;
      tooltipRef.current.style.top = `${linkRect.bottom + window.scrollY + 5}px`;
    }
  }, [showTooltip]);

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(reference);
    }
  };

  if (!reference || !isValidReference) {
    return <span className={className}>{reference}</span>;
  }

  return (
    <>
      <a
        ref={linkRef}
        href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=ESV`}
        className={`scripture-reference ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#4a90e2',
          textDecoration: 'underline',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        {reference}
      </a>
      
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="scripture-tooltip"
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            maxWidth: '300px',
            fontSize: '0.9rem',
            color: '#333'
          }}
        >
          {isLoading ? (
            <div>Loading verse...</div>
          ) : error ? (
            <div style={{ color: 'red' }}>{error}</div>
          ) : verseText ? (
            <div>
              <strong>{reference}</strong>
              <p>{verseText}</p>
              <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#666' }}>
                ESV® Text Edition: 2016
              </div>
            </div>
          ) : (
            <div>Click to view verse</div>
          )}
        </div>
      )}
    </>
  );
};

export default ScriptureReference;
