"use client";

import { Button } from "@/components/ui/button";
import { getVoteState, handleVote } from "@/lib/actions/vote";
import { cn } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface VoteButtonProps {
  itemId: string;
  itemType: "TOPIC" | "POST";
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: "UPVOTE" | "DOWNVOTE" | null;
  onVoteSuccess?: (data: any) => void;
}

export function VoteButton({
  itemId,
  itemType,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  onVoteSuccess,
}: VoteButtonProps) {
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes ?? 0);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes ?? 0);
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(
    initialUserVote ?? null
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchFreshVotes = async () => {
      const voteState = await getVoteState(itemId, itemType);
      setUpvotes(voteState.upvotes ?? 0);
      setDownvotes(voteState.downvotes ?? 0);
      setUserVote(voteState.userVote ?? null);
    };

    fetchFreshVotes();
  }, [itemId, itemType]);

  const handleVoteClick = (voteType: "UPVOTE" | "DOWNVOTE") => {
    startTransition(async () => {
      try {
        const result = await handleVote(itemId, itemType, voteType);

        if (result.error) {
          console.error("[v0] Vote error:", result.error);
          return;
        }

        setUpvotes(result.upvotes ?? 0);
        setDownvotes(result.downvotes ?? 0);
        setUserVote(result.userVote ?? null);

        if (onVoteSuccess) {
          onVoteSuccess(result);
        }
      } catch (error) {
        console.error("[v0] Failed to vote:", error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVoteClick("UPVOTE")}
        disabled={isPending}
        className={cn(
          "gap-1 transition-colors",
          userVote === "UPVOTE"
            ? "text-green-600 bg-green-50 hover:bg-green-100"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="text-xs font-medium">{upvotes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVoteClick("DOWNVOTE")}
        disabled={isPending}
        className={cn(
          "gap-1 transition-colors",
          userVote === "DOWNVOTE"
            ? "text-red-600 bg-red-50 hover:bg-red-100"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="text-xs font-medium">{downvotes}</span>
      </Button>
    </div>
  );
}
