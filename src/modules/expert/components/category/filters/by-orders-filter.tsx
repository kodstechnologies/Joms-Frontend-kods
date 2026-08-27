export function ByOrdersFilter() {
  return (
    <section className="bg-brand-surface-2 space-y-8 rounded-xl border border-white/10 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Orders</h2>

        <button className="text-brand-text text-xl">+</button>
      </div>

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Service Order Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
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

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">
          Delays Beyond SLA (Service Timelines Extended)
        </h3>

        <div className="text-brand-text flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> No
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Payment Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
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

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Payment Method</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
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

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Payout Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
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

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Dispute Status</h3>

        <div className="text-brand-text flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Pending
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Resolved
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Refund Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
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

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">
          Risk based (Service Timelines Extended)
        </h3>

        <div className="text-brand-text flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> SEV1
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> SEV2
          </label>
        </div>
      </div>
    </section>
  )
}
