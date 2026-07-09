import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/table/data-table";
import { StatCard } from "@/shared/components/dashboard/stat-card";
import {
  useAllEscalations,
  useEscalationMetrics,
} from "@/modules/my-tasks/hooks/use-admin-escalation";

import { escalationColumns } from "./escalation-table-columns";

export function EscalationDetails() {
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: metricsResponse, isLoading: isMetricsLoading } = useEscalationMetrics();
  const { data: escalationsResponse, isLoading: isEscalationsLoading } = useAllEscalations({
    page,
    limit: pageSize,
    search: searchValue,
  });

  const metrics = metricsResponse?.data;
  const escalations = escalationsResponse?.data?.escalations || [];
  const meta = escalationsResponse?.data?.meta;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            All Escalation
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Track and manage escalated approval tasks across all modules
          </p>
        </div>

        <Button className="h-11 rounded-xl bg-[#F6C978] px-5 font-semibold text-black hover:bg-[#E6B85D] hover:text-black">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Escalation"
          value={isMetricsLoading ? "—" : String(metrics?.total ?? 0).padStart(2, "0")}
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="Open Escalation"
          value={isMetricsLoading ? "—" : String(metrics?.open ?? 0)}
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="In Review"
          value={isMetricsLoading ? "—" : String(metrics?.inReview ?? 0)}
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="Resolved"
          value={isMetricsLoading ? "—" : String(metrics?.resolved ?? 0)}
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />
      </div>

      <div className="rounded-xl border border-[#242424] bg-[#171717] p-5">
        <DataTable
          columns={escalationColumns}
          data={escalations}
          searchValue={searchValue}
          onSearchChange={(value) => {
            setSearchValue(value);
            setPage(1);
          }}
          searchPlaceholder="Search by name , ID or profession"
          onAdvancedFilter={() => {}}
          onExport={() => {}}
          isLoading={isEscalationsLoading}
          pagination={{
            page,
            pageSize,
            totalItems: meta?.total ?? escalations.length,
            totalPages: meta?.totalPages ?? 1,
            onPageChange: setPage,
          }}
          resourceLabel="escalations"
        />
      </div>
    </div>
  );
}
