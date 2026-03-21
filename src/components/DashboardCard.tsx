import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string | ReactNode;
  icon: LucideIcon;
  count?: number;
  children: ReactNode;
  navigateTo?: string;
  className?: string;
}

export function DashboardCard({
  title,
  icon: Icon,
  count,
  children,
  navigateTo,
  className = "",
}: DashboardCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <Card
      className={`${navigateTo ? "cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1" : "transition-all hover:shadow-lg"} ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
        {count !== undefined && (
          <div className="text-3xl font-bold text-primary">{count}</div>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
