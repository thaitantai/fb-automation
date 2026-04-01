"use client";

import React from "react";
import { EditorHeader } from "./EditorHeader";
import { WritingArea } from "./WritingArea";
import { MediaSidebar } from "./MediaSidebar";

import { TemplateEditorProps } from "../types";

export function TemplateEditor({
    name,
    setName,
    content,
    setContent,
    mediaUrls,
    newMediaUrl,
    setNewMediaUrl,
    onAddMedia,
    onRemoveMedia,
    onSave,
    onDelete,
    isSaving,
    isEdit,
    children
}: TemplateEditorProps) {
    return (
        <div className="flex-1 flex flex-col min-w-0 bg-surface-1">
            {/* Header Section - Thanh điều khiển Editor */}
            <EditorHeader
                name={name}
                setName={setName}
                isSaving={isSaving}
                isEdit={isEdit}
                onSave={onSave}
                onDelete={onDelete}
            />

            {/* Workspace split - Phân chia không gian làm việc */}
            <div className="flex-1 flex overflow-hidden p-8 gap-8">
                {/* 1. Writing Column (Spintax Area) - Khu vực viết nội dung */}
                <WritingArea
                    content={content}
                    setContent={setContent}
                />

                {/* 2. Utils Sidebar (Media & Help) - Công cụ hỗ trợ & Media */}
                <MediaSidebar
                    mediaUrls={mediaUrls}
                    newMediaUrl={newMediaUrl}
                    setNewMediaUrl={setNewMediaUrl}
                    onAddMedia={onAddMedia}
                    onRemoveMedia={onRemoveMedia}
                >
                    {/* Chèn SpintaxHelp vào slot này */}
                    {children}
                </MediaSidebar>
            </div>
        </div>
    );
}
