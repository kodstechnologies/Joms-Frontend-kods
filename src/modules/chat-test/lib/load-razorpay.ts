type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

export type RazorpaySuccess = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function loadRazorpay(): Promise<RazorpayConstructor> {
  if (window.Razorpay) return window.Razorpay

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-joms-razorpay]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')), {
        once: true,
      })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.jomsRazorpay = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.head.appendChild(script)
  })

  if (!window.Razorpay) throw new Error('Razorpay not available after load')
  return window.Razorpay
}

export async function openRazorpayCheckout(order: {
  keyId: string
  amountPaise: number
  currency?: string
  razorpayOrderId: string
  description?: string
  module?: string
  prefill?: { name?: string; email?: string }
}): Promise<RazorpaySuccess> {
  if (!order.razorpayOrderId || order.razorpayOrderId.startsWith('order_dummy_')) {
    throw new Error(
      'Razorpay did not create a live test order, so the checkout QR cannot open. Retry Real Razorpay QR.',
    )
  }

  const Razorpay = await loadRazorpay()

  return new Promise((resolve, reject) => {
    const rzp = new Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency || 'INR',
      name: 'JOMS',
      description: order.description || `${order.module || 'payment'} payment`,
      order_id: order.razorpayOrderId,
      prefill: order.prefill || {},
      theme: { color: '#EBC38C' },
      handler(response: RazorpaySuccess) {
        resolve(response)
      },
      modal: {
        ondismiss() {
          reject(new Error('Checkout dismissed'))
        },
      },
    })
    rzp.on('payment.failed', (response: unknown) => {
      const err = (response as { error?: { description?: string } })?.error
      reject(new Error(err?.description || 'Payment failed'))
    })
    rzp.open()
  })
}
