export const FB_SELECTORS = {
  LOGIN: {
    EMAIL_INPUT: 'input[name="email"], input[id="email"], input[type="text"], input[type="email"]',
    PASSWORD_INPUT: 'input[name="pass"], input[id="pass"], input[type="password"]',
    LOGIN_BUTTON: 'button[name="login"], [aria-label*="Đăng nhập" i], [aria-label*="Log In" i], [aria-label*="login" i], [role="button"]:has-text("Đăng nhập"), [role="button"]:has-text("Log In"), [role="button"]:has-text("Log in"), button[type="submit"], input[type="submit"]',
  },
  CHECKPOINT: {
    CHALLENGE_CONTAINER: '[id="checkpoint_title"], [id="checkpointSubmitButton"], [id="two_step_verification_authentication_page"]',
    TWO_FACTOR_INPUT: 'input[name="approvals_code"], input#approvals_code, input[id="approvals_code"]',
    SUBMIT_BUTTON: 'button#checkpointSubmitButton, [id="checkpointSubmitButton"]',
  },
  HOME: {
    NAV_BAR: 'div[role="navigation"]',
    FEED_CONTAINER: 'div[role="main"]',
  },
  GROUPS: {
    GROUP_LIST_ITEM: 'div[role="listitem"]',
    GROUP_NAME: 'span.x193iq5w.xeuug22.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkez96.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xud6596.x3x7a5m.x6pr76m.x1s688f.x1n2onr6.x1vxc77.x1t8a6s2', // Lấy name của group
    GROUP_LINK: 'a[href*="/groups/"]', // Lấy link href để extract groupId
    PRIVACY_INFO: 'span.x193iq5w.xeuug22.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkez96.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xud6596.x3x7a5m.x6pr76m.x1s688f.x1n2onr6.x1vxc77.x1t8a6s2', // Re-check this
  }
};

/**
 * Các cấu hình chung cho Automation
 */
export const AUTOMATION_CONFIG = {
  JOB_TIMEOUT: 120000, // 2 phút
  LOCK_DURATION: 300000, // 5 phút
  MAX_ATTEMPTS: 3,
};

