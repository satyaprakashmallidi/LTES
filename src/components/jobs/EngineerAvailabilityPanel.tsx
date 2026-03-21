import { engineers, getEngineerJobCount, type Job } from "@/data/mockJobs";

interface EngineerAvailabilityPanelProps {
  selectedDate: string;
  jobs: Job[];
  onSelectEngineer: (name: string) => void;
}

export function EngineerAvailabilityPanel({ selectedDate, jobs, onSelectEngineer }: EngineerAvailabilityPanelProps) {
  if (!selectedDate) return null;

  const sorted = [...engineers].sort((a, b) => {
    const countA = getEngineerJobCount(a.id, selectedDate, jobs);
    const countB = getEngineerJobCount(b.id, selectedDate, jobs);
    return countA - countB;
  });

  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Engineer Availability — {selectedDate}
      </p>
      {sorted.map((eng) => {
        const count = getEngineerJobCount(eng.id, selectedDate, jobs);
        const dotColor = count === 0 ? "bg-green-500" : count === 1 ? "bg-amber-500" : "bg-red-500";
        const label = count === 0 ? "Free" : count === 1 ? "Busy" : "Heavy";
        const labelColor = count === 0 ? "text-green-400" : count === 1 ? "text-amber-400" : "text-red-400";

        return (
          <button
            key={eng.id}
            type="button"
            onClick={() => onSelectEngineer(eng.name)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-muted/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
              <span className="text-sm font-medium">{eng.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{count} job{count !== 1 ? "s" : ""}</span>
              <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
