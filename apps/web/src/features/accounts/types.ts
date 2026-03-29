export interface FbAccount {
  id: string;
  fbUid: string;
  status: string;
  sessionData: string;
  username: string | null;
  password: string | null;
  lastLogin: string | null;
  proxy?: { ip: string; port: number } | null;
  groupsCount?: number;
}

export interface NewAccountInput {
  username: string; // Email or Phone
  password: string;
  proxyId?: string; // Optional
}

export interface FbGroup {
  id: string;
  fbAccountId: string;
  groupId: string;
  name: string;
  privacy: string;
  memberCount: number;
  syncedAt: string;
}
