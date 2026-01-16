import { CoursesResponse } from "@/services/courseService";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface Props {
  selectedCategory: string;
  handleCategoryChange: (category: string) => void;
  categories?: string[];
}

const fetchCourses = async (): Promise<CoursesResponse> => {
  const res = await fetch(`/api/courses`);

  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }

  return res.json();
};

const CategoryFilter = ({
  selectedCategory,
  handleCategoryChange,
  categories,
}: Props) => {
  const { data } = useQuery({
    queryKey: ["courses-all"],
    queryFn: fetchCourses,
    enabled: !categories || categories.length === 0,
  });

  const options = useMemo(() => {
    if (categories && categories.length) {
      return categories;
    }

    if (!data?.courses) return ["all"];

    const unique = data.courses
      .map((item) => item.category)
      .filter((category): category is string => Boolean(category))
      .filter((category, index, self) => self.indexOf(category) === index);

    return ["all", ...unique];
  }, [categories, data?.courses]);

  return (
    <div>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Category
      </label>
      <select
        id="category"
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {options.map((category) => (
          <option key={category} value={category}>
            {category === "all"
              ? "All Categories"
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
