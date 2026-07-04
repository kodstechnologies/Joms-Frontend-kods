import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  pausedCategoryColumns,
  type PausedCategory,
} from "./PausedCategoryColumns";

const pausedCategoryDefaults = {
  description: "",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  createdBy: "Admin",
  adminNotes: "",
  subCategories: [],
} satisfies Pick<
  PausedCategory,
  "description" | "createdAt" | "updatedAt" | "createdBy" | "adminNotes" | "subCategories"
>;

const data: PausedCategory[] = [
  {
    id: "CAT001",
    name: "Photography",
    status: "Accepted",
    subCategory: 5,
    services: 42,
    experts: 42,
    revenue: "₹3,45,000",
    ...pausedCategoryDefaults,
  },
  {
    id: "CAT002",
    name: "Makeup Artists",
    status: "Pending",
    subCategory: 5,
    services: 58,
    experts: 58,
    revenue: "₹3,45,000",
    ...pausedCategoryDefaults,
  },
  {
    id: "CAT003",
    name: "Videography",
    status: "Deleted",
    subCategory: 5,
    services: 89,
    experts: 89,
    revenue: "₹3,45,000",
    ...pausedCategoryDefaults,
  },
];
const PausedCategoryTable = () => {
  const table = useReactTable({
    data,
    columns: pausedCategoryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl bg-[#181818] p-6">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-[#2A2A2A]"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-4 text-left text-xs font-semibold text-[#B3B3B3]"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[#2A2A2A]"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="py-5 text-sm text-white"
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Placeholder */}

      <div className="mt-6 flex items-center justify-between">
        <button className="rounded border border-[#444] px-4 py-2 text-white">
          Previous
        </button>

        <div className="flex gap-2">
          <button className="h-9 w-9 rounded bg-[#F6C97A] text-black">
            1
          </button>

          <button className="h-9 w-9 rounded border border-[#444] text-white">
            2
          </button>
        </div>

        <button className="rounded border border-[#444] px-4 py-2 text-white">
          Next
        </button>
      </div>
    </div>
  );
};

export default PausedCategoryTable;