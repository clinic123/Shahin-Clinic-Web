"use client";

import { formatDateTime } from "@/lib/utils";
import { ForumTopic } from "@/types";
import { Clock, MessageSquare, Pin, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { FaEye } from "react-icons/fa";

interface Author {
  name: string;
}

interface Category {
  name: string;
  slug: string;
  color: string;
}

interface TopicCardProps {
  data: ForumTopic;
  onClick?: () => {};
}

const TopicCard: React.FC<TopicCardProps> = ({ data, onClick }) => {
  const {
    id,
    author,
    category,
    createdAt,
    isLocked,
    isPinned,
    isFeatured,
    slug,
    title,
    content,
    views,
    upvotes,
    updatedAt,
    _count,
  } = data;

  return (
    <div
      key={data.id}
      onClick={onClick}
      className="flex items-start space-x-4 p-4 border rounded-lg hover:border-green-300 transition-colors cursor-pointer"
    >
      {/* Author Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-green-600">
            {author.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Topic Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          {isPinned && <Pin className="h-4 w-4 text-green-600" />}
          <Link
            href={`/forum/topics/${slug}`}
            className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2"
          >
            {title}
          </Link>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
          <Link
            href={`/forum/categories/${category.slug}`}
            className="flex items-center space-x-1 hover:text-green-600 transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span>{category.name}</span>
          </Link>
          <span>by {author.name}</span>
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDateTime(createdAt)}</span>
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{_count.posts} replies</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaEye className="h-3 w-3" />
            <span>{views} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUpIcon className="h-3 w-3" />
            <span>{upvotes} votes</span>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      <div className="text-right text-xs text-gray-500 flex-shrink-0">
        <div>Last activity</div>
        <div className="font-medium">{formatDateTime(updatedAt)}</div>
      </div>
    </div>
  );
};

export default TopicCard;
