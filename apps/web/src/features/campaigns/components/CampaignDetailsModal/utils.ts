export const parseStepInfo = (message?: string) => {
    if (!message) return null;
    const match = message.match(/\[STEP:(\d+)\/(\d+)\]/);
    if (!match) return null;
    return {
        current: parseInt(match[1]),
        total: parseInt(match[2]),
        cleanMessage: message.replace(/\[STEP:\d+\/\d+\]\s*/, "")
    };
};
