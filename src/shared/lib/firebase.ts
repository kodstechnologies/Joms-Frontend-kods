import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging'
import { env } from '@/config/env'

let firebaseApp: FirebaseApp | null = null
let messagingInstance: Messaging | null = null

const isFirebaseConfigured = () =>
  Boolean(
    env.firebaseApiKey &&
    env.firebaseProjectId &&
    env.firebaseMessagingSenderId &&
    env.firebaseAppId,
  )

export const initializeFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null

  if (getApps().length > 0) {
    firebaseApp = getApps()[0]
    return firebaseApp
  }

  firebaseApp = initializeApp({
    apiKey: env.firebaseApiKey,
    authDomain: env.firebaseAuthDomain,
    projectId: env.firebaseProjectId,
    messagingSenderId: env.firebaseMessagingSenderId,
    appId: env.firebaseAppId,
  })

  return firebaseApp
}

const getMessagingInstance = (): Messaging | null => {
  if (messagingInstance) return messagingInstance

  const app = initializeFirebaseApp()
  if (!app) return null

  try {
    messagingInstance = getMessaging(app)
    return messagingInstance
  } catch {
    return null
  }
}

export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!('Notification' in window)) return null
  if (!('serviceWorker' in navigator)) return null

  const messaging = getMessagingInstance()
  if (!messaging) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

  await navigator.serviceWorker.ready

  if (registration.active) {
    registration.active.postMessage({
      type: 'FIREBASE_CONFIG',
      config: {
        apiKey: env.firebaseApiKey,
        authDomain: env.firebaseAuthDomain,
        projectId: env.firebaseProjectId,
        messagingSenderId: env.firebaseMessagingSenderId,
        appId: env.firebaseAppId,
      },
    })
  }

  const token = await getToken(messaging, {
    vapidKey: env.firebaseMessagingSenderId,
    serviceWorkerRegistration: registration,
  })

  return token || null
}

export const onForegroundMessage = (
  callback: (payload: {
    notification?: { title?: string; body?: string }
    data?: Record<string, string>
  }) => void,
): (() => void) => {
  const messaging = getMessagingInstance()
  if (!messaging) return () => {}

  return onMessage(messaging, (payload: MessagePayload) => {
    callback({
      notification: payload.notification as { title?: string; body?: string } | undefined,
      data: payload.data as Record<string, string> | undefined,
    })
  })
}
