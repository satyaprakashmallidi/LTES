import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileJobSheet } from "@/components/MobileJobSheet";
import { Briefcase, MapPin, Calendar, Users } from "lucide-react";

const jobsList = [
  {
    id: "J-2024-089",
    siteName: "Solar Farm - Great Wilbraham",
    technician: "Terry",
    scheduledDate: "2024-01-22",
    status: "Booked",
    type: "SMA Inverter Maintenance",
  },
  {
    id: "J-2024-090",
    siteName: "Office Block 3 - Manchester",
    technician: "Jason",
    scheduledDate: "2024-01-28",
    status: "Booked",
    type: "HVAC Repair",
  },
  {
    id: "J-2024-091",
    siteName: "Factory Floor 2 - Birmingham",
    technician: "Terry",
    scheduledDate: "2024-01-20",
    status: "Complete",
    type: "LED Lighting Installation",
  },
];

const MobileJobSheets = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("jobId");

  if (jobId) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Mobile Job Sheets" }, { label: jobId }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Job Sheet - {jobId}</h1>
          <Button variant="outline" onClick={() => navigate("/mobile-job-sheets")}>
            Back to Jobs
          </Button>
        </div>
        <MobileJobSheet jobId={jobId} onClose={() => navigate("/mobile-job-sheets")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Mobile Job Sheets" }]} />

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Mobile Job Sheets</h1>
          <Badge className="bg-green-600 text-white border-0 text-xs font-semibold">
            Phase 1
          </Badge>
          <Badge className="bg-orange-600 text-white border-0 text-xs font-semibold">
            🎯 Equipment Checklists - Phase 2
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">
          Access job information, capture photos and voice notes, complete RAMS assessments
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobsList.map((job) => (
          <Card
            key={job.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/mobile-job-sheets?jobId=${job.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{job.id}</CardTitle>
                <Badge
                  className={
                    job.status === "Complete"
                      ? "bg-success text-success-foreground"
                      : "bg-info text-info-foreground"
                  }
                >
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.siteName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{job.technician}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileJobSheets;
