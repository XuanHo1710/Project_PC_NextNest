'use client';

import React, { useState, useRef } from 'react';
import { Upload, Button, message, Image, Spin } from 'antd';
import {
    UploadOutlined,
    DeleteOutlined,
    PlusOutlined,
    CloudUploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dakuahprw';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'rb6icg22';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface CloudinaryUploadProps {
    value?: string[];
    onChange?: (urls: string[]) => void;
    maxCount?: number;
    /** Show as compact single image upload */
    single?: boolean;
    placeholder?: string;
}

export default function CloudinaryUpload({
    value = [],
    onChange,
    maxCount = 5,
    single = false,
    placeholder = 'Tải ảnh lên',
}: CloudinaryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remaining = maxCount - value.length;
        if (remaining <= 0) {
            message.warning(`Tối đa ${maxCount} ảnh`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remaining);
        setUploading(true);

        try {
            const uploadPromises = filesToUpload.map(uploadToCloudinary);
            const urls = await Promise.all(uploadPromises);
            const newValues = [...value, ...urls];
            onChange?.(newValues);
            message.success(`Tải lên ${urls.length} ảnh thành công`);
        } catch (error) {
            message.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
            console.error('Cloudinary upload error:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (index: number) => {
        const newValues = value.filter((_, i) => i !== index);
        onChange?.(newValues);
    };

    if (single) {
        return (
            <div className="space-y-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                />
                {value.length > 0 ? (
                    <div className="relative group inline-block">
                        <Image
                            src={value[0]}
                            alt="Preview"
                            width={120}
                            height={120}
                            className="rounded-lg object-cover border border-gray-200"
                        />
                        <button
                            onClick={() => handleRemove(0)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <DeleteOutlined />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-[120px] h-[120px] border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer bg-blue-50/50"
                    >
                        {uploading ? (
                            <Spin size="small" />
                        ) : (
                            <>
                                <CloudUploadOutlined className="text-2xl mb-1" />
                                <span className="text-xs">{placeholder}</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
            />

            {/* Image grid */}
            <div className="flex flex-wrap gap-3">
                {value.map((url, index) => (
                    <div key={index} className="relative group">
                        <Image
                            src={url}
                            alt={`Ảnh ${index + 1}`}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover border border-gray-200"
                        />
                        <button
                            onClick={() => handleRemove(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <DeleteOutlined />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {index + 1}/{value.length}
                        </div>
                    </div>
                ))}

                {/* Add button */}
                {value.length < maxCount && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-[100px] h-[100px] border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer bg-blue-50/30"
                    >
                        {uploading ? (
                            <Spin size="small" />
                        ) : (
                            <>
                                <PlusOutlined className="text-xl mb-1" />
                                <span className="text-[10px]">
                                    {value.length}/{maxCount}
                                </span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {value.length > 0 && (
                <p className="text-xs text-gray-400">
                    Đã tải {value.length}/{maxCount} ảnh • Nhấn vào ảnh để xem lớn • Rê chuột để xóa
                </p>
            )}
        </div>
    );
}
