import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
const ScriptureReference = ({ reference, className = '', onClick }) => {
    const [verseText, setVerseText] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);
    const linkRef = useRef(null);
    const isValidReference = /^[1-3]?\s*[A-Za-z]+\s*\d+:\d+(-\d+)?$/.test(reference.trim());
    useEffect(() => {
        if (!reference || !isValidReference)
            return;
        const fetchVerse = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const formattedRef = reference.trim().replace(/\s+/g, '+');
                await new Promise(resolve => setTimeout(resolve, 500));
                let mockText = '';
                if (reference.includes('John 3:16')) {
                    mockText = '"For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."';
                }
                else if (reference.includes('Genesis 1:1')) {
                    mockText = '"In the beginning, God created the heavens and the earth."';
                }
                else if (reference.includes('Psalm 23:1')) {
                    mockText = '"The LORD is my shepherd; I shall not want."';
                }
                else {
                    mockText = `Verse text for "${reference}" would appear here.`;
                }
                setVerseText(mockText);
            }
            catch (err) {
                console.error('Error fetching verse:', err);
                setError('Failed to load verse text');
            }
            finally {
                setIsLoading(false);
            }
        };
        if (showTooltip && !verseText && !isLoading) {
            fetchVerse();
        }
    }, [reference, showTooltip, verseText, isLoading, isValidReference]);
    useEffect(() => {
        if (showTooltip && tooltipRef.current && linkRef.current) {
            const linkRect = linkRef.current.getBoundingClientRect();
            tooltipRef.current.style.left = `${linkRect.left}px`;
            tooltipRef.current.style.top = `${linkRect.bottom + window.scrollY + 5}px`;
        }
    }, [showTooltip]);
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(reference);
        }
    };
    if (!reference || !isValidReference) {
        return _jsx("span", { className: className, children: reference });
    }
    return (_jsxs(_Fragment, { children: [_jsx("a", { ref: linkRef, href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=ESV`, className: `scripture-reference ${className}`, onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false), onClick: handleClick, target: "_blank", rel: "noopener noreferrer", style: {
                    color: '#4a90e2',
                    textDecoration: 'underline',
                    position: 'relative',
                    cursor: 'pointer'
                }, children: reference }), showTooltip && (_jsx("div", { ref: tooltipRef, className: "scripture-tooltip", style: {
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
                }, children: isLoading ? (_jsx("div", { children: "Loading verse..." })) : error ? (_jsx("div", { style: { color: 'red' }, children: error })) : verseText ? (_jsxs("div", { children: [_jsx("strong", { children: reference }), _jsx("p", { children: verseText }), _jsx("div", { style: { fontSize: '0.8rem', marginTop: '4px', color: '#666' }, children: "ESV\u00AE Text Edition: 2016" })] })) : (_jsx("div", { children: "Click to view verse" })) }))] }));
};
export default ScriptureReference;
