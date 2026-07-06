import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/table/data-table";
import { StatCard } from "@/shared/components/dashboard/stat-card";

import { escalationColumns } from "./escalation-table-columns";
import { escalationData } from "../mock/escalation-data";

export function EscalationDetails() {
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            All Escalation
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Track revenue, payouts, and financial performance
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
          value="08"
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="Open Escalation"
          value="456"
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="In Review"
          value="234"
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="Resolved"
          value="34"
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
          data={escalationData}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search by name , ID or profession"
          onAdvancedFilter={() => {}}
          onExport={() => {}}
          pagination={{
            page,
            pageSize: 10,
            totalItems: escalationData.length,
            totalPages: 1,
            onPageChange: setPage,
          }}
          resourceLabel="escalations"
        />
      </div>
    </div>
  );
}