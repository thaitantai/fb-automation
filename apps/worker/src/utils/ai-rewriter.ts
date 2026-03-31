import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Lớp xử lý viết lại nội dung bằng AI (Gemini)
 * Giúp bài viết có văn phong hoàn toàn mới nhưng giữ nguyên ý nghĩa
 */
export class AIRewriter {
    private static genAI: GoogleGenerativeAI | null = null;

    private static getClient() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("[AIRewriter] ⚠️ Không tìm thấy GEMINI_API_KEY trong .env. AI Rewrite sẽ bị bỏ qua.");
            return null;
        }

        if (!this.genAI) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
        return this.genAI;
    }

    /**
     * Viết lại nội dung bằng Gemini
     * @param content Nội dung gốc
     * @param customPrompt Câu lệnh tùy chỉnh của người dùng
     */
    static async rewrite(content: string, customPrompt?: string): Promise<string> {
        const client = this.getClient();
        if (!client || !content) return content;

        try {
            const model = client.getGenerativeModel({ model: "gemini-pro" });

            const basePrompt = customPrompt || "Hãy viết lại nội dung sau đây bằng tiếng Việt, 2 đoạn văn không được giống nhau. Yêu cầu: Giữ nguyên các thông tin quan trọng, link liên kết, hashtag, và ý nghĩa gốc. Hãy viết theo một văn phong tự nhiên, hấp dẫn, thu hút người đọc trên mạng xã hội. Chỉ trả về nội dung bài viết mới, không kèm theo lời bình luận nào khác.";

            const prompt = `${basePrompt}\n\nNội dung gốc:\n${content}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text && text.length > 10) {
                console.log("[AIRewriter] ✨ Đã viết lại nội dung thành công bằng AI.");
                return text;
            }

            return content;
        } catch (error: any) {
            console.error(`[AIRewriter] 🔴 Lỗi AI Rewrite: ${error.message}`);
            return content; // Lỗi thì trả về gốc, không làm gián đoạn luồng đăng bài
        }
    }
}
