import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, SquarePlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/table/data-table";
import { StatCard } from "@/shared/components/dashboard/stat-card";

import { communicationColumns } from "../../components/communication-table-columns";
import { communicationData } from "../../mock/communication-data";

export function CommunicationListPage() {
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Communication Management
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Comprehensive user data and admin controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="h-11 rounded-xl bg-[#F6C978] px-5 font-semibold text-black hover:bg-[#E6B85D] hover:text-black"
          >
            <Upload className="mr-2 h-4 w-4" />
            Manage Metrics
          </Button>

          <Button
            onClick={() => navigate("/communication/create")}
            className="h-11 rounded-xl bg-[#F6C978] px-5 font-semibold text-black hover:bg-[#E6B85D] hover:text-black"
          >
            <SquarePlus className="mr-2 h-4 w-4" />
            Create Communication
          </Button>
        </div>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          title="Total messages sent"
          value="20"
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />

        <StatCard
          title="Active campaigns"
          value="38"
          trend={{
            direction: "up",
            percentage: 5.5,
            label: "vs last quarter",
          }}
        />

        <StatCard
          title="Channels used"
          value="3"
        />

        <StatCard
          title="Scheduled messages"
          value="10"
          trend={{
            direction: "up",
            percentage: 12.5,
            label: "vs last month",
          }}
        />

        <StatCard
          title="Failed/Undelivered"
          value="20"
          trend={{
            direction: "up",
            percentage: 6.7,
            label: "vs last month",
          }}
        />
      </div>

      {/* Table */}

      <div className="rounded-xl border border-[#242424] bg-[#171717] p-5">
        <DataTable
          columns={communicationColumns}
          data={communicationData}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search by name, ID or profession"
          onAdvancedFilter={() => { }}
          onExport={() => { }}
          pagination={{
            page,
            pageSize: 10,
            totalItems: communicationData.length,
            totalPages: 1,
            onPageChange: setPage,
          }}
          resourceLabel="communications"
        />
      </div>
    </div>
  );
}