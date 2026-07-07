export function ByOrdersFilter() {
  return (
   <section className="rounded-xl border border-white/10 bg-brand-surface-2 p-8 space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-brand-text">
          By Orders
        </h2>

        <button className="text-xl text-brand-text">+</button>
      </div>

      {/* Service Order Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Service Order Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Completed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> In-Progress
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Cancelled
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Refunded
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Disputed
          </label>
        </div>
      </div>

      {/* Delays Beyond SLA */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Delays Beyond SLA (Service Timelines Extended)
        </h3>

        <div className="flex gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> No
          </label>
        </div>
      </div>

      {/* Payment Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Payment Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Paid
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Partially Paid (Milestone)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Unpaid (Milestone)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Refunded
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Disputed
          </label>
        </div>
      </div>

      {/* Payment Method */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Payment Method
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Card
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> UPI/Wallet
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Bank Transfer
          </label>
        </div>
      </div>

      {/* Payout Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Payout Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Pending
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Processed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Failed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Successful
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Disputed
          </label>
        </div>
      </div>

      {/* Dispute Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Dispute Status
        </h3>

        <div className="flex gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Pending
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Resolved
          </label>
        </div>
      </div>

      {/* Refund Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Refund Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Pending
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Processed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Failed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Successful
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Disputed
          </label>
        </div>
      </div>

      {/* Risk */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Risk based (Service Timelines Extended)
        </h3>

        <div className="flex gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> SEV1
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> SEV2
          </label>
        </div>
      </div>
    </section>
  );
}
