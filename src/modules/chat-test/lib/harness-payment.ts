import {
  createPaymentOrder,
  verifyPaymentOrder,
  type PaymentOrder,
  type PaymentOrderStatus,
} from '../api/finance-test-payment.api'
import { openRazorpayCheckout } from './load-razorpay'

/** Official Razorpay checkout + verify (same flow as /dev/payment-finance-testing). */
export async function fulfillRazorpayPayment(
  token: string,
  order: PaymentOrder,
): Promise<PaymentOrderStatus> {
  if (!order.razorpayOrderId || order.razorpayOrderId.startsWith('order_dummy_')) {
    throw new Error('Razorpay did not create a live order. Check payment-service keys and retry.')
  }
  const rzp = await openRazorpayCheckout(order)
  return verifyPaymentOrder(token, {
    orderId: order.orderId,
    razorpayOrderId: rzp.razorpay_order_id,
    razorpayPaymentId: rzp.razorpay_payment_id,
    razorpaySignature: rzp.razorpay_signature,
  })
}

export async function payServiceOrderWithRazorpay(token: string, serviceOrderId: string) {
  const payOrder = await createPaymentOrder(token, {
    module: 'service',
    moduleData: { kind: 'service_order', serviceOrderId },
    requireLiveGateway: true,
  })
  return fulfillRazorpayPayment(token, payOrder)
}

export async function payConsultationBookingWithRazorpay(token: string, bookingId: string) {
  const payOrder = await createPaymentOrder(token, {
    module: 'consultation',
    moduleData: { kind: 'consultation_booking', bookingId },
    requireLiveGateway: true,
  })
  return fulfillRazorpayPayment(token, payOrder)
}

export async function payPaymentRequestWithRazorpay(token: string, paymentRequestId: string) {
  const payOrder = await createPaymentOrder(token, {
    module: 'service',
    moduleData: { kind: 'payment_request', paymentRequestId },
    requireLiveGateway: true,
  })
  return fulfillRazorpayPayment(token, payOrder)
}
