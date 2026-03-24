import { X, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JobHistoryItem {
  jobNumber: string;
  date: string;
  issue: string;
  status: "Completed" | "Scheduled";
  technician: string;
}

interface EquipmentHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  serialNumber: string;
  history: JobHistoryItem[];
}

export const EquipmentHistorySidebar = ({
  isOpen,
  onClose,
  serialNumber,
  history,
}: EquipmentHistorySidebarProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-md bg-background z-50 shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold truncate pr-2">
            Issue History - {serialNumber}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(100%-73px)]">
          <div className="p-4 space-y-3">
            {history.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-lg font-medium text-foreground">
                  No previous issues found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This is the first recorded job for this equipment
                </p>
              </div>
            ) : (
              /* History Cards */
              history.map((job, index) => (
                <div
                  key={job.jobNumber}
                  className="border rounded-lg p-4 space-y-2 bg-card animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-base">
                      {job.jobNumber}
                    </span>
                    <Badge
                      variant={job.status === "Completed" ? "default" : "secondary"}
                      className={
                        job.status === "Completed"
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {formatDate(job.date)}
                  </p>

                  <p className="text-base">{truncateText(job.issue, 60)}</p>

                  <p className="text-sm text-muted-foreground">
                    Technician: {job.technician}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};
