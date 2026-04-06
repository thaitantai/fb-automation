export const FB_SELECTORS = {
  LOGIN: {
    EMAIL_INPUT: 'input[name="email"], input[id="email"], input[type="text"], input[type="email"]',
    PASSWORD_INPUT: 'input[name="pass"], input[id="pass"], input[type="password"]',
    LOGIN_BUTTON: 'button[name="login"], [aria-label*="Đăng nhập" i], [aria-label*="Log In" i], [aria-label*="login" i], [role="button"]:has-text("Đăng nhập"), [role="button"]:has-text("Log In"), [role="button"]:has-text("Log in"), button[type="submit"], input[type="submit"]',
  },
  AUTH: {
    LOGGED_IN_INDICATORS: [
      '[aria-label="Account"]',
      '[aria-label="Your profile"]',
      '[aria-label="Trang cá nhân của bạn"]',
      'a[href="/me/"]',
      'div[role="navigation"]',
      '[data-sigil="m-home-header-buttons"]',
      '#mbasic_logout_button'
    ]
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
  },
  POST: {
    COMPOSER_TRIGGERS: [
      'span:has-text("Write something...")',
      'span:has-text("Bạn viết gì đi...")',
      'div[role="button"]:has-text("Write something...")',
      'div[role="button"]:has-text("Bạn viết gì đi...")'
    ],
    TEXTBOX: 'div[role="dialog"] div[role="textbox"], div[aria-label*="đang nghĩ gì"], div[aria-label*="on your mind"]',
    SUBMIT_BUTTONS: [
      'div[role="dialog"] div[aria-label="Post"]',
      'div[role="dialog"] div[aria-label="Đăng"]',
      'div[role="dialog"] div[role="button"]:has-text("Post")',
      'div[role="dialog"] div[role="button"]:has-text("Đăng")'
    ],
    PHOTO_VIDEO_BUTTON: '[aria-label="Photo/video"], [aria-label="Ảnh/video"], [aria-label="Photo/Video"]',
    FILE_INPUT: 'div[role="dialog"] input[type="file"][accept*="image"], div[role="dialog"] input[type="file"][accept*="video"]',
    UPLOAD_COMPLETE_INDICATOR: 'div[role="dialog"] img, [aria-label="Remove"], [aria-label="Gỡ"], div[role="presentation"] img',
  },
  COMMENT: {
    TEXTBOX: 'div[role="textbox"][aria-label*="Viết bình luận" i], div[role="textbox"][aria-label*="Write a comment" i], div[aria-label="Viết bình luận"], div[aria-label="Write a comment"]',
    TRIGGER: 'div[aria-label="Bình luận"], div[aria-label="Comment"], i[class*="comment"]',
    SUBMIT_INDICATOR: 'div[role="article"] :has-text("Vừa xong"), div[role="article"] :has-text("Just now")'
  },
  STATUS: {
    PENDING_APPROVAL: '[role="alert"]:has-text("phê duyệt"), [role="alert"]:has-text("approval"), :has-text("Đang chờ quản trị viên phê duyệt"), a[href*="my_pending_content"], :has-text("Post submitted"), :has-text("Bài viết đã được gửi"), :has-text("chờ phê duyệt"), :has-text("đang chờ duyệt")',
    BLOCKED: ':has-text("temporarily blocked"), :has-text("bị chặn tạm thời")',
    NOT_JOINED: 'div[aria-label="Join Group"], div[aria-label="Tham gia nhóm"]',
  }
};

/**
 * Các cấu hình chung cho Automation
 */
export const AUTOMATION_CONFIG = {
  JOB_TIMEOUT: 300000, // 5 phút là đủ cho đa số Job
  LOCK_DURATION: 600000, // 10 phút khóa an toàn
  MAX_ATTEMPTS: 3,
};

