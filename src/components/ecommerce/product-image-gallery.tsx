'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2, RotateCw, Download, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  thumbnail: string;
  isVideo?: boolean;
  videoUrl?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
  onImageSelect?: (image: ProductImage) => void;
  showThumbnails?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
}

export function ProductImageGallery({
  images,
  productName,
  className,
  onImageSelect,
  showThumbnails = true,
  showControls = true,
  autoPlay = false,
  aspectRatio = 'square'
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);

  const currentImage = images[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            handlePrevious();
            break;
          case 'ArrowRight':
            handleNext();
            break;
          case 'Escape':
            setIsFullscreen(false);
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
            handleZoomOut();
            break;
          case 'r':
          case 'R':
            handleRotate();
            break;
        }
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetImageState();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetImageState();
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    resetImageState();
    if (onImageSelect) {
      onImageSelect(images[index]);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setIsZoomed(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetImageState = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setRotation(0);
    setImageError(null);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError('Failed to load image');
  };

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out this product: ${productName}`,
          url: currentImage.url,
        });
      } catch (error) {
        // Fallback to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(currentImage.url);
        }
      }
    }
  };

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `${productName}-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'landscape':
        return 'aspect-[4/3]';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return 'aspect-square';
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-lg', getAspectRatioClass(), className)}>
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 mx-auto mb-2 opacity-50">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Main Image Display */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className={cn('relative bg-gray-50', getAspectRatioClass())}>
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Error State */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-400">
                    <X className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Failed to load image</p>
                  </div>
                </div>
              )}

              {/* Main Image */}
              {currentImage && !imageError && (
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt || productName}
                    fill
                    className={cn(
                      'object-contain transition-transform duration-300 cursor-zoom-in',
                      isZoomed && 'cursor-zoom-out'
                    )}
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={() => setIsZoomed(!isZoomed)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={currentIndex === 0}
                  />
                </div>
              )}

              {/* Navigation Arrows */}
              {showControls && images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Control Buttons */}
              {showControls && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleRotate}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Additional Action Buttons */}
              {showControls && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
                  {currentIndex + 1} / {images.length}
                </Badge>
              )}

              {/* Video Badge */}
              {currentImage?.isVideo && (
                <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                  VIDEO
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Navigation */}
        {showThumbnails && images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all',
                  index === currentIndex
                    ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => handleThumbnailClick(index)}
              >
                <Image
                  src={image.thumbnail || image.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {image.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-4 h-4 text-white">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Image Dots Indicator */}
        {!showThumbnails && images.length > 1 && (
          <div className="flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                )}
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-full p-4">
            {/* Close Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Navigation Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={handleRotate}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Main Fullscreen Image */}
            <div className="w-full h-full flex items-center justify-center">
              {currentImage && (
                <div className="relative max-w-full max-h-full">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt || productName}
                    width={1200}
                    height={1200}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <Badge className="bg-black/70 text-white">
                {currentIndex + 1} / {images.length}
              </Badge>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 max-w-md overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      className={cn(
                        'relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all',
                        index === currentIndex
                          ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-black'
                          : 'border-gray-400 hover:border-gray-200'
                      )}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <Image
                        src={image.thumbnail || image.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="absolute bottom-4 right-4 text-white/70 text-sm">
              <p>← → Navigate | + - Zoom | R Rotate | ESC Close</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
