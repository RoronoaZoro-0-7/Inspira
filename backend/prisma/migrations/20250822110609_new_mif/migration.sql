/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `helpfulCommentId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `helpfulReward` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postCost` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `expertiseTags` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `interestTags` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- DropIndex
DROP INDEX "public"."Post_categoryId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Post_helpfulCommentId_key";

-- DropIndex
DROP INDEX "public"."Post_status_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "categoryId",
DROP COLUMN "helpfulCommentId",
DROP COLUMN "helpfulReward",
DROP COLUMN "postCost",
DROP COLUMN "status",
ADD COLUMN     "categoryIds" TEXT[],
ADD COLUMN     "helpfulCommentIds" TEXT[],
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "bio",
DROP COLUMN "credits",
DROP COLUMN "expertiseTags",
DROP COLUMN "imageUrl",
DROP COLUMN "interestTags",
DROP COLUMN "name",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."PostStatus";

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "bio" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "expertiseTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interestTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CategoryToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE INDEX "_CategoryToPost_B_index" ON "public"."_CategoryToPost"("B");

-- CreateIndex
CREATE INDEX "Post_categoryIds_createdAt_idx" ON "public"."Post"("categoryIds", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
