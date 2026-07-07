export type PolicyStatus = 'Active' | 'Draft' | 'Archived'

export type PolicyItem = {
  id: string
  title: string
  status: PolicyStatus
  version: string
  effectiveDate: string
  lastUpdated: string
}

export type PolicyVersion = {
  id: string
  policyId: string
  version: string
  status: PolicyStatus
  effectiveDate: string
  lastUpdated: string
  author: string
  changeSummary: string
  content: string
}

export const policyItemsMock: PolicyItem[] = [
  {
    id: 'terms',
    title: 'Terms & Condition',
    status: 'Active',
    version: 'V2.2',
    effectiveDate: '01/01/2025',
    lastUpdated: '01/01/2025',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    status: 'Active',
    version: 'V2.2',
    effectiveDate: '01/01/2025',
    lastUpdated: '01/01/2025',
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    status: 'Active',
    version: 'V2.2',
    effectiveDate: '01/01/2025',
    lastUpdated: '01/01/2025',
  },
  {
    id: 'nda',
    title: 'Non Disclosure Agreement',
    status: 'Active',
    version: 'V2.2',
    effectiveDate: '01/01/2025',
    lastUpdated: '01/01/2025',
  },
]

export const policyVersionsMock: PolicyVersion[] = [
  {
    id: 'terms-v3',
    policyId: 'terms',
    version: 'V1.3',
    status: 'Active',
    effectiveDate: '01/01/2026',
    lastUpdated: '01/01/2026',
    author: 'John Doe (Super Admin)',
    changeSummary:
      'Added GDPR compliance clauses, updated data retention policy from 12 months to 24 months, and clarified third-party data sharing rules.',
    content:
      'This agreement governs the use of JOMS platform services between users and experts. By accessing the platform, you agree to comply with all applicable policies and community guidelines.',
  },
  {
    id: 'terms-v2',
    policyId: 'terms',
    version: 'V1.2',
    status: 'Archived',
    effectiveDate: '01/06/2025',
    lastUpdated: '01/06/2025',
    author: 'John Doe (Super Admin)',
    changeSummary: 'Updated dispute resolution process and refund eligibility criteria.',
    content: 'Previous version of terms and conditions.',
  },
  {
    id: 'terms-v1',
    policyId: 'terms',
    version: 'V1.1',
    status: 'Archived',
    effectiveDate: '01/01/2025',
    lastUpdated: '01/01/2025',
    author: 'John Doe (Super Admin)',
    changeSummary: 'Initial published version of platform terms.',
    content: 'Initial terms and conditions content.',
  },
]

export function getPolicyById(id: string) {
  return policyItemsMock.find((item) => item.id === id) ?? policyItemsMock[0]
}

export function getPolicyVersions(policyId: string) {
  return policyVersionsMock.filter((item) => item.policyId === policyId)
}

export function getPolicyVersionById(id: string) {
  return policyVersionsMock.find((item) => item.id === id) ?? policyVersionsMock[0]
}
