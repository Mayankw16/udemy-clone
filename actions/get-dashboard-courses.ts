import { Category, Chapter, Course } from "@prisma/client";
import { db } from "@/lib/db";
import { getProgress } from "./get-progress";

type CourseWithCategoryAndProgress = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

export const getDashboardCourses = async (userId: string) => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: { userId: userId },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    const courses = purchasedCourses.map(
      (purchase) => purchase.course
    ) as CourseWithCategoryAndProgress[];

    for (let course of courses) {
      const progress = await getProgress(userId, course.id);
      course.progress = progress;
    }

    const completedCourses = courses.filter(
      (course) => course.progress === 100
    );

    const courseInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100
    );

    return { completedCourses, courseInProgress };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return { completedCourses: [], courseInProgress: [] };
  }
};
