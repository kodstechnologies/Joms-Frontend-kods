type StatCardProps = {
  title: string;
  value: string;
};

export function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="h-[96px] rounded-2xl bg-[#171717] px-6 py-4">
      <p className="text-[13px] font-medium text-[#8A8A8A]">
        {title}
      </p>

      <h2 className="mt-3 text-[18px] font-semibold text-white">
        {value}
      </h2>
    </div>
  );
}