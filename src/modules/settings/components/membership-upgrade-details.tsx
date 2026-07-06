import { ArrowLeft, Check, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MembershipUpgradeDetails() {
    const navigate = useNavigate();

    return (
        <div className="mx-20 flex flex-col gap-5 pb-8">
           
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="mb-3 flex items-center gap-2 text-sm text-white transition hover:text-[#F0C27B]"
                >
                    <ArrowLeft className="-ml-10 h-4 w-4" />
                    Membership Upgrade
                </button>

                <p className="-ml-10 text-sm text-slate-400">
                    My Tasks /
                    <span className="ml-1 font-medium text-white">
                        Membership Upgrade
                    </span>
                </p>
            </div>

            
            <div className="rounded-xl border border-[#242424] bg-[#171717] px-6 py-6">

                <div className="border-b border-[#2A2A2A] pb-5">
                    <h2 className="text-xl font-semibold text-white">
                        Upgrade Details
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Verify and approve the below details.
                    </p>
                </div>

                <div className="mt-6">
                    

                    <div className="grid grid-cols-4 gap-10">
                        <div>
                            <p className="text-sm text-slate-400">Username</p>

                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                    Sara Johnson
                                </span>

                                <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">Source App</p>

                            <p className="mt-2 text-sm font-medium text-white">
                                User App
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">Current Plan</p>

                            <p className="mt-2 text-sm font-medium text-white">
                                Legend
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">
                                Upgrading Plan
                            </p>

                            <p className="mt-2 text-sm font-medium text-white">
                                Popular
                            </p>
                        </div>
                    </div>


                    <div className="mt-8">
                        <p className="text-sm text-slate-400">
                            Escalated by
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-white underline">
                                John Doe
                            </span>

                            <span>
                                <ExternalLink className="h-4 w-4 text-white" />
                            </span>

                            <span className="inline-flex items-center rounded-full bg-[#F6C978] px-2.5 py-0.5 text-[10px] font-semibold leading-4 text-black">
                                Admin
                            </span>
                        </div>
                    </div>

                   
                    <div className="mt-8">
                        <p className="text-sm text-slate-400">
                            Reason for Upgrade
                        </p>

                        <p className="mt-3 text-sm leading-7 text-white">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Aenean commodo ligula eget dolor. Aenean massa.
                        </p>
                    </div>

                   

                    <div className="mt-8">
                        <p className="text-sm text-slate-400">
                            Admin Note
                        </p>

                        <p className="mt-3 text-sm leading-7 text-white">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Aenean commodo ligula eget dolor. Aenean massa.
                        </p>
                    </div>
                </div>

            </div>


            <div className="rounded-xl border border-[#242424] bg-[#171717] px-5 py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-[#444] px-5 py-2 text-sm text-white transition hover:border-[#F0C27B]"
                    >
                        Close
                    </button>

                    <div className="flex items-center gap-3">
                       
                        <button className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#15803D]">
                            Approve

                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                <Check className="h-3 w-3" />
                            </span>
                        </button>

                        

                        <button className="flex items-center gap-2 rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#B91C1C]">
                            Deny Upgrade

                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                <X className="h-3 w-3" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}