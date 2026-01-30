-- CreateTable
CREATE TABLE "CommentLikes" (
    "productCommentId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,

    CONSTRAINT "CommentLikes_pkey" PRIMARY KEY ("productCommentId","userId")
);

-- CreateTable
CREATE TABLE "CommentDislikes" (
    "productCommentId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,

    CONSTRAINT "CommentDislikes_pkey" PRIMARY KEY ("productCommentId","userId")
);

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_productCommentId_fkey" FOREIGN KEY ("productCommentId") REFERENCES "ProductComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDislikes" ADD CONSTRAINT "CommentDislikes_productCommentId_fkey" FOREIGN KEY ("productCommentId") REFERENCES "ProductComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDislikes" ADD CONSTRAINT "CommentDislikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
