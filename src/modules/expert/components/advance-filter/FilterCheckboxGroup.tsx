type Props = {
    title: string
    options: string[]
}

export function FilterCheckboxGroup({
    title,
    options,
}: Props) {
    return (
        <div className="space-y-4">

            <h4 className="text-sm font-semibold text-white">
                {title}
            </h4>

            <div className="flex flex-wrap gap-x-10 gap-y-5">

                {options.map((option) => (
                    <label
                        key={option}
                        className="flex items-center gap-2 text-sm text-white"
                    >
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-white/40 bg-transparent accent-[#FFC849]"
                        />

                        {option}
                    </label>
                ))}

            </div>

        </div>
    )
}