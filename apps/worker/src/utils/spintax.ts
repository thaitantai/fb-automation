/**
 * Lớp xử lý nội dung trộn (Spintax) giúp bài đăng luôn duy nhất
 * Cú pháp hỗ trợ: {A|B|C} -> Mỗi lần gọi sẽ trả về ngẫu nhiên A hoặc B hoặc C
 */
export class SpintaxParser {
    /**
     * Parse nội dung có chứa spintax thành nội dung ngẫu nhiên
     * @param text Nội dung gốc có chứa {options|...}
     */
    static parse(text: string): string {
        if (!text) return "";
        
        let result = text;
        const spintaxRegex = /\{([^{}]+)\}/g;
        let match;

        // Xử lý đệ quy các lồng nhau hoặc nhiều cụm spintax trên 1 bài
        while ((match = spintaxRegex.exec(result)) !== null) {
            const options = match[1].split('|');
            const randomOption = options[Math.floor(Math.random() * options.length)];
            
            // Thay thế cụm {A|B} bằng lựa chọn ngẫu nhiên
            result = result.replace(match[0], randomOption);
            
            // Reset regex index sau mỗi lần thay thế chuỗi
            spintaxRegex.lastIndex = 0;
        }

        return result;
    }

    /**
     * Tiện ích làm sạch nội dung (Bỏ ký tự lạ, làm mượt khoảng trắng)
     */
    static sanitize(text: string): string {
        return text.trim().replace(/\s+/g, ' ');
    }
}
