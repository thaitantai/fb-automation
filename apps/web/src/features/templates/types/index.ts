export type TemplateType = "POST" | "COMMENT";

export interface Template {
    id: string;
    userId: string;
    name: string;
    contentSpintax: string;
    mediaUrls: string[] | any; // JSON containing URLs
    createdAt?: string;
}

export interface CreateTemplateInput {
    name: string;
    contentSpintax: string;
    mediaUrls?: string[];
}

// --- Component Props Types ---

export interface TemplateEditorProps {
    name: string;
    setName: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
    mediaUrls: string[];
    newMediaUrl: string;
    setNewMediaUrl: (value: string) => void;
    onAddMedia: () => void;
    onRemoveMedia: (index: number) => void;
    onSave: () => void;
    onDelete?: () => void;
    isSaving: boolean;
    isEdit: boolean;
    children?: React.ReactNode;
}

export interface EditorHeaderProps {
    name: string;
    setName: (value: string) => void;
    isSaving: boolean;
    isEdit: boolean;
    onSave: () => void;
    onDelete?: () => void;
}

export interface WritingAreaProps {
    content: string;
    setContent: (value: string) => void;
}

export interface MediaSidebarProps {
    mediaUrls: string[];
    newMediaUrl: string;
    setNewMediaUrl: (value: string) => void;
    onAddMedia: () => void;
    onRemoveMedia: (index: number) => void;
    children?: React.ReactNode;
}

