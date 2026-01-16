import { Prisma } from "@/prisma/generated/prisma";

// Export all Prisma types
export type { ForumPost, ForumVote, User } from "@/prisma/generated/prisma";

// You can also create custom types with relations using Prisma validator
export type ForumTopicWithRelations = Prisma.ForumTopicGetPayload<{
  include: {
    author: true;
    category: true;
    votes: {
      select: {
        userId: true;
        type: true; // Make sure this is included
      };
    };
    posts: {
      include: {
        author: true;
        votes: {
          select: {
            userId: true;
            type: true; // Make sure this is included
          };
        };
        _count: {
          select: { replies: true; votes: true };
        };
      };
    };
    _count: {
      select: { posts: true; followers: true; votes: true };
    };
  };
}>;

export type ForumPostWithRelations = Prisma.ForumPostGetPayload<{
  include: {
    author: true;
    votes: {
      select: {
        userId: true;
        type: true; // Make sure this is included
      };
    };
    _count: {
      select: { replies: true; votes: true };
    };
  };
}>;

export type ForumCategoryWithRelations = Prisma.ForumCategoryGetPayload<{
  include: {
    _count: {
      select: { topics: true };
    };
    topics: {
      select: {
        author: true;
        title: true;
        slug: true;
        _count: true;
      };
    };
  };
}>;

export type CreateCategoryData = {
  name: string;
  description?: string;
  color: string;
  order?: number;
};

// types/forum.ts

export interface ForumAuthor {
  name: string;
  image: string | null;
}

export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  views: number;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  _count: {
    posts: number;
    followers: number;
    votes: number;
  };
  votes?: Array<{
    userId: string;
    type: "UPVOTE" | "DOWNVOTE"; // Add this line
  }>;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCategoryWithTopics extends ForumCategory {
  topics: ForumTopic[];
  _count: {
    topics: number;
  };
}

export interface ForumCategoryDetails extends ForumCategory {
  topics: ForumTopic[];
  _count: {
    topics: number;
  };
}
export interface AppointmentType {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  mobile: string;
  email: string;
  appointmentDate: string;
  department: string;
  doctorName: string;
  symptoms: string;
  paymentMobile: string;
  paymentTransactionId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
}

export type DoctorWithAppointmentRelationship = Prisma.DoctorGetPayload<{
  include: {
    id: true;
    name: true;
    specialization: true;
    department: true;
    email: true;
    phone: true;
    userId: true;
    createdAt: true;
    updatedAt: true;
    education: true;
    availableDays: true;
    bio: true;
    experience: true;
    consultationFee: true;
    appointments: {
      orderBy: {
        appointmentDate: "desc";
      };
      select: {
        doctor: {
          select: {
            id: true;
            name: true;
            specialization: true;
            department: true;
            email: true;
            phone: true;
            userId: true;
            createdAt: true;
            updatedAt: true;
            education: true;
            availableDays: true;
            bio: true;
            experience: true;
            consultationFee: true;
          };
        };
        status: true;
      };
      status: true;
    };
  };
}>;

export type CourseType = Prisma.CourseGetPayload<{
  include: {};
}>;

export interface CourseOrder {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentTransactionId: string;
  paymentMobile: string;
  accessGranted: boolean;
  accessCode?: string;
  createdAt: string;
  updatedAt: string;
  customerEmail: string;
  videoLink: string;
  course: {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    videoUrl?: string;
    category?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface CourseOrdersResponse {
  success: boolean;
  data: CourseOrder[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    status: string;
    search: string;
  };
}
