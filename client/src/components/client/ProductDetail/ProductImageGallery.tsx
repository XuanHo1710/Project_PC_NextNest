'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode, Autoplay } from 'swiper/modules';
import { Image } from 'antd';
import { LeftOutlined, RightOutlined, PlayCircleFilled } from '@ant-design/icons';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

/** Detect video URLs by extension or Cloudinary video path */
function isVideoUrl(url: string): boolean {
    if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url)) return true;
    if (/\/video\/upload\//i.test(url)) return true;
    return false;
}

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);
    const thumbPrevRef = useRef<HTMLDivElement>(null);
    const thumbNextRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

    const handleThumbnailClick = (index: number) => {
        if (mainSwiper) {
            mainSwiper.slideTo(index);
        }
    };

    /** Pause all videos and optionally play the active one */
    const handleSlideChange = useCallback((swiper: SwiperType) => {
        const newIndex = swiper.activeIndex;
        setActiveIndex(newIndex);
        // pause all videos except the active one
        Object.entries(videoRefs.current).forEach(([idx, videoEl]) => {
            if (videoEl) {
                if (Number(idx) === newIndex) {
                    // auto-play the video slide
                    videoEl.play().catch(() => { });
                } else {
                    videoEl.pause();
                }
            }
        });
    }, []);

    return (
        <div className="product-image-gallery">
            {/* Main Image / Video Swiper */}
            <div className="relative main-image-container mb-4">
                <Swiper
                    spaceBetween={10}
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    thumbs={{
                        swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null
                    }}
                    modules={[FreeMode, Navigation, Thumbs, Autoplay]}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: true,
                        pauseOnMouseEnter: true,
                    }}
                    onBeforeInit={(swiper) => {
                        if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                        }
                    }}
                    onSwiper={setMainSwiper}
                    onSlideChange={handleSlideChange}
                    className="main-image-swiper"
                >
                    {images.map((media, index) => (
                        <SwiperSlide key={index}>
                            <div className="h-[350px] md:h-[450px] flex items-center justify-center bg-white rounded-xl border border-gray-100">
                                {isVideoUrl(media) ? (
                                    <video
                                        ref={(el) => { videoRefs.current[index] = el; }}
                                        src={media}
                                        controls
                                        playsInline
                                        muted
                                        className="max-h-full max-w-full object-contain rounded-lg"
                                        style={{ maxHeight: '430px' }}
                                    />
                                ) : (
                                    <Image
                                        src={media}
                                        alt={`${productName} - ${index + 1}`}
                                        className="object-contain !max-w-[400px] !max-h-[400px] p-4"
                                    />
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Arrows */}
                <div
                    ref={prevRef}
                    className="gallery-arrow absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 border border-gray-200"
                >
                    <LeftOutlined className="text-gray-600" />
                </div>
                <div
                    ref={nextRef}
                    className="gallery-arrow absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 border border-gray-200"
                >
                    <RightOutlined className="text-gray-600" />
                </div>

                {/* Media Counter */}
                <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {activeIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails Swiper */}
            <div className="thumbnails-container relative overflow-visible">
                {/* Thumbnail Navigation Arrows */}
                {images.length > 5 && (
                    <>
                        <div
                            ref={thumbPrevRef}
                            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-110"
                        >
                            <LeftOutlined className="text-gray-600 text-sm" />
                        </div>
                        <div
                            ref={thumbNextRef}
                            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-110"
                        >
                            <RightOutlined className="text-gray-600 text-sm" />
                        </div>
                    </>
                )}

                <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView="auto"
                    freeMode={true}
                    watchSlidesProgress={true}
                    navigation={{
                        prevEl: thumbPrevRef.current,
                        nextEl: thumbNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                            swiper.params.navigation.prevEl = thumbPrevRef.current;
                            swiper.params.navigation.nextEl = thumbNextRef.current;
                        }
                    }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className={`thumbnails-swiper ${images.length > 5 ? 'md:mx-6' : ''}`}
                    style={{
                        maskImage: images.length > 5
                            ? 'linear-gradient(to right, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)'
                            : 'none',
                        WebkitMaskImage: images.length > 5
                            ? 'linear-gradient(to right, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)'
                            : 'none',
                        overflow: 'visible'
                    }}
                    allowTouchMove={true}
                    grabCursor={true}
                    breakpoints={{
                        320: { slidesPerView: 4, spaceBetween: 6 },
                        480: { slidesPerView: 5, spaceBetween: 8 },
                        640: { slidesPerView: 6, spaceBetween: 8 },
                        768: { slidesPerView: 5, spaceBetween: 10 },
                    }}
                >
                    {images.map((media, index) => {
                        const isVideo = isVideoUrl(media);
                        return (
                            <SwiperSlide key={index} className="!w-auto">
                                <div
                                    className={`
                                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border-2
                                        ${activeIndex === index
                                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-md scale-105'
                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-105'
                                        }
                                    `}
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <div className="w-16 h-16 md:w-[72px] md:h-[72px] bg-gray-50">
                                        {isVideo ? (
                                            <>
                                                <video
                                                    src={media}
                                                    muted
                                                    preload="metadata"
                                                    className="object-cover w-full h-full"
                                                />
                                                {/* Play overlay for video thumbnails */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <PlayCircleFilled className="text-white text-2xl drop-shadow-lg" />
                                                </div>
                                            </>
                                        ) : (
                                            <Image
                                                src={media}
                                                alt={`${productName} thumbnail ${index + 1}`}
                                                className="object-cover w-full h-full"
                                                preview={false}
                                            />
                                        )}
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>

            {/* Dot indicator for mobile */}
            <div className="flex justify-center mt-3 md:hidden">
                <div className="flex space-x-1.5">
                    {images.slice(0, 10).map((_, index) => (
                        <div
                            key={index}
                            className={`rounded-full transition-all duration-200 ${activeIndex === index
                                    ? 'w-5 h-2 bg-blue-500'
                                    : 'w-2 h-2 bg-gray-300'
                                }`}
                        />
                    ))}
                    {images.length > 10 && (
                        <span className="text-xs text-gray-400 ml-1">+{images.length - 10}</span>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .main-image-swiper .swiper-slide {
                    height: auto;
                    background: #ffffff;
                }

                .thumbnails-swiper .swiper-slide {
                    width: auto !important;
                }

                .main-image-swiper .swiper-button-next,
                .main-image-swiper .swiper-button-prev {
                    display: none;
                }

                .ant-image-img {
                    transition: opacity 0.3s ease;
                }

                .thumbnails-swiper {
                    overflow: hidden !important;
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }

                .thumbnails-swiper::-webkit-scrollbar {
                    display: none !important;
                }

                .thumbnails-swiper .swiper-wrapper {
                    transition-timing-function: ease-out;
                }

                .thumbnails-swiper .swiper-button-next,
                .thumbnails-swiper .swiper-button-prev {
                    display: none !important;
                }

                .thumbnails-container {
                    position: relative;
                    padding: 0 28px;
                    overflow: visible !important;
                }

                .thumbnails-container > div[class*="absolute"] {
                    z-index: 40 !important;
                    position: absolute !important;
                    pointer-events: auto !important;
                }

                .thumbnails-swiper {
                    overflow: visible !important;
                    position: relative;
                }

                .thumbnails-swiper .swiper-wrapper {
                    overflow: visible !important;
                }

                .gallery-arrow {
                    backdrop-filter: blur(4px);
                    transition: all 0.2s ease;
                }

                .gallery-arrow:hover {
                    transform: translateY(-50%) scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .main-image-container {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                }

                @media (max-width: 768px) {
                    .thumbnails-container {
                        padding: 0 4px;
                    }

                    .thumbnails-swiper {
                        mask-image: none !important;
                        -webkit-mask-image: none !important;
                    }

                    .gallery-arrow {
                        width: 32px;
                        height: 32px;
                    }

                    .main-image-container {
                        border-radius: 8px;
                    }
                }

                * {
                    -webkit-tap-highlight-color: transparent;
                }
            `}</style>
        </div>
    );
};

export default ProductImageGallery;