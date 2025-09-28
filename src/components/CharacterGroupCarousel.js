import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupRepository } from '../repositories/groupRepository';
const CharacterGroupCarousel = ({ onSelectGroup }) => {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [hasFocus, setHasFocus] = useState(false);
    const swipeSoundRef = useRef(null);
    const clickSoundRef = useRef(null);
    const carouselRef = useRef(null);
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setIsLoading(true);
                const data = await groupRepository.getAllGroups();
                setGroups(data);
            }
            catch (err) {
                console.error('Failed to fetch character groups:', err);
                setError('Failed to load character groups. Please try again later.');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchGroups();
    }, []);
    const playAudio = useCallback((audioRef) => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = volume;
            audioRef.current.play().catch(err => {
                console.log('Audio playback was prevented:', err);
            });
        }
    }, [volume]);
    const handleGroupClick = useCallback((groupId) => {
        setSelectedGroupId(groupId);
        playAudio(clickSoundRef);
        if (onSelectGroup) {
            onSelectGroup(groupId);
        }
    }, [onSelectGroup, playAudio]);
    const handleNext = useCallback(() => {
        playAudio(swipeSoundRef);
        setCurrentIndex(prevIndex => prevIndex >= groups.length - 1 ? 0 : prevIndex + 1);
    }, [groups.length, playAudio]);
    const handlePrev = useCallback(() => {
        playAudio(swipeSoundRef);
        setCurrentIndex(prevIndex => prevIndex <= 0 ? groups.length - 1 : prevIndex - 1);
    }, [groups.length, playAudio]);
    const [visibleItems, setVisibleItems] = useState(5);
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setVisibleItems(3);
            }
            else if (width < 1024) {
                setVisibleItems(5);
            }
            else {
                setVisibleItems(5);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const visibleGroups = useCallback(() => {
        if (groups.length === 0)
            return [];
        const result = [];
        const sideItems = Math.floor(visibleItems / 2);
        for (let i = -sideItems; i <= sideItems; i++) {
            let index = currentIndex + i;
            if (index < 0)
                index = groups.length + index;
            if (index >= groups.length)
                index = index % groups.length;
            result.push({
                group: groups[index],
                position: i
            });
        }
        return result;
    }, [currentIndex, groups, visibleItems]);
    const handleDragEnd = useCallback((_, info) => {
        if (info.offset.x < -50) {
            handleNext();
        }
        else if (info.offset.x > 50) {
            handlePrev();
        }
    }, [handleNext, handlePrev]);
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!hasFocus)
                return;
            if (event.key === 'ArrowLeft') {
                handlePrev();
                event.preventDefault();
            }
            else if (event.key === 'ArrowRight') {
                handleNext();
                event.preventDefault();
            }
            else if (event.key === 'Enter' || event.key === ' ') {
                const currentGroup = groups[currentIndex];
                if (currentGroup) {
                    handleGroupClick(currentGroup.id);
                    event.preventDefault();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext, hasFocus, groups, currentIndex, handleGroupClick]);
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-primary-600 text-xl", children: "\u271D" }) })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-red-50 p-6 rounded-lg text-red-800 text-center border border-red-200", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-red-500 mb-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("p", { className: "font-semibold text-lg", children: "Error Loading Groups" }), _jsx("p", { className: "mt-1", children: error })] }) }));
    }
    if (groups.length === 0) {
        return (_jsx("div", { className: "bg-gray-50 p-8 rounded-lg text-gray-600 text-center border border-gray-200", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-gray-400 mb-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" }) }), _jsx("p", { className: "font-medium text-lg", children: "No Character Groups Available" }), _jsx("p", { className: "mt-1 text-gray-500", children: "Please add groups in the admin panel." })] }) }));
    }
    return (_jsxs("div", { className: "w-full py-12 relative bg-gradient-to-b from-blue-50 to-white rounded-xl", tabIndex: 0, role: "region", "aria-label": "Character group carousel", onFocus: () => setHasFocus(true), onBlur: () => setHasFocus(false), children: [_jsxs("div", { className: "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10", children: [_jsx("div", { className: "absolute top-0 left-0 w-24 h-24 bg-contain bg-no-repeat", style: { backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%236d28d9\"><path d=\"M17 14c-0.4 0-0.8 0.1-1.2 0.3L13 12V7c0-1.7-1.3-3-3-3S7 5.3 7 7v5l-2.8 2.3C3.8 14.1 3.4 14 3 14c-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-0.8 2.8-2h7.3c0.4 1.2 1.5 2 2.8 2 1.7 0 3-1.3 3-3S18.7 14 17 14zM3 18c-0.6 0-1-0.4-1-1s0.4-1 1-1 1 0.4 1 1S3.6 18 3 18zM9 7c0-0.6 0.4-1 1-1s1 0.4 1 1v4.1l-2 1.7V7zM13 16H5.8c-0.1-0.3-0.3-0.6-0.5-0.9L8 13.2l2.2 1.8c0.5 0.4 1.2 0.4 1.7 0l2.2-1.8 2.7 1.9c-0.2 0.3-0.4 0.6-0.5 0.9H13zM17 18c-0.6 0-1-0.4-1-1s0.4-1 1-1 1 0.4 1 1S17.6 18 17 18z\"/></svg>')" } }), _jsx("div", { className: "absolute bottom-0 right-0 w-24 h-24 bg-contain bg-no-repeat", style: { backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%230ea5e9\"><path d=\"M18.1 12.6L14 11l-1.5-4.1c-0.3-0.8-1.1-1.3-1.9-1.3s-1.6 0.5-1.9 1.3L7.1 11l-4.1 1.6c-0.8 0.3-1.3 1.1-1.3 1.9s0.5 1.6 1.3 1.9l4.1 1.6 1.6 4.1c0.3 0.8 1.1 1.3 1.9 1.3s1.6-0.5 1.9-1.3l1.6-4.1 4.1-1.6c0.8-0.3 1.3-1.1 1.3-1.9S18.9 12.9 18.1 12.6zM13.8 14.9c-0.3 0.1-0.6 0.4-0.7 0.7l-1.6 4.1c0 0.1-0.1 0.1-0.2 0.1s-0.1 0-0.2-0.1l-1.6-4.1c-0.1-0.3-0.4-0.6-0.7-0.7l-4.1-1.6c-0.1 0-0.1-0.1-0.1-0.2s0-0.1 0.1-0.2l4.1-1.6c0.3-0.1 0.6-0.4 0.7-0.7l1.6-4.1c0-0.1 0.1-0.1 0.2-0.1s0.1 0 0.2 0.1l1.6 4.1c0.1 0.3 0.4 0.6 0.7 0.7l4.1 1.6c0.1 0 0.1 0.1 0.1 0.2s0 0.1-0.1 0.2L13.8 14.9z\"/></svg>')" } })] }), _jsx("h2", { className: "text-3xl font-bold text-center mb-8 text-primary-800 tracking-tight", children: "Choose a Character Group" }), _jsx("audio", { ref: swipeSoundRef, src: "/sounds/swipe.mp3", preload: "auto" }), _jsx("audio", { ref: clickSoundRef, src: "/sounds/click.mp3", preload: "auto" }), _jsxs("div", { className: "absolute top-4 right-4 flex items-center space-x-2", children: [_jsx("label", { htmlFor: "volume", className: "text-sm text-gray-600", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z", clipRule: "evenodd" }) }) }), _jsx("input", { type: "range", id: "volume", min: "0", max: "1", step: "0.1", value: volume, onChange: (e) => setVolume(Number(e.target.value)), className: "w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600", "aria-label": "Volume control" })] }), _jsxs("div", { ref: carouselRef, className: "relative overflow-hidden px-12 perspective", style: { perspective: '1000px' }, role: "group", "aria-roledescription": "carousel", "aria-label": "Character groups", children: [_jsx("button", { onClick: handlePrev, className: "absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-primary-50 rounded-full p-3 shadow-md text-primary-700 hover:text-primary-800 transition-colors border border-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", "aria-label": "Previous group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("div", { className: "flex items-center justify-center h-[400px] relative", children: _jsx(AnimatePresence, { mode: "popLayout", children: visibleGroups().map(({ group, position }) => {
                                const isCenter = position === 0;
                                const isFirstSide = Math.abs(position) === 1;
                                const isSecondSide = Math.abs(position) === 2;
                                const scale = isCenter ? 1 : isFirstSide ? 0.85 : isSecondSide ? 0.7 : 0.5;
                                const opacity = isCenter ? 1 : isFirstSide ? 0.9 : isSecondSide ? 0.7 : 0.5;
                                const zIndex = isCenter ? 10 : isFirstSide ? 5 : isSecondSide ? 3 : 1;
                                const xPosition = position * (isCenter ? 0 : isFirstSide ? 260 : isSecondSide ? 400 : 480);
                                const yPosition = isCenter ? 0 : Math.abs(position) * -15;
                                const isSelected = selectedGroupId === group.id;
                                return (_jsxs(motion.div, { 
                                    key: group.id,
                                    layout: true, 
                                    initial: {
                                        opacity: 0,
                                        scale: 0.8,
                                        rotateY: position * -25,
                                        x: xPosition * 1.5,
                                        y: yPosition
                                    }, 
                                    animate: {
                                        opacity,
                                        scale,
                                        rotateY: position * -25,
                                        x: xPosition,
                                        y: yPosition,
                                        z: isCenter ? 50 : 0
                                    }, 
                                    exit: {
                                        opacity: 0,
                                        scale: 0.7,
                                        rotateY: position * -35,
                                        x: position * (position < 0 ? -500 : 500)
                                    }, 
                                    transition: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                        mass: 1.2
                                    }, 
                                    whileHover: isCenter ? {
                                        scale: 1.05,
                                        rotateY: 5,
                                        transition: { duration: 0.2 }
                                    } : {}, 
                                    whileTap: isCenter ? {
                                        scale: 0.98,
                                        transition: { duration: 0.1 }
                                    } : {}, 
                                    className: `
                    absolute flex-none w-[320px] rounded-xl overflow-hidden cursor-pointer
                    transform-style-3d
                    ${isCenter ? 'cursor-pointer' : 'pointer-events-none md:pointer-events-auto'}
                    ${isSelected ? 'ring-4 ring-secondary-500 scale-105' : ''}
                  `, 
                                    style: {
                                        zIndex,
                                        transformStyle: 'preserve-3d',
                                        boxShadow: isSelected
                                            ? '0 0 25px 5px rgba(139, 92, 246, 0.5), 0 0 10px 2px rgba(255, 255, 255, 0.8)'
                                            : isCenter
                                                ? '0 10px 30px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                                                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }, 
                                    onClick: () => isCenter && handleGroupClick(group.id), 
                                    role: "group", 
                                    "aria-roledescription": "slide", 
                                    "aria-label": group.name, 
                                    "aria-current": isCenter ? "true" : "false", 
                                    tabIndex: isCenter ? 0 : -1, 
                                    children: [_jsxs("div", { className: "relative h-full flex flex-col bg-white", children: [_jsxs("div", { className: "relative h-48 overflow-hidden", children: [
                                                    _jsx("div", { className: "absolute inset-0 bg-gray-100 bg-opacity-30 mix-blend-overlay pointer-events-none" }),
                                                    _jsx("img", { 
                                                        src: group.image_url || `https://via.placeholder.com/400x240?text=${encodeURIComponent(group.name)}`,
                                                        alt: group.name,
                                                        className: "w-full h-full object-cover object-[center_20%]",
                                                        onError: (e) => { 
                                                            e.target.src = `https://via.placeholder.com/400x240?text=${encodeURIComponent(group.name)}`;
                                                        }
                                                    }),
                                                    _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" }),
                                                    _jsx("div", { className: "absolute top-0 right-0 w-12 h-12 opacity-70", children: _jsx("svg", { viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-full h-full", children: _jsx("path", { d: "M0 0C55.2285 0 100 44.7715 100 100H75C75 58.5786 41.4214 25 0 25V0Z", fill: "white" }) }) }),
                                                    _jsxs("div", { className: "absolute bottom-4 left-4 right-4", children: [
                                                        _jsx("h3", { className: "text-2xl font-extrabold text-white drop-shadow-lg", children: group.name }),
                                                        _jsx("div", { className: "h-1 w-16 mt-1 bg-secondary-500 rounded-full" })
                                                    ] }),
                                                    group.icon && (_jsx("span", { className: "absolute top-4 right-4 text-white text-3xl drop-shadow-md", children: group.icon })),
                                                    isSelected && (_jsx("div", { className: "absolute inset-0 bg-secondary-500 mix-blend-soft-light opacity-20" }))
                                                ] }), _jsxs("div", { className: "p-4 flex flex-col flex-grow", children: [_jsxs("div", { className: "relative mb-4 flex-grow", children: [_jsx("div", { className: "absolute inset-0 bg-amber-50 bg-opacity-30 rounded pointer-events-none" }), _jsx("p", { className: "relative text-gray-700 text-base line-clamp-3 z-10", children: group.description || `Characters from the ${group.name} group.` })] }), _jsx("button", { onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleGroupClick(group.id);
                                                            }, className: `
                          mt-auto w-full py-3 rounded-md font-semibold text-lg shadow-md
                          transition-all duration-300
                          ${isSelected
                                                                ? 'bg-secondary-600 text-white hover:bg-secondary-700 ring-2 ring-secondary-200'
                                                                : 'bg-primary-600 text-white hover:bg-primary-700'}
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                        `, "aria-label": `Select ${group.name} group`, children: isSelected ? 'Selected' : 'Select Group' })] })] }), isSelected && isCenter && (_jsx("div", { className: "absolute -inset-1 bg-secondary-500 opacity-20 blur-lg rounded-xl animate-pulse" }))]
                                }));
                            }) }) }), _jsx("button", { onClick: handleNext, className: "absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-primary-50 rounded-full p-3 shadow-md text-primary-700 hover:text-primary-800 transition-colors border border-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", "aria-label": "Next group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), _jsx("div", { className: "flex justify-center mt-8 gap-3", children: groups.map((group, index) => (_jsx("button", { 
                        key: group.id,
                        onClick: () => {
                            playAudio(swipeSoundRef);
                            setCurrentIndex(index);
                        }, 
                        className: `
              relative w-3 h-3 rounded-full transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${index === currentIndex
                            ? 'bg-secondary-600 scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'}
            `, 
                        "aria-label": `Go to group ${index + 1}: ${group.name}`, 
                        "aria-current": index === currentIndex ? "true" : "false", 
                        children: index === currentIndex && (_jsx("span", { className: "absolute inset-0 rounded-full animate-ping bg-secondary-400 opacity-75" }))
                    }))) }), _jsx("div", { className: "mt-4 text-center text-xs text-gray-500", children: _jsxs("span", { className: "inline-flex items-center", children: [_jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg", children: "\u2190" }), _jsx("span", { className: "mx-1", children: "and" }), _jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg", children: "\u2192" }), _jsx("span", { className: "ml-1", children: "to navigate" }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg", children: "Enter" }), _jsx("span", { className: "ml-1", children: "to select" })] }) })] }));
};
export default CharacterGroupCarousel;