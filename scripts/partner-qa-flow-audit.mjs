
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = path.join(__dirname, '..', 'reports')

const AUTH_BASE = process.env.QA_AUTH_BASE || 'http://localhost:8000'
const SERVICE_BASE = process.env.QA_SERVICE_BASE || 'http://localhost:8004'
const VENUE_BASE = process.env.QA_VENUE_BASE || 'http://localhost:8005'
const KYC_BASE = process.env.QA_KYC_BASE || 'http://localhost:8003'
const MEMBERSHIP_BASE = process.env.QA_MEMBERSHIP_BASE || 'http://localhost:8006'
const CHAT_BASE = process.env.QA_CHAT_BASE || 'http://localhost:8009'
const NOTIFICATION_BASE = process.env.QA_NOTIFICATION_BASE || 'http://localhost:8010'
const PROFILE_BASE = process.env.QA_PROFILE_BASE || 'http://localhost:8002'

const TEST_USER_ID = process.env.QA_TEST_USER_ID?.trim() || 'seed-user-001'
const SKIP_DESTRUCTIVE = process.env.QA_SKIP_DESTRUCTIVE === '1'

async function resolveToken() {
  if (process.env.QA_PARTNER_TOKEN) return process.env.QA_PARTNER_TOKEN.trim()

  const phone = process.env.QA_PARTNER_PHONE?.trim()
  const password = process.env.QA_PARTNER_PASSWORD
  if (phone && password) {
    const res = await axios.post(
      `${AUTH_BASE}/auth/loginwithphone`,
      { phone, password },
      { timeout: 30000, validateStatus: () => true },
    )
    const token = res.data?.data?.accessToken
    if (!token) {
      throw new Error(
        `Partner login failed (${res.status}): ${res.data?.message || 'no token'}`,
      )
    }
    return token
  }

  throw new Error('Set QA_PARTNER_TOKEN or QA_PARTNER_PHONE + QA_PARTNER_PASSWORD')
}

function decodePartner(token) {
  try {
    const part = token.split('.')[1]
    if (!part) return { id: '', userType: '', servicetype: '', name: '' }
    const payload = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
    return {
      id: String(payload?.id || payload?._id || ''),
      userType: String(payload?.userType || ''),
      servicetype: String(payload?.servicetype || payload?.serviceType || ''),
      name: String(payload?.name || payload?.fullname || ''),
    }
  } catch {
    return { id: '', userType: '', servicetype: '', name: '' }
  }
}

function client(baseURL, token) {
  return axios.create({
    baseURL,
    timeout: 45000,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  })
}

function pickId(res, keys = ['_id', 'id', 'threadId', 'messageId']) {
  const data = res.data?.data
  if (!data) return ''
  for (const key of keys) {
    if (data[key]) return String(data[key])
  }
  if (Array.isArray(data) && data[0]?._id) return String(data[0]._id)
  return ''
}

function classify(status, expectStatuses = []) {
  const is500 = status >= 500
  if (is500) return 'ERROR'
  if (expectStatuses.includes(status)) return 'Pass'
  if (status >= 200 && status < 400) return 'Pass'
  if ([400, 401, 403, 404].includes(status)) return 'Expected'
  return 'Partial'
}

async function step(results, meta, request) {
  const started = Date.now()
  const { flow, name, c, method, url, data, expectStatuses } = meta
  try {
    const res = await c.request({ method, url, data })
    const status = res.status
    const message = String(res.data?.message || res.data?.error || 'ok').slice(0, 200)
    const bucket = classify(status, expectStatuses)
    const row = {
      flow,
      name,
      method,
      url,
      status,
      message,
      ms: Date.now() - started,
      bucket,
      is500: status >= 500,
    }
    results.push(row)
    if (request?.onResponse) {
      await request.onResponse(res, row)
    }
    return { res, row }
  } catch (err) {
    const row = {
      flow,
      name,
      method,
      url,
      status: 0,
      message: err.message,
      ms: Date.now() - started,
      bucket: 'ERROR',
      is500: true,
    }
    results.push(row)
    return { res: null, row }
  }
}

const AVAILABILITY_BODY = {
  weeklyAvailability: [{ day: 'mon', from: '09:00', to: '17:00' }],
  unavailableDates: [],
}

async function runFlows(ctx) {
  const { token, partnerId, results } = ctx
  const stamp = Date.now()
  const tag = `qa-flow-${stamp}`

  const auth = client(AUTH_BASE, token)
  const svc = client(SERVICE_BASE, token)
  const kyc = client(KYC_BASE, token)
  const chat = client(CHAT_BASE, token)
  const notify = client(NOTIFICATION_BASE, token)
  const profile = client(PROFILE_BASE, token)

  const flowCtx = {}

  const deviceToken = `qa-device-${stamp}`
  await step(results, { flow: 'Notifications', name: 'Update in-app preference', c: notify, method: 'PATCH', url: '/notifications/in-app/preference', data: { inappNotification: true } })
  await step(results, { flow: 'Notifications', name: 'Update alert preference', c: notify, method: 'PATCH', url: '/notifications/alerts/preference', data: { offerPromotions: true } })
  await step(results, { flow: 'Notifications', name: 'Register device token', c: notify, method: 'POST', url: '/notifications/device-tokens', data: { token: deviceToken, platform: 'web' } })
  await step(results, { flow: 'Notifications', name: 'Unregister device token', c: notify, method: 'DELETE', url: '/notifications/device-tokens', data: { token: deviceToken } })

  await step(results, {
    flow: 'Offerings',
    name: 'Create offering',
    c: profile,
    method: 'POST',
    url: '/offerings',
    data: { name: `${tag}-offering` },
  }, {
    onResponse: (res) => {
      flowCtx.offeringId = pickId(res)
    },
  })
  if (flowCtx.offeringId) {
    await step(results, { flow: 'Offerings', name: 'Update offering', c: profile, method: 'PUT', url: `/offerings/${flowCtx.offeringId}`, data: { name: `${tag}-offering-edited` } })
    await step(results, { flow: 'Offerings', name: 'Delete offering', c: profile, method: 'DELETE', url: `/offerings/${flowCtx.offeringId}` })
  }

  await step(results, {
    flow: 'Profile',
    name: 'Add experience',
    c: profile,
    method: 'PATCH',
    url: '/profile/experience',
    data: {
      title: `${tag} Planner`,
      companyName: 'QA Audit Co',
      employmentType: 'Full-time',
      startDate: '2020-01-01',
      currentlyWorking: true,
      description: 'Flow audit entry',
    },
  }, {
    onResponse: async (res) => {
      const experiences = res.data?.data?.experiences || []
      const match = [...experiences].reverse().find((e) => e.title === `${tag} Planner`)
      flowCtx.experienceId = match?._id ? String(match._id) : ''
      if (!flowCtx.experienceId) {
        const me = await profile.get('/profile/me')
        const list = me.data?.data?.experiences || []
        const m2 = [...list].reverse().find((e) => e.title === `${tag} Planner`)
        flowCtx.experienceId = m2?._id ? String(m2._id) : ''
      }
    },
  })
  if (flowCtx.experienceId) {
    await step(results, { flow: 'Profile', name: 'Update experience', c: profile, method: 'PATCH', url: `/profile/experience/${flowCtx.experienceId}`, data: { description: 'Updated by flow audit' } })
    await step(results, { flow: 'Profile', name: 'Remove experience', c: profile, method: 'PATCH', url: `/profile/experience/${flowCtx.experienceId}/remove` })
  }

  await step(results, {
    flow: 'Auth',
    name: 'Update work experience',
    c: auth,
    method: 'PATCH',
    url: `/auth/partners/${partnerId}/work-experience`,
    data: {
      workExperience: [
        {
          jobTitle: `${tag} Role`,
          companyName: 'QA Audit Inc',
          employmentType: 'Contract',
          currentlyWorking: true,
          description: 'Temporary audit row',
        },
      ],
    },
  })

  await step(results, { flow: 'KYC', name: 'Dismiss create-profile prompt', c: kyc, method: 'PATCH', url: '/concierge-banking/concierge/create-profile/dismiss' })

  await step(results, { flow: 'Calendar', name: 'Upsert partner availability', c: svc, method: 'PUT', url: '/calendar/availability', data: AVAILABILITY_BODY })

  await step(results, { flow: 'Consultations', name: 'Create consultation topic', c: svc, method: 'POST', url: '/consultations/topics', data: { name: `${tag}-topic` } })

  let category = null
  const catRes = await svc.get('/categories/public')
  const categories = Array.isArray(catRes.data?.data)
    ? catRes.data.data
    : catRes.data?.data?.categories || []
  if (Array.isArray(categories) && categories.length) {
    const c0 = categories[0]
    category = { id: c0.id || c0._id, name: c0.name }
  }
  if (category?.id) {
    await step(results, {
      flow: 'Services',
      name: 'Create service listing (draft)',
      c: svc,
      method: 'POST',
      url: '/services',
      data: {
        title: `${tag} Wedding Service`,
        category: category.id,
        description: 'QA flow audit draft listing',
      },
    }, {
      onResponse: (res) => {
        flowCtx.serviceId = pickId(res)
      },
    })
    if (flowCtx.serviceId) {
      await step(results, {
        flow: 'Services',
        name: 'Edit service basic info',
        c: svc,
        method: 'PATCH',
        url: `/services/${flowCtx.serviceId}/basic`,
        data: { title: `${tag} Wedding Service (edited)`, description: 'Edited by flow audit' },
      })
      await step(results, {
        flow: 'Services',
        name: 'Close draft service (expect deny)',
        c: svc,
        method: 'PATCH',
        url: `/services/${flowCtx.serviceId}/close`,
        expectStatuses: [400],
      })
      await step(results, {
        flow: 'Services',
        name: 'Delete draft service (expect deny)',
        c: svc,
        method: 'DELETE',
        url: `/services/${flowCtx.serviceId}/delete`,
        expectStatuses: [400],
      })
    }
  } else {
    results.push({
      flow: 'Services',
      name: 'Create service listing (draft)',
      method: 'POST',
      url: '/services',
      status: 0,
      message: 'Skipped — no public categories found',
      ms: 0,
      bucket: 'Partial',
      is500: false,
    })
  }

  await step(results, {
    flow: 'Consultations',
    name: 'Create consultation (preview)',
    c: svc,
    method: 'POST',
    url: '/consultations',
    data: {
      title: `${tag} Consultation`,
      sessionOutline: 'Audit session outline',
      whoItsFor: 'QA testers',
      languages: ['English'],
      mode: 'audio',
      pricingOptions: [{ durationMinutes: 30, pricingType: 'paid', price: 2000 }],
    },
  }, {
    onResponse: (res) => {
      flowCtx.consultationId = pickId(res)
    },
  })
  if (flowCtx.consultationId) {
    await step(results, {
      flow: 'Consultations',
      name: 'Edit consultation draft',
      c: svc,
      method: 'PATCH',
      url: `/consultations/${flowCtx.consultationId}`,
      data: { sessionOutline: 'Updated audit session outline' },
    })
    await step(results, {
      flow: 'Consultations',
      name: 'Set consultation availability',
      c: svc,
      method: 'POST',
      url: `/consultations/${flowCtx.consultationId}/availability`,
      data: AVAILABILITY_BODY,
    })
    await step(results, {
      flow: 'Consultations',
      name: 'Delete consultation availability',
      c: svc,
      method: 'DELETE',
      url: `/consultations/${flowCtx.consultationId}/availability`,
    })
    await step(results, {
      flow: 'Consultations',
      name: 'Close preview consultation (expect deny)',
      c: svc,
      method: 'PATCH',
      url: `/consultations/${flowCtx.consultationId}/close`,
      expectStatuses: [400],
    })
    await step(results, {
      flow: 'Consultations',
      name: 'Delete preview consultation (expect deny)',
      c: svc,
      method: 'DELETE',
      url: `/consultations/${flowCtx.consultationId}`,
      expectStatuses: [400],
    })
  }

  const myConsults = await svc.get('/consultations/my-consultations?limit=5')
  const liveConsult = (myConsults.data?.data?.data || myConsults.data?.data || []).find(
    (c) => String(c.status).toLowerCase() === 'live',
  )
  if (liveConsult?._id || liveConsult?.id) {
    const liveId = liveConsult._id || liveConsult.id
    await step(results, {
      flow: 'Consultations',
      name: 'Edit live consultation',
      c: svc,
      method: 'PATCH',
      url: `/consultations/${liveId}/edit`,
      data: { sessionOutline: liveConsult.sessionOutline || 'Live consult outline' },
    })
  }

  await step(results, {
    flow: 'Chat',
    name: 'Create or open chat thread',
    c: chat,
    method: 'POST',
    url: '/chat/threads',
    data: { userId: TEST_USER_ID, username: 'Seed User' },
  }, {
    onResponse: (res) => {
      flowCtx.threadId = res.data?.data?.threadId || pickId(res, ['threadId', '_id', 'id'])
    },
  })
  if (flowCtx.threadId) {
    const clientMessageId = `qa${stamp}msg001`
    await step(results, {
      flow: 'Chat',
      name: 'Send chat message',
      c: chat,
      method: 'POST',
      url: `/chat/threads/${flowCtx.threadId}/messages`,
      data: { clientMessageId, text: `${tag} hello`, messageType: 'text' },
    }, {
      onResponse: (res) => {
        flowCtx.messageId = pickId(res, ['_id', 'id', 'messageId'])
      },
    })
    if (flowCtx.messageId) {
      await step(results, {
        flow: 'Chat',
        name: 'Edit chat message',
        c: chat,
        method: 'PATCH',
        url: `/chat/threads/${flowCtx.threadId}/messages/${flowCtx.messageId}`,
        data: { text: `${tag} hello (edited)` },
      })
      await step(results, {
        flow: 'Chat',
        name: 'Delete chat message',
        c: chat,
        method: 'DELETE',
        url: `/chat/threads/${flowCtx.threadId}/messages/${flowCtx.messageId}`,
      })
    }
    await step(results, { flow: 'Chat', name: 'Mark thread read', c: chat, method: 'PATCH', url: `/chat/threads/${flowCtx.threadId}/read` })
    await step(results, { flow: 'Chat', name: 'Pin thread', c: chat, method: 'PATCH', url: `/chat/threads/${flowCtx.threadId}/pin`, data: { isPinned: true } })
    await step(results, { flow: 'Chat', name: 'Unpin thread', c: chat, method: 'PATCH', url: `/chat/threads/${flowCtx.threadId}/pin`, data: { isPinned: false } })
    await step(results, { flow: 'Chat', name: 'Mute thread', c: chat, method: 'PATCH', url: `/chat/threads/${flowCtx.threadId}/mute`, data: { isMuted: true } })
    await step(results, { flow: 'Chat', name: 'Unmute thread', c: chat, method: 'PATCH', url: `/chat/threads/${flowCtx.threadId}/mute`, data: { isMuted: false } })
  }

  if (ctx.serviceType === 'venue') {
    const venue = client(VENUE_BASE, token)
    await step(results, { flow: 'Venues', name: 'Dismiss venue create-profile', c: kyc, method: 'PATCH', url: '/venue-kyc/create-profile/dismiss' })
    await step(results, {
      flow: 'Venues',
      name: 'Update venue profile basic',
      c: venue,
      method: 'PATCH',
      url: '/venues/profile/basic',
      data: { bio: `${tag} venue bio update` },
    })
  }

  if (!SKIP_DESTRUCTIVE) {
    const myServices = await svc.get('/services/my-services?limit=10')
    const liveService = (myServices.data?.data?.data || myServices.data?.data || []).find(
      (s) => String(s.status).toLowerCase() === 'live' && String(s.title || '').startsWith('qa-flow-'),
    )
    if (liveService?._id) {
      await step(results, { flow: 'Services', name: 'Close QA live service', c: svc, method: 'PATCH', url: `/services/${liveService._id}/close` })
      await step(results, { flow: 'Services', name: 'Delete closed QA service', c: svc, method: 'DELETE', url: `/services/${liveService._id}/delete` })
    }
  }

  return flowCtx
}

function printReport(partner, results) {
  const errors = results.filter((r) => r.is500)
  const passes = results.filter((r) => r.bucket === 'Pass')
  const expected = results.filter((r) => r.bucket === 'Expected')
  const partial = results.filter((r) => r.bucket === 'Partial')

  console.log('\n=== Partner CRUD Flow Audit ===')
  console.log(`Partner: ${partner.name || partner.id} (${partner.userType || '?'})`)
  console.log(`Service type: ${partner.servicetype || 'unknown'}`)
  console.log(`Steps: ${results.length} | Pass: ${passes.length} | Expected: ${expected.length} | Partial: ${partial.length} | 500 errors: ${errors.length}`)

  const byFlow = new Map()
  for (const row of results) {
    if (!byFlow.has(row.flow)) byFlow.set(row.flow, [])
    byFlow.get(row.flow).push(row)
  }

  for (const [flow, rows] of byFlow) {
    console.log(`\n--- ${flow} ---`)
    for (const row of rows) {
      const flag = row.is500 ? ' ERROR ' : row.bucket.padEnd(8)
      console.log(`${flag} ${row.name} — ${row.method} ${row.url} → ${row.status} ${row.message}`)
    }
  }

  if (errors.length) {
    console.log('\n=== Internal Server Errors (500+) ===')
    for (const e of errors) {
      console.log(`[${e.flow}] ${e.method} ${e.url} → ${e.status} ${e.message}`)
    }
  }

  return { errors, passes, expected, partial }
}

async function main() {
  const token = await resolveToken()
  const partner = decodePartner(token)
  const partnerId = process.env.QA_PARTNER_ID?.trim() || partner.id
  if (!partnerId) throw new Error('Could not decode partner id from token')

  let serviceType = partner.servicetype
  if (!serviceType) {
    const auth = client(AUTH_BASE, token)
    const prof = await auth.get(`/auth/partners/${partnerId}`)
    serviceType = prof.data?.data?.servicetype || prof.data?.data?.basicProfile?.serviceType || ''
  }

  const results = []
  await runFlows({ token, partnerId, serviceType, results })
  const summary = printReport({ ...partner, servicetype: serviceType }, results)

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = path.join(REPORT_DIR, `partner-qa-flow-audit-${stamp}.json`)
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        partner: { ...partner, id: partnerId, servicetype: serviceType },
        summary: {
          total: results.length,
          pass: summary.passes.length,
          expected: summary.expected.length,
          partial: summary.partial.length,
          errors500: summary.errors.length,
        },
        results,
      },
      null,
      2,
    ),
  )
  console.log(`\nJSON report: ${reportPath}`)
  process.exit(summary.errors.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
