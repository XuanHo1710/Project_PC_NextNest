import { CloseOutlined } from '@ant-design/icons';
import { Image } from 'antd';

export interface PreviewImage {
    file: File;
    url: string;
    id: string;
}

/**
 * Xử lý files ảnh để tạo preview
 */
export const handleImageFiles = (files: FileList | null): PreviewImage[] => {
    if (!files) return [];

    const imageFiles: PreviewImage[] = [];

    Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            imageFiles.push({
                file,
                url,
                id: `${file.name}_${Date.now()}_${Math.random()}`
            });
        }
    });

    return imageFiles;
};

/**
 * Component hiển thị preview ảnh với nút xóa
 */
interface ImagePreviewProps {
    images: PreviewImage[];
    onRemove: (id: string) => void;
    className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    images,
    onRemove,
    className = ""
}) => {
    if (images.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 mt-3 ${className}`}>
            {images.map((image) => (
                <div key={image.id} className="relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                        <Image
                            src={image.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            preview={{
                                mask: <div className="text-xs">Xem</div>
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(image.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            ))}
        </div>
    );
};

/**
 * Cleanup URLs để tránh memory leak
 */
export const cleanupImageUrls = (images: PreviewImage[]) => {
    images.forEach(image => {
        URL.revokeObjectURL(image.url);
    });
};