import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, itemType, voteType } = await request.json();

    if (!itemId || !itemType || !voteType) {
      return NextResponse.json(
        { error: "itemId, itemType, and voteType are required" },
        { status: 400 }
      );
    }

    if (!["UPVOTE", "DOWNVOTE"].includes(voteType)) {
      return NextResponse.json(
        { error: "voteType must be UPVOTE or DOWNVOTE" },
        { status: 400 }
      );
    }

    if (!["TOPIC", "POST"].includes(itemType)) {
      return NextResponse.json(
        { error: "itemType must be TOPIC or POST" },
        { status: 400 }
      );
    }

    // Check if user already voted
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

    // Get updated vote counts
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
    } else {
      revalidateTag(`post-${itemId}`);
      revalidateTag(`topic-${itemId}`);
    }

    return NextResponse.json({
      success: true,
      netVotes,
      upvotes,
      downvotes,
      userVote: existingVote?.type === voteType ? null : voteType,
    });
  } catch (error: any) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
