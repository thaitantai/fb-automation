export type CampaignStatus = "DRAFT" | "SCHEDULED" | "PROCESSING" | "COMPLETED" | "PAUSED";

export interface Campaign {
    id: string;
    userId: string;
    name: string;
    type: string;
    targetConfigs: {
        groupIds: string[];
    };
    templateId?: string;
    delayConfig?: {
        min: number;
        max: number;
    };
    status: CampaignStatus;
    scheduledAt?: string;
    createdAt?: string;
    template?: {
        name: string;
    };
    fbAccounts?: {
        id: string;
        username: string;
    }[];
}

export interface CreateCampaignInput {
    name: string;
    type: string;
    targetConfigs: {
        groupIds: string[];
    };
    templateId: string;
    fbAccountIds: string[];
    delayConfig?: {
        min: number;
        max: number;
    };
}
