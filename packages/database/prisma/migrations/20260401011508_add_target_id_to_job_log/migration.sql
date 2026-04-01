-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proxy" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Proxy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FbAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proxyId" TEXT,
    "fbUid" TEXT NOT NULL,
    "sessionData" TEXT,
    "username" TEXT,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "twoFactorSecret" TEXT,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "FbAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FbGroup" (
    "id" TEXT NOT NULL,
    "fbAccountId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "privacy" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FbGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentSpintax" TEXT NOT NULL,
    "mediaUrls" JSONB,

    CONSTRAINT "PostTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetConfigs" JSONB NOT NULL,
    "templateId" TEXT,
    "delayConfig" JSONB,
    "protectionConfig" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "lastBatchId" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "fbAccountId" TEXT NOT NULL,
    "targetId" TEXT,
    "batchId" TEXT,
    "actionType" TEXT NOT NULL,
    "message" TEXT,
    "screenshotUrl" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationJob" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CampaignToFbAccount" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FbAccount_fbUid_key" ON "FbAccount"("fbUid");

-- CreateIndex
CREATE UNIQUE INDEX "FbGroup_fbAccountId_groupId_key" ON "FbGroup"("fbAccountId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignToFbAccount_AB_unique" ON "_CampaignToFbAccount"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignToFbAccount_B_index" ON "_CampaignToFbAccount"("B");

-- AddForeignKey
ALTER TABLE "FbAccount" ADD CONSTRAINT "FbAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FbAccount" ADD CONSTRAINT "FbAccount_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "Proxy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FbGroup" ADD CONSTRAINT "FbGroup_fbAccountId_fkey" FOREIGN KEY ("fbAccountId") REFERENCES "FbAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTemplate" ADD CONSTRAINT "PostTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PostTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLog" ADD CONSTRAINT "JobLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLog" ADD CONSTRAINT "JobLog_fbAccountId_fkey" FOREIGN KEY ("fbAccountId") REFERENCES "FbAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToFbAccount" ADD CONSTRAINT "_CampaignToFbAccount_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToFbAccount" ADD CONSTRAINT "_CampaignToFbAccount_B_fkey" FOREIGN KEY ("B") REFERENCES "FbAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
