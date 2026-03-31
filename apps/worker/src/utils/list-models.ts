import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Lỗi: Không tìm thấy GEMINI_API_KEY trong .env");
        return;
    }

    console.log("🔍 Đang truy vấn danh sách Model từ Google AI...");
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Trong SDK v0.2, ta có thể dùng ListModels
        // Nếu không có hàm trực tiếp, ta sẽ thử gọi một model cơ bản để xem lỗi trả về
        console.log("-----------------------------------------");
        console.log("API Key đang dùng: " + apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 4));
        
        // Thử nghiệm model gemini-pro (được hỗ trợ rộng rãi nhất)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hi");
        console.log("✅ Kết nối thành công! Model 'gemini-pro' khả dụng.");
        console.log("AI trả lời: " + result.response.text());
        
    } catch (error: any) {
        console.error("❌ Lỗi kết nối hoặc Model không tồn tại:");
        console.error(error.message);
        
        if (error.message.includes("403")) {
            console.log("\n💡 Mẹo: Có vẻ như Key của bạn bị chặn quyền hoặc sai khu vực (Vd: EU). Hãy thử tạo Key mới.");
        }
    }
}

listModels();
