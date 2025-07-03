var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupRepository } from '../repositories/groupRepository';
var CharacterGroupCarousel = function (_a) {
    var onSelectGroup = _a.onSelectGroup;
    // State for groups data
    var _b = useState([]), groups = _b[0], setGroups = _b[1];
    var _c = useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    // State for carousel
    var _e = useState(0), currentIndex = _e[0], setCurrentIndex = _e[1];
    var _f = useState(null), selectedGroupId = _f[0], setSelectedGroupId = _f[1];
    var _g = useState(0.5), volume = _g[0], setVolume = _g[1]; // New state for volume
    var _h = useState(false), hasFocus = _h[0], setHasFocus = _h[1];
    // Refs for audio elements
    var swipeSoundRef = useRef(null);
    var clickSoundRef = useRef(null);
    // Ref for carousel container (for drag constraints)
    var carouselRef = useRef(null);
    // Fetch character groups on component mount
    useEffect(function () {
        var fetchGroups = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setIsLoading(true);
                        return [4 /*yield*/, groupRepository.getAllGroups()];
                    case 1:
                        data = _a.sent();
                        setGroups(data);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        console.error('Failed to fetch character groups:', err_1);
                        setError('Failed to load character groups. Please try again later.');
                        return [3 /*break*/, 4];
                    case 3:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchGroups();
    }, []);
    // Helper function to play audio
    var playAudio = useCallback(function (audioRef) {
        if (audioRef.current) {
            audioRef.current.currentTime = 0; // Reset audio to start
            audioRef.current.volume = volume; // Set volume
            audioRef.current.play().catch(function (err) {
                // Silently catch errors (common in browsers that block autoplay)
                console.log('Audio playback was prevented:', err);
            });
        }
    }, [volume]);
    // Handle group selection
    var handleGroupClick = useCallback(function (groupId) {
        setSelectedGroupId(groupId);
        // Cast to any to satisfy the generic RefObject mismatch at build time
        playAudio(clickSoundRef);
        if (onSelectGroup) {
            onSelectGroup(groupId);
        }
    }, [onSelectGroup, playAudio]);
    // Handle next/prev navigation
    var handleNext = useCallback(function () {
        playAudio(swipeSoundRef);
        setCurrentIndex(function (prevIndex) {
            return prevIndex >= groups.length - 1 ? 0 : prevIndex + 1;
        });
    }, [groups.length, playAudio]);
    var handlePrev = useCallback(function () {
        playAudio(swipeSoundRef);
        setCurrentIndex(function (prevIndex) {
            return prevIndex <= 0 ? groups.length - 1 : prevIndex - 1;
        });
    }, [groups.length, playAudio]);
    // Calculate number of items to show based on screen size
    var _j = useState(5), visibleItems = _j[0], setVisibleItems = _j[1]; // Increased for better carousel effect
    // Update visible items on window resize
    useEffect(function () {
        var handleResize = function () {
            var width = window.innerWidth;
            if (width < 640) {
                setVisibleItems(3); // Mobile: show 3 (1 main + 2 partial side cards)
            }
            else if (width < 1024) {
                setVisibleItems(5); // Tablet: show 5 (1 main + 4 side cards)
            }
            else {
                setVisibleItems(5); // Desktop: show 5 (1 main + 4 side cards)
            }
        };
        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    // Calculate visible groups based on current index and visible items
    var visibleGroups = useCallback(function () {
        if (groups.length === 0)
            return [];
        var result = [];
        // Calculate how many items to show on each side of the current item
        var sideItems = Math.floor(visibleItems / 2);
        for (var i = -sideItems; i <= sideItems; i++) {
            var index = currentIndex + i;
            // Handle wrapping around the carousel
            if (index < 0)
                index = groups.length + index;
            if (index >= groups.length)
                index = index % groups.length;
            result.push({
                group: groups[index],
                position: i // Store the relative position for styling
            });
        }
        return result;
    }, [currentIndex, groups, visibleItems]);
    // Handle drag end (for swipe gestures)
    var handleDragEnd = useCallback(function (_, info) {
        // More sensitive drag detection
        if (info.offset.x < -50) {
            handleNext();
        }
        else if (info.offset.x > 50) {
            handlePrev();
        }
    }, [handleNext, handlePrev]);
    // Keyboard navigation
    useEffect(function () {
        var handleKeyDown = function (event) {
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
                // Select the current group on Enter or Space
                var currentGroup = groups[currentIndex];
                if (currentGroup) {
                    handleGroupClick(currentGroup.id);
                    event.preventDefault();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return function () { return window.removeEventListener('keydown', handleKeyDown); };
    }, [handlePrev, handleNext, hasFocus, groups, currentIndex, handleGroupClick]);
    // Render loading state with biblical-themed spinner
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-primary-600 text-xl", children: "\u271D" }) })] }) }));
    }
    // Render error state
    if (error) {
        return (_jsx("div", { className: "bg-red-50 p-6 rounded-lg text-red-800 text-center border border-red-200", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-red-500 mb-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("p", { className: "font-semibold text-lg", children: "Error Loading Groups" }), _jsx("p", { className: "mt-1", children: error })] }) }));
    }
    // Render empty state
    if (groups.length === 0) {
        return (_jsx("div", { className: "bg-gray-50 p-8 rounded-lg text-gray-600 text-center border border-gray-200", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-gray-400 mb-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" }) }), _jsx("p", { className: "font-medium text-lg", children: "No Character Groups Available" }), _jsx("p", { className: "mt-1 text-gray-500", children: "Please add groups in the admin panel." })] }) }));
    }
    return (_jsxs("div", { className: "w-full py-12 relative bg-gradient-to-b from-blue-50 to-white rounded-xl", tabIndex: 0, role: "region", "aria-label": "Character group carousel", onFocus: function () { return setHasFocus(true); }, onBlur: function () { return setHasFocus(false); }, children: [_jsxs("div", { className: "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10", children: [_jsx("div", { className: "absolute top-0 left-0 w-24 h-24 bg-contain bg-no-repeat", style: { backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%236d28d9\"><path d=\"M17 14c-0.4 0-0.8 0.1-1.2 0.3L13 12V7c0-1.7-1.3-3-3-3S7 5.3 7 7v5l-2.8 2.3C3.8 14.1 3.4 14 3 14c-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-0.8 2.8-2h7.3c0.4 1.2 1.5 2 2.8 2 1.7 0 3-1.3 3-3S18.7 14 17 14zM3 18c-0.6 0-1-0.4-1-1s0.4-1 1-1 1 0.4 1 1S3.6 18 3 18zM9 7c0-0.6 0.4-1 1-1s1 0.4 1 1v4.1l-2 1.7V7zM13 16H5.8c-0.1-0.3-0.3-0.6-0.5-0.9L8 13.2l2.2 1.8c0.5 0.4 1.2 0.4 1.7 0l2.2-1.8 2.7 1.9c-0.2 0.3-0.4 0.6-0.5 0.9H13zM17 18c-0.6 0-1-0.4-1-1s0.4-1 1-1 1 0.4 1 1S17.6 18 17 18z\"/></svg>')" } }), _jsx("div", { className: "absolute bottom-0 right-0 w-24 h-24 bg-contain bg-no-repeat", style: { backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%230ea5e9\"><path d=\"M18.1 12.6L14 11l-1.5-4.1c-0.3-0.8-1.1-1.3-1.9-1.3s-1.6 0.5-1.9 1.3L7.1 11l-4.1 1.6c-0.8 0.3-1.3 1.1-1.3 1.9s0.5 1.6 1.3 1.9l4.1 1.6 1.6 4.1c0.3 0.8 1.1 1.3 1.9 1.3s1.6-0.5 1.9-1.3l1.6-4.1 4.1-1.6c0.8-0.3 1.3-1.1 1.3-1.9S18.9 12.9 18.1 12.6zM13.8 14.9c-0.3 0.1-0.6 0.4-0.7 0.7l-1.6 4.1c0 0.1-0.1 0.1-0.2 0.1s-0.1 0-0.2-0.1l-1.6-4.1c-0.1-0.3-0.4-0.6-0.7-0.7l-4.1-1.6c-0.1 0-0.1-0.1-0.1-0.2s0-0.1 0.1-0.2l4.1-1.6c0.3-0.1 0.6-0.4 0.7-0.7l1.6-4.1c0-0.1 0.1-0.1 0.2-0.1s0.1 0 0.2 0.1l1.6 4.1c0.1 0.3 0.4 0.6 0.7 0.7l4.1 1.6c0.1 0 0.1 0.1 0.1 0.2s0 0.1-0.1 0.2L13.8 14.9z\"/></svg>')" } })] }), _jsx("h2", { className: "text-3xl font-bold text-center mb-8 text-primary-800 tracking-tight", children: "Choose a Character Group" }), _jsx("audio", { ref: swipeSoundRef, src: "/sounds/swipe.mp3", preload: "auto" }), _jsx("audio", { ref: clickSoundRef, src: "/sounds/click.mp3", preload: "auto" }), _jsxs("div", { className: "absolute top-4 right-4 flex items-center space-x-2", children: [_jsx("label", { htmlFor: "volume", className: "text-sm text-gray-600", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z", clipRule: "evenodd" }) }) }), _jsx("input", { type: "range", id: "volume", min: "0", max: "1", step: "0.1", value: volume, onChange: function (e) { return setVolume(Number(e.target.value)); }, className: "w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600", "aria-label": "Volume control" })] }), _jsxs("div", { ref: carouselRef, className: "relative overflow-hidden px-12 perspective", style: { perspective: '1000px' }, role: "group", "aria-roledescription": "carousel", "aria-label": "Character groups", children: [_jsx("button", { onClick: handlePrev, className: "absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-primary-50 rounded-full p-3 shadow-md text-primary-700 hover:text-primary-800 transition-colors border border-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", "aria-label": "Previous group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("div", { className: "flex items-center justify-center h-[400px] relative", children: _jsx(AnimatePresence, { mode: "popLayout", children: visibleGroups().map(function (_a) {
                                var group = _a.group, position = _a.position;
                                // Calculate scale and opacity based on position
                                var isCenter = position === 0;
                                var isFirstSide = Math.abs(position) === 1;
                                var isSecondSide = Math.abs(position) === 2;
                                // Dynamic styling based on position
                                var scale = isCenter ? 1 : isFirstSide ? 0.85 : isSecondSide ? 0.7 : 0.5;
                                var opacity = isCenter ? 1 : isFirstSide ? 0.9 : isSecondSide ? 0.7 : 0.5;
                                var zIndex = isCenter ? 10 : isFirstSide ? 5 : isSecondSide ? 3 : 1;
                                var xPosition = position * (isCenter ? 0 : isFirstSide ? 260 : isSecondSide ? 400 : 480);
                                var yPosition = isCenter ? 0 : Math.abs(position) * -15;
                                // Determine if this group is selected
                                var isSelected = selectedGroupId === group.id;
                                return (_jsxs(motion.div, { layout: true, initial: {
                                        opacity: 0,
                                        scale: 0.8,
                                        rotateY: position * -25,
                                        x: xPosition * 1.5,
                                        y: yPosition
                                    }, animate: {
                                        opacity: opacity,
                                        scale: scale,
                                        rotateY: position * -25,
                                        x: xPosition,
                                        y: yPosition,
                                        z: isCenter ? 50 : 0
                                    }, exit: {
                                        opacity: 0,
                                        scale: 0.7,
                                        rotateY: position * -35,
                                        x: position * (position < 0 ? -500 : 500)
                                    }, transition: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                        mass: 1.2
                                    }, whileHover: isCenter ? {
                                        scale: 1.05,
                                        rotateY: 5,
                                        transition: { duration: 0.2 }
                                    } : {}, whileTap: isCenter ? {
                                        scale: 0.98,
                                        transition: { duration: 0.1 }
                                    } : {}, className: "\n                    absolute flex-none w-[320px] rounded-xl overflow-hidden cursor-pointer\n                    transform-style-3d\n                    ".concat(isCenter ? 'cursor-pointer' : 'pointer-events-none md:pointer-events-auto', "\n                    ").concat(isSelected ? 'ring-4 ring-secondary-500 scale-105' : '', "\n                  "), style: {
                                        zIndex: zIndex,
                                        transformStyle: 'preserve-3d',
                                        boxShadow: isSelected
                                            ? '0 0 25px 5px rgba(139, 92, 246, 0.5), 0 0 10px 2px rgba(255, 255, 255, 0.8)'
                                            : isCenter
                                                ? '0 10px 30px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                                                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }, onClick: function () { return isCenter && handleGroupClick(group.id); }, role: "group", "aria-roledescription": "slide", "aria-label": group.name, "aria-current": isCenter ? "true" : "false", tabIndex: isCenter ? 0 : -1, children: [_jsxs("div", { className: "relative h-full flex flex-col bg-white", children: [_jsxs("div", { className: "relative h-48 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gray-100 bg-opacity-30 mix-blend-overlay pointer-events-none" }), _jsx("img", { src: group.image_url || "https://via.placeholder.com/400x240?text=".concat(encodeURIComponent(group.name)), alt: group.name, className: "w-full h-full object-cover", onError: function (e) {
                                                                e.target.src = "https://via.placeholder.com/400x240?text=".concat(encodeURIComponent(group.name));
                                                            } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" }), _jsx("div", { className: "absolute top-0 right-0 w-12 h-12 opacity-70", children: _jsx("svg", { viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-full h-full", children: _jsx("path", { d: "M0 0C55.2285 0 100 44.7715 100 100H75C75 58.5786 41.4214 25 0 25V0Z", fill: "white" }) }) }), _jsxs("div", { className: "absolute bottom-4 left-4 right-4", children: [_jsx("h3", { className: "text-2xl font-extrabold text-white drop-shadow-lg", children: group.name }), _jsx("div", { className: "h-1 w-16 mt-1 bg-secondary-500 rounded-full" })] }), group.icon && (_jsx("span", { className: "absolute top-4 right-4 text-white text-3xl drop-shadow-md", children: group.icon })), isSelected && (_jsx("div", { className: "absolute inset-0 bg-secondary-500 mix-blend-soft-light opacity-20" }))] }), _jsxs("div", { className: "p-4 flex flex-col flex-grow", children: [_jsxs("div", { className: "relative mb-4 flex-grow", children: [_jsx("div", { className: "absolute inset-0 bg-amber-50 bg-opacity-30 rounded pointer-events-none" }), _jsx("p", { className: "relative text-gray-700 text-base line-clamp-3 z-10", children: group.description || "Characters from the ".concat(group.name, " group.") })] }), _jsx("button", { onClick: function (e) {
                                                                e.stopPropagation(); // Prevent double-triggering with card click
                                                                handleGroupClick(group.id);
                                                            }, className: "\n                          mt-auto w-full py-3 rounded-md font-semibold text-lg shadow-md\n                          transition-all duration-300\n                          ".concat(isSelected
                                                                ? 'bg-secondary-600 text-white hover:bg-secondary-700 ring-2 ring-secondary-200'
                                                                : 'bg-primary-600 text-white hover:bg-primary-700', "\n                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500\n                        "), "aria-label": "Select ".concat(group.name, " group"), children: isSelected ? 'Selected' : 'Select Group' })] })] }), isSelected && isCenter && (_jsx("div", { className: "absolute -inset-1 bg-secondary-500 opacity-20 blur-lg rounded-xl animate-pulse" }))] }, group.id));
                            }) }) }), _jsx("button", { onClick: handleNext, className: "absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-primary-50 rounded-full p-3 shadow-md text-primary-700 hover:text-primary-800 transition-colors border border-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", "aria-label": "Next group", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), _jsx("div", { className: "flex justify-center mt-8 gap-3", children: groups.map(function (group, index) { return (_jsx("button", { onClick: function () {
                        playAudio(swipeSoundRef);
                        setCurrentIndex(index);
                    }, className: "\n              relative w-3 h-3 rounded-full transition-all duration-300\n              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500\n              ".concat(index === currentIndex
                        ? 'bg-secondary-600 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400', "\n            "), "aria-label": "Go to group ".concat(index + 1, ": ").concat(group.name), "aria-current": index === currentIndex ? "true" : "false", children: index === currentIndex && (_jsx("span", { className: "absolute inset-0 rounded-full animate-ping bg-secondary-400 opacity-75" })) }, group.id)); }) }), _jsx("div", { className: "mt-4 text-center text-xs text-gray-500", children: _jsxs("span", { className: "inline-flex items-center", children: [_jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg", children: "\u2190" }), _jsx("span", { className: "mx-1", children: "and" }), _jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg", children: "\u2192" }), _jsx("span", { className: "ml-1", children: "to navigate" }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg", children: "Enter" }), _jsx("span", { className: "ml-1", children: "to select" })] }) })] }));
};
export default CharacterGroupCarousel;
