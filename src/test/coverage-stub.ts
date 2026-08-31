const ARRAY_METHODS = new Set([
  'map',
  'filter',
  'forEach',
  'slice',
  'find',
  'some',
  'every',
  'includes',
  'join',
  'concat',
  'reduce',
  'flatMap',
  'flat',
  'at',
  'findIndex',
  'indexOf',
])

const PAGINATION = { page: 1, limit: 10, total: 3, pages: 1 }
const MAX_DEPTH = 3

const LIST_KEYS =
  /^(items|rows|list|data|results|options|columns|categories|subcategories|amenities|documents|images|files|permissions|tags|spaces|services|bookings|reviews|metrics|cards|tabs|reasons|servicecategory|selectedreasons)$/i

function leafItem(label: string, index: number) {
  const id = `id-${index + 1}`
  const name = `${label}-${index}`
  const item: Record<string, unknown> = {
    id,
    _id: id,
    key: id,
    name,
    fullname: name,
    title: name,
    label: name,
    status: 'approved',
    approvalStatus: 'approved',
    kycStatus: 'approved',
    email: 'admin@example.com',
    phone: '9999999999',
    amount: 1,
    price: 1,
    count: 1,
    page: 1,
    rating: 4,
    nps: 50,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    type: 'Coverage',
    description: 'Coverage',
    message: 'Coverage',
    url: 'https://example.com',
    value: '1',
    serviceCategory: ['Coverage'],
    tags: ['tag-a'],
    subCategories: [{ id: `sub-${index}`, name: `Sub-${index}` }],
    categories: ['Coverage'],
    items: [],
    documents: [],
    amenities: [],
    spaces: [],
    services: [],
    permissions: ['settings.view'],
    basicProfile: {
      fullname: name,
      industry: 'Coverage',
      location: 'Coverage',
      serviceCategory: ['Coverage'],
      coverImage: '',
      profileImage: '',
    },
  }
  item.toString = () => name
  item.valueOf = () => name
  return item
}

export function createCoverageStub(label = 'coverage', depth = 0): unknown {
  const cache = new Map<PropertyKey, unknown>()
  const items = [leafItem(label, 0), leafItem(label, 1), leafItem(label, 2)]

  return new Proxy(items, {
    get(obj, prop, receiver) {
      if (prop === 'then') return undefined
      if (prop === Symbol.toPrimitive) return () => label
      if (prop === Symbol.iterator) return obj[Symbol.iterator].bind(obj)
      if (prop === 'toJSON') return () => ({ id: 'id-1', name: label })
      if (typeof prop === 'symbol') return Reflect.get(obj, prop, receiver)

      if (prop === 'length') return items.length

      if (typeof prop === 'string' && /^\d+$/.test(prop)) {
        return items[Number(prop)]
      }

      if (ARRAY_METHODS.has(String(prop))) {
        const method = Reflect.get(obj, prop, receiver)
        if (typeof method === 'function') {
          return (method as (...a: unknown[]) => unknown).bind(items)
        }
        return method
      }

      if (cache.has(prop)) return cache.get(prop)

      const key = String(prop)
      const lower = key.toLowerCase()
      let value: unknown

      if (LIST_KEYS.test(key) || /category|categories|tags|reasons/i.test(key)) {
        value =
          key.toLowerCase().includes('category') || key === 'tags' || key === 'reasons'
            ? ['Coverage', 'Coverage-2']
            : [leafItem(key, 0), leafItem(key, 1)]
      } else if (key === 'basicProfile' || key === 'profile') {
        value = leafItem('profile', 0).basicProfile
      } else if (key === 'pagination' || key === 'meta') {
        value = { ...PAGINATION, pagination: { ...PAGINATION } }
      } else if (key === 'id' || key === '_id' || /id$/i.test(key)) {
        value = 'id-1'
      } else if (key === 'email') value = 'admin@example.com'
      else if (key === 'phone' || key === 'phoneNumber') value = '9999999999'
      else if (/account|iban|ifsc|masked|beneficiary/.test(lower)) {
        value = '123456789012'
      } else if (
        /(full)?name$/.test(lower) ||
        /(title|username|label|status|message|description|summary|url|slug|code|phone)$/.test(
          lower,
        ) ||
        /^(type|servicetype|experttype|employmenttype|pricingtype|usertype)$/.test(lower)
      ) {
        value =
          key === 'status' || key === 'approvalStatus' || key === 'kycStatus'
            ? 'approved'
            : 'Coverage'
      } else if (key.startsWith('is') || key.startsWith('has') || key.startsWith('can'))
        value = true
      else if (
        /^(page|pages|limit|price|amount|rating|nps)$/i.test(key) ||
        /count$/i.test(key) ||
        /^total[a-z]/i.test(key)
      ) {
        value = 1
      } else if (key.endsWith('At') || /date/i.test(key)) value = '2026-01-01T00:00:00.000Z'
      else if (key === 'split') value = (...args: [string | RegExp]) => 'Coverage'.split(...args)
      else if (key === 'trim') value = () => 'Coverage'
      else if (key === 'toLowerCase') value = () => label.toLowerCase()
      else if (key === 'toUpperCase') value = () => label.toUpperCase()
      else if (key === 'startsWith') value = (prefix: string) => label.startsWith(prefix)
      else if (key === 'endsWith') value = (suffix: string) => label.endsWith(suffix)
      else if (key === 'charAt') value = (index: number) => label.charAt(index)
      else if (key === 'substring')
        value = (start: number, end?: number) => label.substring(start, end)
      else if (key === 'padStart')
        value = (maxLength: number, fillString?: string) => label.padStart(maxLength, fillString)
      else if (key === 'match') value = (re: string | RegExp) => label.match(re)
      else if (key === 'replace')
        value = (search: string | RegExp, replacement: string) => label.replace(search, replacement)
      else if (key === 'toFixed') value = (digits?: number) => Number(1).toFixed(digits)
      else if (key === 'toLocaleString') value = () => '1'
      else if (key === 'toISOString') value = () => '2026-01-01T00:00:00.000Z'
      else if (depth >= MAX_DEPTH) value = 'Coverage'
      else value = createCoverageStub(key, depth + 1)

      cache.set(prop, value)
      return value
    },
  })
}

export function coverageAxiosBody() {
  return {
    success: true,
    message: 'ok',
    data: createCoverageStub('data'),
    meta: { ...PAGINATION, pagination: { ...PAGINATION } },
    pagination: { ...PAGINATION },
  }
}

export function coverageAxiosResponse() {
  return {
    data: coverageAxiosBody(),
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }
}

export const coverageAdminUser = {
  id: '1',
  email: 'admin@example.com',
  fullname: 'Admin',
  kind: 'superadmin' as const,
  isSuperAdmin: true,
  permissions: [] as string[],
}

export function coverageComponentProps(): Record<string, unknown> {
  const stub = leafItem('prop', 0)
  const noop = () => undefined
  const subscription = {
    id: 'sub-1',
    membershipPlanId: 'plan-1',
    planName: 'Coverage Plan',
    status: 'active',
    billingCycleName: 'monthly',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    amount: 1000,
    currency: 'INR',
    partnerId: 'id-1',
    partnerName: 'Coverage Partner',
  }
  return {
    open: true,
    isOpen: true,
    visible: true,
    onClose: noop,
    onOpenChange: noop,
    onSubmit: noop,
    onChange: noop,
    onClick: noop,
    onCancel: noop,
    onConfirm: noop,
    onPartnerChange: noop,
    onUpgrade: noop,
    onDowngrade: noop,
    onExtend: noop,
    children: 'child',
    title: 'Title',
    label: 'Label',
    name: 'name',
    value: '',
    id: 'id-1',
    type: 'text',
    action: 'upgrade',
    subscription,
    plan: subscription,
    membership: subscription,
    placeholder: 'Enter value',
    model: {
      id: 'revenue',
      number: 1,
      title: 'Revenue',
      route: '/finance/revenue',
      startsAs: ['user'],
      summary: 'summary',
      steps: ['step'],
      panels: ['none'],
      verifyHints: ['hint'],
    },
    partner: stub,
    user: stub,
    ticket: stub,
    item: stub,
    row: stub,
    data: stub,
    columns: [{ key: 'name', header: 'Name' }],
    items: [leafItem('item', 0), leafItem('item', 1)],
    options: [{ label: 'A', value: 'a' }],
  }
}
