import { ArrowLeft, CircleHelp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export function CommunicationForm() {
    const navigate = useNavigate();
    const [deliveryType, setDeliveryType] = useState<
        "sendNow" | "schedule"
    >("sendNow");
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}

            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="mb-3 flex items-center gap-2 text-sm text-white hover:text-[#F0C27B]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Create Communication
                </button>

                <p className="text-sm text-slate-400">
                    Communication Management /
                    <span className="ml-1 font-medium text-white">
                        Create Communication
                    </span>
                </p>
            </div>

            {/* Main Form Card */}

            <div className="rounded-2xl border border-[#242424] bg-[#171717] p-8">

                <div className="border-b border-[#2A2A2A] pb-5">
                    <h2 className="text-lg font-semibold text-white">
                        Create New Communication Template
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Send updates, announcements, or important messages to your audience.
                    </p>
                </div>

                <div className="mt-8">

                    {/* Communication Title */}
                    <div className="mb-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Communication Title (Internal use only)
                            </label>

                            <input
                                type="text"
                                placeholder="Enter communication Title"
                                className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#F0C27B]"
                            />
                        </div>
                    </div>

                    {/* Row */}

                    {/* Channel Type & Communication Type */}

                    <div className="mb-5 grid grid-cols-2 gap-5">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Channel Type
                            </label>

                            <select className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white outline-none focus:border-[#F0C27B]">
                                <option>In App Notification</option>
                                <option>Email</option>
                                <option>Push Notification</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Communication Type
                            </label>

                            <select className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white outline-none focus:border-[#F0C27B]">
                                <option>Select</option>
                            </select>
                        </div>

                    </div>

                    {/* Audience */}

                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-white">
                            Audience
                        </label>

                        <input
                            type="text"
                            placeholder="Enter Audience Type"
                            className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#F0C27B]"
                        />
                    </div>

                    {/* Time & Date */}

                    <div
                        className={`mb-4 grid gap-5 ${deliveryType === "schedule" ? "grid-cols-2" : "grid-cols-1"
                            }`}
                    >
                        {/* Left */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Set Time & Date
                            </label>

                            <div className="mt-2 flex items-center gap-8">
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                                    <input
                                        type="radio"
                                        checked={deliveryType === "sendNow"}
                                        onChange={() => setDeliveryType("sendNow")}
                                        className="accent-[#F0C27B]"
                                    />
                                    Send Now
                                </label>

                                <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                                    <input
                                        type="radio"
                                        checked={deliveryType === "schedule"}
                                        onChange={() => setDeliveryType("schedule")}
                                        className="accent-[#F0C27B]"
                                    />
                                    Schedule
                                </label>
                            </div>
                        </div>

                        {/* Right - Only show for Schedule */}

                        {deliveryType === "schedule" && (
                            <div>
                                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-white">
                                    Add Date & Time

                                    <div className="group relative">
                                        <span className="cursor-help text-xs text-slate-400">ⓘ</span>

                                        <div className="absolute left-5 top-0 z-10 hidden whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-medium text-black shadow-lg group-hover:block">
                                            Time Format: 24 Hours
                                        </div>
                                    </div>
                                </label>

                                <input
                                    type="datetime-local"
                                    className="h-10 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white outline-none"
                                />
                            </div>
                        )}
                    </div>
                    {/* Subject Line */}

                    <div className="mt-3">
                        <label className="mb-2 block text-sm font-medium text-white">
                            Subject Line
                        </label>

                        <input
                            type="text"
                            placeholder="Enter Message"
                            className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#F0C27B]"
                        />
                    </div>

                    {/* Message Content */}

                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-medium text-white">
                            Message Content
                        </label>

                        <input
                            type="text"
                            placeholder="Enter Message"
                            className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#F0C27B]"
                        />
                    </div>

                    {/* Additional Notes */}

                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-medium text-white">
                            Additional Notes
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Message"
                            className="h-11 w-full rounded-lg border border-[#242424] bg-black px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#F0C27B]"
                        />
                    </div>

                </div>
            </div >

            {/* Footer */}

            <div className="rounded-xl border border-[#242424] bg-[#171717] px-5 py-4">
                <div className="flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="h-10 rounded-lg border border-[#4A4A4A] bg-transparent px-5 text-sm font-medium text-slate-300 transition hover:border-[#F0C27B] hover:text-white"
                    >
                        Close
                    </button>

                    <button
                        type="submit"
                        className="h-10 rounded-lg bg-[#F0C27B] px-6 text-sm font-semibold text-black transition hover:bg-[#E8BC72]"
                    >
                        Submit
                    </button>

                </div>
            </div>
        </div >
    );
}