'use client';

import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode, Autoplay } from 'swiper/modules';
import { Image } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

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

    const handleThumbnailClick = (index: number) => {
        if (mainSwiper) {
            mainSwiper.slideTo(index);
        }
    };

    return (
        <div className="product-image-gallery">
            {/* Main Image Swiper */}
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
                        disableOnInteraction: false,
                    }}
                    onBeforeInit={(swiper) => {
                        if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                        }
                    }}
                    onSwiper={setMainSwiper}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className="main-image-swiper"
                >
                    {images.map((image, index) => (
                        <SwiperSlide key={index}>
                            <div className="h-[350px] md:h-[450px] flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100">
                                <Image
                                    src={image}
                                    alt={`${productName} - ${index + 1}`}
                                    className="object-contain !w-[400px] !h-[400px] p-4"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Arrows */}
                <div
                    ref={prevRef}
                    className="gallery-arrow absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                    <LeftOutlined className="text-gray-600 dark:text-gray-300" />
                </div>
                <div
                    ref={nextRef}
                    className="gallery-arrow absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                    <RightOutlined className="text-gray-600 dark:text-gray-300" />
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {activeIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails Swiper */}
            <div className="thumbnails-container relative overflow-visible">
                {/* Thumbnail Navigation Arrows - Chỉ hiện khi có nhiều hơn slidesPerView */}
                {images.length > 5 && (
                    <>
                        <div
                            ref={thumbPrevRef}
                            className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-gray-300 dark:border-gray-600 hover:scale-110"
                            style={{
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            <LeftOutlined className="text-gray-700 dark:text-gray-300 text-lg font-bold" />
                        </div>
                        <div
                            ref={thumbNextRef}
                            className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-gray-300 dark:border-gray-600 hover:scale-110"
                            style={{
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            <RightOutlined className="text-gray-700 dark:text-gray-300 text-lg font-bold" />
                        </div>
                    </>
                )}

                <Swiper
                    onSwiper={(swiper) => {
                        setThumbsSwiper(swiper);
                    }}
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
                    className={`thumbnails-swiper ${images.length > 5 ? 'md:mx-8' : ''}`}
                    style={{
                        maskImage: images.length > 5
                            ? 'linear-gradient(to right, transparent 0px, black 25px, black calc(100% - 25px), transparent 100%)'
                            : 'none',
                        WebkitMaskImage: images.length > 5
                            ? 'linear-gradient(to right, transparent 0px, black 25px, black calc(100% - 25px), transparent 100%)'
                            : 'none',
                        overflow: 'visible'
                    }}
                    allowTouchMove={true}
                    grabCursor={true}
                    breakpoints={{
                        320: {
                            slidesPerView: 4,
                            spaceBetween: 6,
                        },
                        480: {
                            slidesPerView: 5,
                            spaceBetween: 8,
                        },
                        640: {
                            slidesPerView: 6,
                            spaceBetween: 8,
                        },
                        768: {
                            slidesPerView: 5,
                            spaceBetween: 10,
                        }
                    }}
                >
                    {images.map((image, index) => (
                        <SwiperSlide key={index} className="!w-auto">
                            <div
                                className={`
                                    relative cursor-pointer rounded-md overflow-hidden transition-all duration-200 border-2 hover:scale-105
                                    ${activeIndex === index
                                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-md transform scale-105'
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                    }
                                `}
                                onClick={() => handleThumbnailClick(index)}
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20">
                                    <Image
                                        src={image}
                                        alt={`${productName} thumbnail ${index + 1}`}
                                        className="object-cover w-full h-full"
                                        preview={false}
                                    />
                                </div>
                                {/* Active indicator */}
                                {activeIndex === index && (
                                    <div className="absolute inset-0 border-blue-500 bg-opacity-10 flex items-center justify-center">
                                        <div className="w-3 h-3 border-blue-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Image dots indicator for mobile */}
            <div className="flex justify-center mt-3 md:hidden">
                <div className="flex space-x-1">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${activeIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .main-image-swiper .swiper-slide {
                    height: auto;
                    background: #f8fafc;
                }
                
                .thumbnails-swiper .swiper-slide {
                    width: auto !important;
                }

                .main-image-swiper .swiper-button-next,
                .main-image-swiper .swiper-button-prev {
                    display: none;
                }

                /* Loading animation for images */
                .ant-image-img {
                    transition: opacity 0.3s ease;
                }

                /* Smooth scroll for thumbnails - Hidden scrollbar */
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

                /* Hide default swiper navigation for thumbnails */
                .thumbnails-swiper .swiper-button-next,
                .thumbnails-swiper .swiper-button-prev {
                    display: none !important;
                }

                /* Thumbnail container improvements */
                .thumbnails-container {
                    position: relative;
                    padding: 0 32px;
                    overflow: visible !important;
                }

                /* Thumbnail navigation arrows */
                .thumbnails-container .absolute {
                    z-index: 40 !important;
                }

                /* Ensure arrows are above everything and visible */
                .thumbnails-container > div[class*="absolute"] {
                    z-index: 40 !important;
                    background: rgba(255, 255, 255, 0.98) !important;
                    position: absolute !important;
                    pointer-events: auto !important;
                }

                /* Make sure swiper doesn't clip arrows */
                .thumbnails-swiper {
                    overflow: visible !important;
                    position: relative;
                }

                .thumbnails-swiper .swiper-wrapper {
                    overflow: visible !important;
                }

                /* Fade effect for thumbnails */
                .thumbnails-swiper.fade-edges {
                    mask-image: linear-gradient(to right, transparent 0px, black 30px, black calc(100% - 30px), transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, transparent 0px, black 30px, black calc(100% - 30px), transparent 100%);
                }

                /* Arrow hover effects */
                .gallery-arrow {
                    backdrop-filter: blur(4px);
                    transition: all 0.2s ease;
                }

                .gallery-arrow:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                /* Main image container improvements */
                .main-image-container {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                }

                /* Thumbnail hover effects */
                .thumbnail-hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                /* Mobile responsive adjustments */
                @media (max-width: 768px) {
                    .thumbnails-swiper {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
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

                /* Smooth transitions for all elements */
                * {
                    -webkit-tap-highlight-color: transparent;
                }

                .thumbnails-swiper .swiper-wrapper {
                    transition-timing-function: ease-out;
                }
            `}</style>
        </div>
    );
};

export default ProductImageGallery;