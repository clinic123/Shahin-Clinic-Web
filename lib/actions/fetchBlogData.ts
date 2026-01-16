import { PostTypeWithRelations } from "@/types/post";

export const fetchBlogData = async ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params?: string;
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs?${
      category ? `category=${category}` : ""
    }${search ? `&search=${search}` : ""}&sort=${sort || "newest"}${
      params === "homepage" ? "&limit=4" : ""
    }`,
    {
      next: {
        tags: [`blog`],
        revalidate: 3600,
      },
      cache: "force-cache",
    }
  );

  const data: PostTypeWithRelations[] = await res.json();
  return data;
};

export const fetchBlogUsers = async ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params?: string;
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/user-blogs?${
      category ? `category=${category}` : ""
    }${search ? `&search=${search}` : ""}&sort=${sort || "newest"}${
      params === "homepage" ? "&limit=3" : ""
    }`,
    {
      next: {
        tags: [`blog`],
      },
    }
  );

  const data: PostTypeWithRelations[] = await res.json();
  return data;
};
