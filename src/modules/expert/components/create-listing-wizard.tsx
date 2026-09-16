import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import {
  PageBreadcrumb,
  type PageBreadcrumbItem,
} from '@/shared/components/navigation/page-breadcrumb'
import { cn } from '@/shared/lib/cn'

export type CreateListingWizardStep = {
  id: string
  title: string
  description: string
}

export type CreateListingBreadcrumb = PageBreadcrumbItem

type WizardAction = {
  label: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

type CreateListingWizardProps = {
  title: string
  breadcrumbs: CreateListingBreadcrumb[]
  steps: CreateListingWizardStep[]
  currentStep: number
  onBack: () => void
  children: ReactNode
  secondaryAction?: WizardAction
  primaryAction: WizardAction
  className?: string
}

export function CreateListingWizard({
  title,
  breadcrumbs,
  steps,
  currentStep,
  onBack,
  children,
  secondaryAction,
  primaryAction,
  className,
}: CreateListingWizardProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1240px] flex-col gap-7 px-4 pb-8 text-white',
        className,
      )}
    >
      <div className="flex flex-col gap-4 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="group hover:text-brand-accent flex w-fit items-center gap-2 text-white transition-colors"
        >
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <h1 className="text-h3 font-bold tracking-tight">{title}</h1>
        </button>

        <div className="pl-7">
          <PageBreadcrumb items={breadcrumbs} />
        </div>
      </div>

      <div className="bg-brand-surface relative w-full overflow-hidden rounded-lg border border-white/5 px-5 py-7 shadow-xl md:px-10">
        <div className="relative mx-auto flex w-full items-start">
          {steps.map((step, index) => {
            const stepNum = index + 1
            const isActive = stepNum === currentStep
            const isCompleted = stepNum < currentStep

            return (
              <div key={step.id} className="relative flex flex-1 flex-col items-center gap-3">
                {index < steps.length - 1 && (
                  <div className="absolute top-[25px] left-[calc(50%+25px)] z-0 h-px w-[calc(100%-50px)] bg-[#D8D8D8]" />
                )}
                <div
                  className={cn(
                    'relative z-10 flex size-[50px] items-center justify-center rounded-full text-[16px] leading-5 font-semibold tracking-normal transition-all duration-300',
                    isActive
                      ? 'bg-brand-accent text-black shadow-[0_0_20px_rgba(255,200,73,0.15)]'
                      : isCompleted
                        ? 'bg-[#0A5D29] text-[16px] leading-5 font-semibold tracking-normal text-[#FFFFFF]'
                        : 'border border-[#080808] bg-black text-white',
                  )}
                >
                  {step.id}
                </div>
                <div className="hidden text-center sm:block">
                  <p className="text-body-sm font-bold tracking-tight text-white transition-colors">
                    {step.title}
                  </p>
                  <p className="text-body-sm text-muted font-medium whitespace-nowrap">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1130px]">{children}</div>

      <div className="bg-brand-surface mx-auto flex w-full max-w-[1140px] items-center justify-between rounded-lg border border-white/5 p-4 shadow-lg">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="ui-cta ui-cta-outline h-8 px-4 py-0"
        >
          Previous
        </Button>
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button
              type="button"
              variant="secondary"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              className={cn(
                'ui-cta ui-cta-outline text-muted h-8 px-4 py-0',
                secondaryAction.className,
              )}
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className={cn('ui-cta ui-cta-primary h-8 px-5 py-0', primaryAction.className)}
          >
            {primaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  )
}
