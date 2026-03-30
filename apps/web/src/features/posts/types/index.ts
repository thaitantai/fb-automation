export type PostTemplateType = "POST" | "COMMENT";

export interface PostTemplate {
    id: string;
    userId: string;
    name: string;
    contentSpintax: string;
    mediaUrls: string[] | any; // JSON containing URLs
    createdAt?: string;
}

export interface CreatePostTemplateInput {
    name: string;
    contentSpintax: string;
    mediaUrls?: string[];
}

