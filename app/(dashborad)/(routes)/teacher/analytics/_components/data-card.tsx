import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

interface DataCardProps {
  value: number;
  label: string;
  variant?: "price" | "number";
}

export const DataCard = ({
  value,
  label,
  variant = "number",
}: DataCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{label}</CardTitle>
    </CardHeader>
    <CardContent className="text-2xl font-bold">
      {variant === "price" ? formatPrice(value) : value}
    </CardContent>
  </Card>
);
