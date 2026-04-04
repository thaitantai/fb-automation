import { prisma } from '@fb-automation/database';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Lớp xử lý nội dung trộn (Spintax) giúp bài đăng luôn duy nhất
 * Cú pháp hỗ trợ: {A|B|C} -> Mỗi lần gọi sẽ trả về ngẫu nhiên A hoặc B hoặc C
 */
export class SpintaxParser {
    static parse(text: string): string {
        if (!text) return "";
        let result = text;
        const spintaxRegex = /\{([^{}]+)\}/g;
        let match;
        while ((match = spintaxRegex.exec(result)) !== null) {
            const options = match[1].split('|');
            const randomOption = options[Math.floor(Math.random() * options.length)];
            result = result.replace(match[0], randomOption);
            spintaxRegex.lastIndex = 0;
        }
        return result;
    }
}

/**
 * Lớp xử lý viết lại nội dung bằng AI (Gemini)
 */
export class AIRewriter {
    private static genAI: GoogleGenerativeAI | null = null;

    private static getClient(apiKey?: string) {
        let key = apiKey || process.env.GEMINI_API_KEY;
        if (key) key = key.trim();
        if (!key) return null;
        if (!this.genAI) this.genAI = new GoogleGenerativeAI(key);
        return this.genAI;
    }

    static async rewrite(content: string, customPrompt?: string, apiKey?: string): Promise<string> {
        const client = this.getClient(apiKey);
        if (!client || !content) return content;
        try {
            const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });
            const basePrompt = customPrompt || "Hãy viết lại nội dung sau đây bằng tiếng Việt, 2 đoạn văn không được giống nhau. Yêu cầu: Giữ nguyên các thông tin quan trọng, link liên kết, hashtag, và ý nghĩa gốc. Hãy viết theo một văn phong tự nhiên, hấp dẫn, thu hút người đọc trên mạng xã hội. Chỉ trả về nội dung bài viết mới, không kèm theo lời bình luận nào khác.";
            const prompt = `${basePrompt}\n\nNội dung gốc:\n${content}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text() || content;
        } catch (error: any) {
            console.error(`[AIRewriter] 🔴 Error:`, error.message);
            return content;
        }
    }
}

/**
 * Hàm tổng hợp tất cả các bước bảo mật nội dung
 */
export async function applyFullProtection(content: string, config: any, apiKey?: string): Promise<string> {
    if (!content) return "";

    let finalized = content;
    if (config.aiRewrite) {
        finalized = await AIRewriter.rewrite(finalized, config.aiPrompt, apiKey);
    }

    if (!finalized.includes('---') && !finalized.includes('{') && !config.autoEmoji && !config.autoHash) {
        return finalized;
    }

    if (finalized.includes('---')) {
        const sections = finalized.split('---').map(s => s.trim());
        if (sections.length > 1) {
            for (let i = sections.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sections[i], sections[j]] = [sections[j], sections[i]];
            }
            finalized = sections.join('\n');
        }
    }

    finalized = SpintaxParser.parse(finalized);

    const suffixParts: string[] = [];
    const prefixParts: string[] = [];

    if (config.autoEmoji) {
        let pool = ['🔥', '✨', '✔', '🎁', '⚡', '🚀', '⭐'];
        if (config.customEmojis) {
            const custom = config.customEmojis.split(/[, \s\n]+/).filter(Boolean);
            if (custom.length > 0) pool = custom;
        }
        const emoji = pool[Math.floor(Math.random() * pool.length)];
        prefixParts.push(emoji);
        suffixParts.push(emoji);
    }

    if (config.autoHash) {
        const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
        suffixParts.push(`\n\n[#ID-${hash}]`);
    }

    const result = [
        ...prefixParts,
        finalized,
        ...suffixParts
    ].join(' ');

    return result.trim();
}

/**
 * [Senior Logic Shared] Kiểm tra và cập nhật trạng thái hoàn thành của chiến dịch
 * Có thể gọi từ cả API (khi skip hết) và Worker (khi chạy xong)
 */
export async function checkCampaignCompletion(campaignId: string, batchId: string, successAction: string) {
    const [logs, campaign] = await Promise.all([
        prisma.jobLog.findMany({ where: { campaignId, batchId } }),
        prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { fbAccounts: { select: { id: true } } }
        })
    ]);
    if (!campaign) return;

    const targetGroupIds = (campaign.targetConfigs as any)?.groupIds || [];
    const totalTargets = campaign.fbAccounts.length * targetGroupIds.length;

    if (logs.length >= totalTargets) {
        // [Safety Check] Vẫn còn SCHEDULED nghĩa là chưa chạy xong hết
        const stillRunning = logs.some((l: any) => l.actionType === 'SCHEDULED');
        if (stillRunning) return;

        // Một chiến dịch gọi là COMPLETED nếu có ít nhất một bài thành công, bài chờ duyệt, hoặc được Skip chủ động
        const hasSuccess = logs.some((l: any) =>
            l.actionType === successAction ||
            l.actionType === 'PENDING' ||
            l.actionType === 'SKIP'
        );

        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: hasSuccess ? 'COMPLETED' : 'FAILED' } as any
        });
    }
}
