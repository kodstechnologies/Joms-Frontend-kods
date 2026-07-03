type StatCardProps = {
  title: string;
  value: string;
  className?: string;
};

export function StatCard({
  title,
  value,
  className,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-[#242424] bg-[#181818] px-5 py-4 ${className ?? ""}`}
    >
      <p className="text-[12px] font-medium text-[#888888]">
        {title}
      </p>

      <h2 className="mt-2 text-[20px] font-semibold text-white">
        {value}
      </h2>
    </div>
  );
}