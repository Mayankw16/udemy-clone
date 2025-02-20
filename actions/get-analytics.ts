import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

type PurchaseWithCourse = Purchase & {
  course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseId: string]: number } = {};

  purchases.forEach((purchase) => {
    if (!grouped[purchase.courseId]) grouped[purchase.courseId] = 0;
    grouped[purchase.courseId] += purchase.course.price!;
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: { course: { userId } },
      include: { course: true },
    });

    const groupedEarnings = groupByCourse(purchases);

    const data = Object.entries(groupedEarnings).map(([courseId, total]) => ({
      name: purchases.find((purchase) => purchase.courseId === courseId)?.course
        .title!,
      total,
    }));

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return { data, totalRevenue, totalSales };
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
