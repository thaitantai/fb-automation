import { JobDefinition } from './types';
import { loginAccountJob } from './account/login-account';
import { syncGroupsJob } from './group/sync-groups';
import { autoPostGroupJob } from './post/auto-post-group';
import { autoCommentGroupJob } from './comment/auto-comment-group';

/**
 * Đăng ký tập trung tất cả các Job trong hệ thống
 */
export const jobRegistry: Record<string, JobDefinition> = {
  'LOGIN_ACCOUNT': loginAccountJob,
  'SYNC_GROUPS': syncGroupsJob,
  'AUTO_POST_GROUP': autoPostGroupJob,
  'AUTO_COMMENT_GROUP': autoCommentGroupJob,
};

export * from './types';


