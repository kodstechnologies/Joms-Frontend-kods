import {
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CommunicationDetails() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}

      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-2 text-sm text-white hover:text-[#F0C27B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Communication Management
        </button>

        <p className="text-sm text-slate-400">
          Communication Management /
          <span className="ml-1 font-medium text-white">
            View Communication
          </span>
        </p>
      </div>

      {/* Main Card */}

      <div className="rounded-2xl border border-[#242424] bg-[#171717] p-8">

        {/* Top */}

        <div className="flex items-start justify-between border-b border-[#2A2A2A] pb-6">

          <div>

            <h2 className="text-2xl font-semibold text-white">
              Order Confirmation (Copy)
            </h2>

            <div className="mt-4 flex items-center gap-8 text-sm text-slate-400">

              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                System Auto
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Not Scheduled
              </div>

            </div>

          </div>

          <span className="rounded-full bg-emerald-600/20 px-5 py-2 text-sm font-semibold text-emerald-400">
            Sent
          </span>

        </div>

        {/* Information */}

        <div className="mt-6 rounded-xl bg-black px-8 py-6">

          <div className="grid grid-cols-3 gap-8">

            <div>
              <p className="text-xs text-slate-400">Type</p>
              <p className="mt-2 text-sm font-medium text-white">
                Email
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Audience</p>
              <p className="mt-2 text-sm font-medium text-white">
                User
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Channel</p>
              <p className="mt-2 text-sm font-medium text-white">
                Transaction
              </p>
            </div>

          </div>

        </div>

        {/* Message */}

        <div className="mt-8">

          <h3 className="mb-3 text-sm font-semibold text-white">
            Message Content
          </h3>

          <div className="rounded-xl bg-black px-5 py-4">

            <p className="text-sm leading-6 text-white">
              Thank you for your order! Your order #45678 has been
              confirmed and is being processed.
            </p>

          </div>

        </div>

        <div className="my-8 border-t border-[#2A2A2A]" />

        {/* Delivery Analytics */}

        <h3 className="mb-5 text-sm font-semibold text-white">
          Delivery Analytics
        </h3>

        <div className="grid grid-cols-4 gap-5">

          {[
            { label: "Sent", value: "20" },
            { label: "Delivered", value: "18" },
            { label: "Opened", value: "15" },
            { label: "Clicked", value: "8" },
            { label: "Failed", value: "2" },
            { label: "Bounced", value: "1" },
          ].map((item) => (

            <div
              key={item.label}
              className="rounded-xl border border-[#242424] bg-black p-5"
            >

              <p className="text-xs text-slate-400">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {item.value}
              </p>

              <div className="mt-4 flex items-center gap-2">

                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                  ↑ 6.7%
                </span>

                <span className="text-xs text-slate-500">
                  vs last month
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Footer */}

      <div className="rounded-xl border border-[#242424] bg-[#171717] px-5 py-4">

        <div className="flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="h-10 rounded-lg border border-[#444] px-6 text-sm text-white transition hover:border-[#F0C27B]"
          >
            Close
          </button>

          <button
            onClick={() => navigate("/communication/create")}
            className="h-10 rounded-lg bg-[#F0C27B] px-6 text-sm font-semibold text-black transition hover:bg-[#E5B968]"
          >
            Edit Communication
          </button>

        </div>

      </div>

    </div>
  );
}