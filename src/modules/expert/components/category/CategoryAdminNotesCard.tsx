interface Props {
  notes: string;
}

const CategoryAdminNotesCard = ({
  notes,
}: Props) => {
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Admin Notes
      </h3>

      <div className="rounded-2xl bg-[#181818] p-6">
        <p className="text-sm leading-7 text-[#CFCFCF]">
          {notes}
        </p>
      </div>
    </div>
  );
};

export default CategoryAdminNotesCard;