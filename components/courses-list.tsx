import { Category, Course } from "@prisma/client";
import { CourseCard } from "@/components/course-card";

type CourseWithCategoryAndProgress = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface CoursesListProps {
  items: CourseWithCategoryAndProgress[];
}

export const CoursesList = ({ items }: CoursesListProps) => (
  <div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <CourseCard
          key={item.id}
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl!}
          chaptersLength={item.chapters.length}
          category={item.category?.name || ""}
          progress={item.progress}
          price={item.price!}
        />
      ))}
    </div>
    {items.length === 0 && (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No courses found
      </div>
    )}
  </div>
);
