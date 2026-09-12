import { Plus } from 'lucide-react'

import {
  createEmptyWorkExperienceEntry,
  type ExpertOnboardingFormData,
  type ExpertWorkExperienceEntry,
} from '../utils/expert-onboarding-form'
import { RequiredMark } from '@/shared/components/form/required-mark'

const fieldClass = 'ui-input'

const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship']

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
}

export const ExpertWorkExperienceStep = ({ formData, setFormData }: Props) => {
  const updateEntry = (index: number, patch: Partial<ExpertWorkExperienceEntry>) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry,
      ),
    }))
  }

  const addEntry = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, createEmptyWorkExperienceEntry()],
    }))
  }

  const removeEntry = (index: number) => {
    setFormData((prev) => {
      const remaining = prev.workExperience.filter((_, i) => i !== index)
      return {
        ...prev,
        workExperience: remaining.length > 0 ? remaining : [createEmptyWorkExperienceEntry()],
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Update Experts Experience</h2>
          <p className="text-muted mt-1 text-xs">Work history and experience - What they do</p>
        </div>

        <div className="space-y-8">
          {formData.workExperience.map((entry, index) => (
            <div key={index} className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Work Title {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="inline-flex h-[35px] w-[72px] items-center justify-center rounded-[10px] border border-[#D3191C] bg-[#141414] px-[10px] text-[14px] leading-5 font-semibold tracking-normal text-white"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Job Title <RequiredMark />
                  </label>
                  <input
                    value={entry.jobTitle}
                    onChange={(e) => updateEntry(index, { jobTitle: e.target.value })}
                    placeholder="Enter Title"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Company name <RequiredMark />
                  </label>
                  <input
                    value={entry.companyName}
                    onChange={(e) => updateEntry(index, { companyName: e.target.value })}
                    placeholder="Enter Text"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white">Employment Type</label>
                <select
                  value={entry.employmentType}
                  onChange={(e) => updateEntry(index, { employmentType: e.target.value })}
                  className={`${fieldClass} appearance-none`}
                >
                  <option value="">Enter Text</option>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    From ( Start Date)
                  </label>
                  <input
                    type="date"
                    value={entry.startDate}
                    onChange={(e) => updateEntry(index, { startDate: e.target.value })}
                    className={`${fieldClass} [color-scheme:dark]`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">To( End Date)</label>
                  <input
                    type="date"
                    value={entry.endDate}
                    disabled={entry.currentlyWorking}
                    onChange={(e) => updateEntry(index, { endDate: e.target.value })}
                    className={`${fieldClass} [color-scheme:dark] disabled:opacity-40`}
                  />
                </div>
              </div>

              <label className="flex w-fit items-center gap-2 text-xs text-white">
                <input
                  type="checkbox"
                  checked={entry.currentlyWorking}
                  onChange={(e) =>
                    updateEntry(index, {
                      currentlyWorking: e.target.checked,
                      endDate: e.target.checked ? '' : entry.endDate,
                    })
                  }
                  className="ui-table-checkbox"
                />
                Currently working here
              </label>

              <div>
                <label className="mb-2 block text-xs font-medium text-white">Description</label>
                <textarea
                  value={entry.description}
                  onChange={(e) => updateEntry(index, { description: e.target.value })}
                  placeholder="Short Description"
                  className="ui-textarea h-28"
                />
              </div>

              {index < formData.workExperience.length - 1 && (
                <div className="border-t border-white/5" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={addEntry}
            className="ui-cta ui-cta-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus className="size-3.5" />
            Add More
          </button>
        </div>
      </div>
    </div>
  )
}
