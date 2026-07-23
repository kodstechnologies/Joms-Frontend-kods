import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

export function EscalationHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[32px] font-semibold text-white">All Escalation</h1>

        <p className="mt-1 text-sm text-[#8A8A8A]">
          Track revenue, payouts, and financial performance
        </p>
      </div>

      <Button className="ui-manage-metrics bg-[#F0C27B] text-black hover:bg-[#f4cc91]">
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Manage Metrics
      </Button>
    </div>
  )
}
