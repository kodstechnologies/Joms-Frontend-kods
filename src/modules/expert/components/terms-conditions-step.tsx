import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import type { VenueFormData } from '../utils/venue-form'

type FAQ = {
  question: string
  answer: string
}

interface TermsConditionsStepProps {
  venueData: Pick<VenueFormData, 'terms' | 'cancellationPolicy' | 'refundPercentage' | 'faqs'>
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}

export const TermsConditionsStep = ({ venueData, setVenueData }: TermsConditionsStepProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>(
    venueData.faqs || [
      {
        question: '',
        answer: '',
      },
    ],
  )

  const addFaq = () => {
    const updatedFaqs = [
      ...faqs,
      {
        question: '',
        answer: '',
      },
    ]

    setFaqs(updatedFaqs)

    setVenueData((prev) => ({
      ...prev,
      faqs: updatedFaqs,
    }))
  }

  const removeFaq = (index: number) => {
    const updatedFaqs = faqs.filter((_faq: FAQ, i: number) => i !== index)

    setFaqs(updatedFaqs)

    setVenueData((prev) => ({
      ...prev,
      faqs: updatedFaqs,
    }))
  }

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...faqs]

    updatedFaqs[index][field] = value

    setFaqs(updatedFaqs)

    setVenueData((prev) => ({
      ...prev,
      faqs: updatedFaqs,
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-5">
      <div className="bg-brand-surface rounded-lg border border-white/5 p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-white">Venue Terms</h2>

        <p className="mb-4 text-[11px] text-slate-500">Terms & Condition</p>

        <label className="mb-2 block text-xs text-white">Terms & Condition</label>

        <textarea
          rows={6}
          value={venueData.terms || ''}
          onChange={(e) =>
            setVenueData((prev) => ({
              ...prev,
              terms: e.target.value,
            }))
          }
          placeholder="Enter any instructions for your audience"
          className="w-full rounded-md border border-slate-700 bg-black p-3 text-xs text-white outline-none"
        />

        <div className="mt-6 grid grid-cols-2 gap-8 border-t border-slate-800 pt-5">
          <div>
            <h3 className="mb-1 text-sm font-medium text-white">Cancellation policy</h3>

            <p className="mb-3 text-[10px] text-slate-500">
              Choose how long before the event guests can cancel without any charges.
            </p>

            <div className="flex flex-wrap gap-4">
              {['7days', '48hrs', '24hrs', '12hrs'].map((policy) => (
                <label key={policy} className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="radio"
                    name="cancel"
                    checked={venueData.cancellationPolicy === policy}
                    onChange={() =>
                      setVenueData((prev) => ({
                        ...prev,
                        cancellationPolicy: policy,
                      }))
                    }
                  />

                  {policy === '7days'
                    ? '7 days'
                    : policy === '48hrs'
                      ? '48 hrs'
                      : policy === '24hrs'
                        ? '24 hrs'
                        : '12 hrs'}
                </label>
              ))}
            </div>
          </div>

          <div className="border-l border-slate-800 pl-6">
            <h3 className="mb-1 text-sm font-medium text-white">Refund After Free Window</h3>

            <p className="mb-3 text-[10px] text-slate-500">
              Decide what percentage you'll refund if someone cancels after the free period.
            </p>

            <div className="flex flex-wrap gap-4">
              {['0', '50', '75', '100'].map((percentage) => (
                <label key={percentage} className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="radio"
                    name="refund"
                    checked={venueData.refundPercentage === percentage}
                    onChange={() =>
                      setVenueData((prev) => ({
                        ...prev,
                        refundPercentage: percentage,
                      }))
                    }
                  />
                  {percentage}%
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-surface rounded-lg border border-white/5 p-5 shadow-xl">
        <h3 className="mb-4 text-sm font-semibold text-white">FAQ's</h3>

        {faqs.map((faq: FAQ, index: number) => (
          <div key={index} className="relative mb-5 rounded-lg border border-slate-800 p-4">
            {faqs.length > 1 && (
              <button
                type="button"
                onClick={() => removeFaq(index)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md bg-red-500 text-white"
              >
                <Trash2 size={14} />
              </button>
            )}

            <label className="mb-2 block text-xs text-white">Question</label>

            <input
              value={faq.question}
              onChange={(e) => updateFaq(index, 'question', e.target.value)}
              placeholder="Enter Question"
              className="mb-3 h-10 w-full rounded-md border border-slate-700 bg-black px-3 text-xs text-white outline-none"
            />

            <label className="mb-2 block text-xs text-white">Answer</label>

            <textarea
              rows={2}
              value={faq.answer}
              onChange={(e) => updateFaq(index, 'answer', e.target.value)}
              placeholder="Enter Answer"
              className="w-full rounded-md border border-slate-700 bg-black p-3 text-xs text-white outline-none"
            />
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={addFaq}
            className="bg-brand-accent text-brand-text-dark rounded-md px-3 py-2 text-xs font-medium"
          >
            + Add More
          </button>
        </div>
      </div>
    </div>
  )
}
