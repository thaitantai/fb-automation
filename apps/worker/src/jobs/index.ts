import { JobDefinition } from './types';
import { loginAccountJob } from './account/login-account';
import { syncGroupsJob } from './group/sync-groups';
import { autoPostGroupJob } from './post/auto-post-group';

/**
 * Đăng ký tập trung tất cả các Job trong hệ thống
 */
export const jobRegistry: Record<string, JobDefinition> = {
  'LOGIN_ACCOUNT': loginAccountJob,
  'SYNC_GROUPS': syncGroupsJob,
  'AUTO_POST_GROUP': autoPostGroupJob,
};

export * from './types';


