import { Prisma } from "@/prisma/generated/prisma";

const postInclude = {} satisfies Prisma.PostInclude;

export type PostTypeWithRelations = Prisma.PostGetPayload<{
  include: {
    author: true;
    category: true;
    tags: { include: { tag: true } };
    featuredImage: true;
  };
}>;
