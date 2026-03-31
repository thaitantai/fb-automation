import * as dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { SpintaxParser } from './spintax';
import { AIRewriter } from './ai-rewriter';

async function testProtectionFlow() {
    console.log("🚀 BẮT ĐẦU KIỂM TRA LUỒNG BẢO VỆ NỘI DUNG\n");

    const sampleContent = `{Chào bạn|Hi|Hello}! Chúc bạn một ngày {tuyệt vời|năng động}. --- Mình đang có ưu đãi {giảm giá|sale} cho áo thun cực {chất|đỉnh}. --- Xem ngay tại: https://shop.me/ao-thun --- Mong được bạn {ủng hộ|ghé thăm}!`;

    const config = {
        aiRewrite: true, // Thử nghiệm AI
        aiPrompt: "Hãy viết lại nội dung này theo phong cách GenZ, sử dụng nhiều slang trẻ trung và thu hút.",
        autoEmoji: true,
        customEmojis: "🔥,✨,🚀,💎",
        autoHash: true
    };

    console.log("📝 MẪU GỐC (Trước xử lý):");
    console.log("------------------------");
    console.log(sampleContent);
    console.log("------------------------\n");

    for (let i = 1; i <= 3; i++) {
        console.log(`💎 PHIÊN BẢN THỨ ${i}:`);
        
        // Mô phỏng luồng applyContentProtection
        let content = sampleContent;

        // 1. AI Rewrite
        if (config.aiRewrite) {
            console.log(`   [AI] Đang gọi Gemini AI để biến hóa nội dung...`);
            content = await AIRewriter.rewrite(content, config.aiPrompt);
        }

        // 2. Shuffle Sections
        if (content.includes('---')) {
            const sections = content.split('---').map(s => s.trim());
            for (let i = sections.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sections[i], sections[j]] = [sections[j], sections[i]];
            }
            content = sections.join('\n');
        }

        // 3. Spintax
        content = SpintaxParser.parse(content);

        // 4. Emoji
        if (config.autoEmoji) {
            const emojis = config.customEmojis.split(',');
            const emoji = emojis[Math.floor(Math.random() * emojis.length)].trim();
            content = `${emoji} ${content} ${emoji}`;
        }

        // 5. Hash ID
        if (config.autoHash) {
            const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
            content += `\n\n[#ID-${hash}]`;
        }

        console.log(`   [KẾT QUẢ]:\n   """\n   ${content}\n   """\n`);
    }

    console.log("✅ KIỂM TRA HOÀN TẤT.");
}

testProtectionFlow().catch(console.error);
