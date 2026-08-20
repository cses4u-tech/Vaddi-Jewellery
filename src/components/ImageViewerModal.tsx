import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Award,
  Download
} from 'lucide-react';

interface ImageViewerModalProps {
  product: Product | null;
  initialIndex?: number;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  product,
  initialIndex = 0,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [product, initialIndex]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, currentIndex]);

  if (!product) return null;

  const images =
    product.image_paths && product.image_paths.length > 0
      ? product.image_paths
      : [product.image_path];

  const currentImage = images[currentIndex] || product.image_path;
  const title = language === 'te' ? product.title_te || product.title : product.title;

  const handleNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handlePrev = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.4, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.4, 0.6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="fullscreen-image-viewer-modal"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Controls Header */}
      <div className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-md border-b border-white/10 text-white z-20">
        <div className="flex items-center gap-3">
          <div className="bg-[#C5A869] text-[#1A1A1A] font-bold text-xs px-2.5 py-1 rounded">
            {product.code}
          </div>
          <div>
            <h4 className="font-serif-luxury font-bold text-base sm:text-lg text-white leading-tight">
              {title}
            </h4>
            <span className="text-xs text-stone-400">
              {product.purity} • {product.weight}g
            </span>
          </div>
        </div>

        {/* Action icons & close button */}
        <div className="flex items-center gap-2">
          {/* Zoom controls pill */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-1 gap-1 border border-white/10">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/20 rounded text-stone-200 hover:text-white cursor-pointer"
              title={t('zoom_in')}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-stone-300 font-mono">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/20 rounded text-stone-200 hover:text-white cursor-pointer"
              title={t('zoom_out')}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-white/20 rounded text-stone-200 hover:text-white cursor-pointer text-xs"
              title={t('reset_zoom')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            id="close-image-viewer-btn"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            title={t('close_viewer')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Navigation Prev */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 z-20 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full border border-white/20 transition-all cursor-pointer"
            title={t('prev_image')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Display Image (Always Strict object-fit: contain) */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <img
            src={currentImage}
            alt={title}
            className="jewellery-img-contain max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
          />
        </div>

        {/* Navigation Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 z-20 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full border border-white/20 transition-all cursor-pointer"
            title={t('next_image')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="p-4 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-xs text-stone-400 z-20">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C5A869]" />
          <span>VADDI Jewellery • Proddatur BIS Hallmarked Certified</span>
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex items-center gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`w-12 h-12 rounded-lg border-2 p-1 overflow-hidden transition-all bg-stone-900 cursor-pointer ${
                  currentIndex === idx ? 'border-[#C5A869] scale-105' : 'border-white/20 opacity-60'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}

        <div className="hidden sm:block text-stone-500">
          Use Mouse Wheel / Click & Drag to inspect ornament
        </div>
      </div>
    </div>
  );
};
