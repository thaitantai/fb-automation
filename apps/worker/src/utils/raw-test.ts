import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

async function testBruteForce() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return console.log("Không tìm thấy GEMINI_API_KEY");

    console.log("🚀 Đang quét tìm Model hoạt động cho Key: " + key.substring(0, 5) + "...");
    
    const versions = ['v1', 'v1beta'];
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const v of versions) {
        for (const m of models) {
            console.log(`--- Thử nghiệm: [${v}] với [${m}] ---`);
            const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${key}`;
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Hi" }] }]
                    })
                });

                const data: any = await response.json();
                if (response.ok) {
                    console.log(`\n✅ THÀNH CÔNG RỰC RỠ!!!`);
                    console.log(`💡 Mẫu hoạt động: "${m}" ở phiên bản: "${v}"`);
                    console.log(`AI Phản hồi: ${data.candidates[0].content.parts[0].text}`);
                    return; 
                } else {
                    const msg = data.error?.message || 'Lỗi không xác định';
                    console.log(`❌ Thất bại (${v}/${m}): ${msg.substring(0, 60)}...`);
                }
            } catch (e: any) {
                console.log(`❌ Lỗi kết nối: ${e.message}`);
            }
        }
    }
    console.log("\n⚠️ Kết luận: Không tìm thấy model nào hoạt động. Hãy kiểm tra lại Key trên AI Studio (Makersuite).");
}

testBruteForce();
