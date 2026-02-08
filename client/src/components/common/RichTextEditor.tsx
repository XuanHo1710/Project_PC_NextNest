'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues (Quill needs `document`)
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
            Đang tải trình soạn thảo...
        </div>
    ),
});

// Import Quill styles
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    /** Min height of editor area in px. Default 150. */
    minHeight?: number;
}

/**
 * Rich text editor with paste-from-web support.
 * Uses react-quill-new for formatting preservation when pasting from websites.
 * Controlled component: pass `value` and `onChange`.
 */
export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Nhập nội dung...',
    className = '',
    minHeight = 150,
}: RichTextEditorProps) {
    // Quill modules config
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ align: [] }],
                ['link', 'image'],
                ['blockquote', 'code-block'],
                ['clean'],
            ],
            clipboard: {
                matchVisual: false, // Keep original paste formatting
            },
        }),
        [],
    );

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list',
        'indent',
        'align',
        'link', 'image',
        'blockquote', 'code-block',
    ];

    return (
        <div className={`rich-text-editor ${className}`}>
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    min-height: ${minHeight}px;
                    font-size: 14px;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    background: #f8fafc;
                    border-color: #e2e8f0;
                }
                .rich-text-editor .ql-container {
                    border-color: #e2e8f0;
                }
                .rich-text-editor .ql-editor {
                    min-height: ${minHeight}px;
                    line-height: 1.6;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: #94a3b8;
                    font-style: normal;
                }
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label::before,
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item::before {
                    content: 'Văn bản';
                }
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
                    content: 'Tiêu đề 1';
                }
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
                    content: 'Tiêu đề 2';
                }
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
                    content: 'Tiêu đề 3';
                }
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
                .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
                    content: 'Tiêu đề 4';
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={(content: string) => {
                    // react-quill returns '<p><br></p>' for empty content
                    const isEmpty = !content || content === '<p><br></p>' || content.replace(/<[^>]*>/g, '').trim() === '';
                    onChange?.(isEmpty ? '' : content);
                }}
                placeholder={placeholder}
                modules={modules}
                formats={formats}
            />
        </div>
    );
}
