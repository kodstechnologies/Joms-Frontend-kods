export type EscrowDetail = {
  id: string
  escrowInformation: {
    escrowId: string
    transactionId: string
    type: string
    status: 'Active' | 'Released' | 'Dispute'
    createdOn: string
    daysInEscrow: string
  }
  releaseInformation: {
    expectedReleaseDate: string
  }
  parties: {
    client: string
    expert: string
  }
  financialDetails: {
    escrowAmount: string
    platformFee: string
    releaseAmount: string
  }
}

const defaultEscrowDetail: EscrowDetail = {
  id: 'escrow-escrow-01',
  escrowInformation: {
    escrowId: 'ESC-2026-00015',
    transactionId: 'ESC-2026-00015',
    type: 'Fixed Service',
    status: 'Active',
    createdOn: '01/02/2025',
    daysInEscrow: '03 Days',
  },
  releaseInformation: {
    expectedReleaseDate: '2026-01-25',
  },
  parties: {
    client: 'Rajesh Kumar',
    expert: 'Sarah Wilson',
  },
  financialDetails: {
    escrowAmount: '₹50,000',
    platformFee: '-₹5,000',
    releaseAmount: '45,000',
  },
}

export function getEscrowDetailById(id: string): EscrowDetail {
  return { ...defaultEscrowDetail, id }
}
