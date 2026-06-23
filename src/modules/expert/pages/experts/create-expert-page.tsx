import { useNavigate } from 'react-router-dom'
import { Search, Upload, X } from 'lucide-react'

import {
  CreateListingWizard,
  type CreateListingWizardStep,
} from '../../components/create-listing-wizard'

import { Button } from '@/shared/components/ui/button'

const steps: CreateListingWizardStep[] = [
  {
    id: '01',
    title: 'Basic Profile',
    description: 'Core Information',
  },
  {
    id: '02',
    title: 'Identity Verification',
    description: 'Government ID',
  },
  {
    id: '03',
    title: 'Work Experience',
    description: 'Work History',
  },
  {
    id: '04',
    title: 'Gallery',
    description: 'Work Images',
  },
  {
    id: '05',
    title: 'Final Review',
    description: 'Preview',
  },
]

export const CreateExpertPage = () => {
  const navigate = useNavigate()

  return (
    <CreateListingWizard
      title="Expert Profile Creation"
      breadcrumbs={[
        { label: 'Expert Management' },
        { label: 'Manage Experts' },
        { label: 'Create Account', isActive: true },
      ]}
      steps={steps}
      currentStep={1}
      onBack={() => navigate('/experts/management')}
      secondaryAction={{
        label: 'Save as Draft',
      }}
      primaryAction={{
        label: 'Save & Continue',
      }}
    >
      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">
            Basic Profile Setup
          </h2>

          <p className="mt-1 text-xs text-[#777777]">
            Core identity details and profile media
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-5">
            <div className="relative">
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-[#444] bg-black">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 size-5 text-[#777]" />
                  <p className="text-xs text-[#777]">
                    Upload Cover Image
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-8 left-6 size-16 rounded-full border-4 border-[#151515] bg-slate-500" />
            </div>

            <div className="pt-10">
              <label className="mb-2 block text-xs font-medium text-white">
                Full Name *
              </label>

              <input
                placeholder="Full Name"
                className="h-10 w-full rounded-md bg-black px-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Location
              </label>

              <input
                placeholder="Enter Location"
                className="h-10 w-full rounded-md bg-black px-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Bio
              </label>

              <textarea
                placeholder="Write a short bio"
                className="h-32 w-full rounded-md bg-black p-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Sample Work Link
              </label>

              <div className="flex gap-2">
                <input
                  placeholder="Enter Link"
                  className="h-10 flex-1 rounded-md bg-black px-3 text-sm text-white outline-none"
                />

                <Button className="bg-[#FBC078] text-black hover:bg-[#eeb46a]">
                  Verify Link
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Upload Sample Work File
              </label>

              <button
                type="button"
                className="rounded-md border border-dashed border-[#444] px-8 py-3 text-xs text-[#999]"
              >
                Upload here
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Industry
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-[#777]" />

                <input
                  placeholder="Search industry"
                  className="h-10 w-full rounded-md bg-black pl-10 pr-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Years Of Experience
              </label>

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Enter Years"
                  className="h-10 rounded-md bg-black px-3 text-sm text-white"
                />

                <input
                  placeholder="Enter Month"
                  className="h-10 rounded-md bg-black px-3 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Type
              </label>

              <input
                value="Concierge"
                readOnly
                className="h-10 w-full rounded-md bg-black px-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Category
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-[#777]" />

                <input
                  placeholder="Search"
                  className="h-10 w-full rounded-md bg-black pl-10 pr-3 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Offerings
              </label>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-3 size-4 text-[#777]" />

                <input
                  placeholder="Search"
                  className="h-10 w-full rounded-md bg-black pl-10 pr-3 text-sm text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md bg-black px-3 py-2 text-xs">
                  Personal Style Curation
                  <X className="size-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between rounded-md bg-black px-3 py-2 text-xs">
                  Wardrobe Edit & Refresh
                  <X className="size-4 cursor-pointer" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold text-white">
                Verification
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Phone Number *
                  </label>

                  <div className="flex gap-2">
                    <input
                      placeholder="Enter phone number"
                      className="h-10 flex-1 rounded-md bg-black px-3 text-sm text-white"
                    />

                    <Button className="bg-[#FBC078] text-black">
                      Verify
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Email ID *
                  </label>

                  <div className="flex gap-2">
                    <input
                      placeholder="Enter Email ID"
                      className="h-10 flex-1 rounded-md bg-black px-3 text-sm text-white"
                    />

                    <Button className="bg-[#FBC078] text-black">
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CreateListingWizard>
  )
}