export type Communication = {
  id: string;
  title: string;
  channel: "Email" | "Push";
  type: "Transactional" | "Marketing";
  audience: string;
  status: "Draft" | "Scheduled" | "Sent" | "Failed";
  createdBy: string;
  createdAt: string;
};

export const communicationData: Communication[] = [
  {
    id: "CM001",
    title: "Order Confirmation",
    channel: "Email",
    type: "Transactional",
    audience: "Users",
    status: "Sent",
    createdBy: "System",
    createdAt: "12 Jul 2026",
  },
  {
    id: "CM002",
    title: "Festival Offer",
    channel: "Push",
    type: "Marketing",
    audience: "Experts",
    status: "Scheduled",
    createdBy: "Admin",
    createdAt: "13 Jul 2026",
  },
  {
    id: "CM003",
    title: "Password Reset",
    channel: "Email",
    type: "Transactional",
    audience: "Users",
    status: "Draft",
    createdBy: "Admin",
    createdAt: "14 Jul 2026",
  },
];