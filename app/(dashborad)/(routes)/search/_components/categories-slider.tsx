"use client";

import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";
import { CategoryItem } from "./category-item";
import { Category } from "@prisma/client";
import { IconType } from "react-icons";

const iconMap: Record<Category["name"], IconType> = {
  Music: FcMusic,
  Photography: FcOldTimeCamera,
  Fitness: FcSportsMode,
  Accounting: FcSalesPerformance,
  "Computer Science": FcMultipleDevices,
  Filming: FcFilmReel,
  Engineering: FcEngineering,
};

interface CategoriesSliderProps {
  categories: Category[];
}

export const CategoriesSlider = ({ categories }: CategoriesSliderProps) => (
  <div
    style={{ scrollbarWidth: "none" }}
    className="flex items-center gap-x-2 overflow-x-auto pb-2"
  >
    {categories.map((category) => (
      <CategoryItem
        key={category.id}
        label={category.name}
        value={category.id}
        icon={iconMap[category.name]}
      />
    ))}
  </div>
);
