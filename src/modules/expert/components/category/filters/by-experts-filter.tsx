import { Input } from "@/shared/components/ui/input";

export function ByExpertsFilter() {
  return (
    <section className="space-y-8 pt-10">

      {/* Header */}
      <h2 className="text-sm font-medium text-brand-text">
        By Experts
      </h2>

      {/* Expert Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-text">
          Category
        </label>

        <Input
          placeholder="Search by name"
          className="bg-brand-surface border-white/10"
        />

        {/* Selected Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-brand-text">
            Sarah Johnson ✕
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-brand-text">
            David Kim ✕
          </div>
        </div>
      </div>

      {/* Category Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Category Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Inactive
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Draft
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Deleted
          </label>
        </div>
      </div>

      {/* Service Performance */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Service Performance
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Trending
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Top Performing
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Low Performing
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> No Sales
          </label>
        </div>
      </div>

      {/* Account Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Account Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Suspended
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Under Review
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Deactivated
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Blacklisted
          </label>
        </div>
      </div>

      {/* Verification Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Verification Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Email Verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Phone Verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> KYC Verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Bank Details Verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Fully Verified
          </label>
        </div>
      </div>

      {/* Organisation Type */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Organisation Type
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Individual
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Company
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Agency
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Others
          </label>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Pending Payouts
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> No
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Disputed
          </label>
        </div>
      </div>

      {/* Membership Purchased */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Membership Purchased
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> No
          </label>
        </div>
      </div>

      {/* Membership Type */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Membership Type
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Basic
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Premium
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Standard
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Curators
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Founder's Circle
          </label>
        </div>
      </div>

    </section>
  );
}