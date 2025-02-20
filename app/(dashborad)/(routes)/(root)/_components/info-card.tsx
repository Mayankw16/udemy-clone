import { IconBadge } from "@/components/icon-badge";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  variant?: "default" | "success";
  numberOfItems: number;
}

export const InfoCard = ({
  icon: Icon,
  label,
  variant,
  numberOfItems,
}: InfoCardProps) => (
  <div className="border rounded-md flex items-center gap-x-2 p-3">
    <IconBadge icon={Icon} variant={variant} />
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">
        {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
      </p>
    </div>
  </div>
);
