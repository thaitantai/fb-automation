export type PostTemplateType = "POST" | "COMMENT";

export interface PostTemplate {
    id: string;
    userId: string;
    name: string;
    type: PostTemplateType;
    contentSpintax: string;
    mediaUrls: string[] | any; // JSON containing URLs
    createdAt?: string;
}

export interface CreatePostTemplateInput {
    name: string;
    type: PostTemplateType;
    contentSpintax: string;
    mediaUrls?: string[];
}
