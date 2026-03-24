import { format } from "date-fns";
import { engineers, getEngineerJobCount, type Job } from "@/data/mockJobs";

interface EngineerAvailabilityPanelProps {
  selectedDate: string;
  jobs: Job[];
  onSelectEngineer: (name: string) => void;
  selectedEngineer?: string;
}

export function EngineerAvailabilityPanel({
  selectedDate,
  jobs,
  onSelectEngineer,
  selectedEngineer,
}: EngineerAvailabilityPanelProps) {
  if (!selectedDate) return null;

  const parsedDate = new Date(selectedDate + "T00:00:00");
  const dayName = format(parsedDate, "EEEE");
  const dateStr = format(parsedDate, "d MMMM yyyy");

  const jobsOnDate = jobs.filter(j => j.scheduledDate === selectedDate);

  const sorted = [...engineers].sort((a, b) => {
    const countA = getEngineerJobCount(a.id, selectedDate, jobs);
    const countB = getEngineerJobCount(b.id, selectedDate, jobs);
    return countA - countB;
  });

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-4 space-y-3">
      <p className="text-xs font-black uppercase text-sidebar-foreground/60 tracking-widest">
        ⚡ Engineer Availability — {dayName} {dateStr}
      </p>

      <div className="space-y-1.5">
        {sorted.map((eng) => {
          const engJobs = jobsOnDate.filter(j => j.engineer === eng.name);
          const count = engJobs.length;
          const isSelected = selectedEngineer === eng.name;

          const dotColor =
            count === 0 ? "bg-green-500" :
            count === 1 ? "bg-amber-500" :
            "bg-red-500";

          const badgeClass =
            count === 0 ? "bg-green-500/10 text-green-400 border border-green-500/20" :
            count === 1 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-red-500/10 text-red-400 border border-red-500/20";

          const badgeLabel =
            count === 0 ? "Available" :
            count === 1 ? "1 Job" :
            `${count} Jobs`;

          return (
            <button
              key={eng.id}
              type="button"
              onClick={() => onSelectEngineer(eng.name)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all text-left",
                "hover:bg-sidebar-accent/60",
                isSelected && "border-l-2 border-yellow-400 bg-yellow-400/5 pl-2"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", dotColor)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-sidebar-foreground truncate">
                    {eng.name}
                  </span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0", badgeClass)}>
                    {badgeLabel}
                  </span>
                </div>

                {engJobs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {engJobs.map(j => (
                      <span
                        key={j.id}
                        className="text-[10px] px-1.5 py-0.5 bg-sidebar-accent/60 text-sidebar-foreground/60 rounded border border-sidebar-border truncate max-w-[150px]"
                      >
                        {j.siteName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
