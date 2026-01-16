"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

export async function handleVote(
  itemId: string,
  itemType: "TOPIC" | "POST",
  voteType: "UPVOTE" | "DOWNVOTE"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized", status: 401 };
    }

    if (!["UPVOTE", "DOWNVOTE"].includes(voteType)) {
      return { error: "Invalid vote type", status: 400 };
    }

    if (!["TOPIC", "POST"].includes(itemType)) {
      return { error: "Invalid item type", status: 400 };
    }

    const existingVote = await prisma.forumVote.findFirst({
      where: {
        userId: session.user.id,
        ...(itemType === "TOPIC" ? { topicId: itemId } : { postId: itemId }),
      },
    });

    let result;

    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote if clicking the same type again
        result = await prisma.forumVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Update vote type
        result = await prisma.forumVote.update({
          where: { id: existingVote.id },
          data: { type: voteType },
        });
      }
    } else {
      // Create new vote
      result = await prisma.forumVote.create({
        data: {
          type: voteType,
          userId: session.user.id,
          ...(itemType === "TOPIC" ? { topicId: itemId } : { postId: itemId }),
        },
      });
    }

    const voteCounts = await prisma.forumVote.groupBy({
      by: ["type"],
      where: {
        ...(itemType === "TOPIC" ? { topicId: itemId } : { postId: itemId }),
      },
      _count: {
        type: true,
      },
    });

    const upvotes =
      voteCounts.find((v) => v.type === "UPVOTE")?._count.type || 0;
    const downvotes =
      voteCounts.find((v) => v.type === "DOWNVOTE")?._count.type || 0;
    const netVotes = upvotes - downvotes;

    if (itemType === "TOPIC") {
      revalidateTag(`topic-${itemId}`);
      revalidateTag("forum-topics");
      revalidateTag("forum-all");
      revalidatePath("/forum");
      revalidatePath("/forum/topics");
      revalidatePath(`/forum/topics/${itemId}`);
    } else {
      revalidateTag(`post-${itemId}`);
      revalidateTag(`topic-${itemId}`);
      revalidateTag("forum-comments");
      revalidateTag("forum-all");
      revalidatePath("/forum");
      revalidatePath("/forum/comments");
      revalidatePath(`/forum/posts/${itemId}`);
    }

    return {
      success: true,
      netVotes,
      upvotes,
      downvotes,
      userVote: existingVote?.type === voteType ? null : voteType,
    };
  } catch (error: any) {
    console.error("[v0] Vote error:", error);
    return { error: "Failed to process vote", status: 500 };
  }
}

export async function getVoteState(itemId: string, itemType: "TOPIC" | "POST") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const votes = await prisma.forumVote.findMany({
      where: {
        ...(itemType === "TOPIC" ? { topicId: itemId } : { postId: itemId }),
      },
    });

    const upvotes = votes.filter((v) => v.type === "UPVOTE").length;
    const downvotes = votes.filter((v) => v.type === "DOWNVOTE").length;
    const userVote = session
      ? votes.find((v) => v.userId === session.user.id)?.type
      : null;

    return {
      upvotes: upvotes ?? 0,
      downvotes: downvotes ?? 0,
      userVote: userVote ?? null,
    };
  } catch (error) {
    console.error("[v0] Error fetching vote state:", error);
    return { upvotes: 0, downvotes: 0, userVote: null };
  }
}
