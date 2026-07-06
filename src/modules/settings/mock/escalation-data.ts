export type Escalation = {
  escalationId: string;
  roleId: string;
  roleName: string;
  escalationType: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Review" | "Resolved";
  createdOn: string;
};

export const escalationData: Escalation[] = [
  {
    escalationId: "ESC-1001",
    roleId: "ROL-5001",
    roleName: "Alex Jhon",
    escalationType: "Refund Delay",
    priority: "High",
    status: "Open",
    createdOn: "10 Jul 2026",
  },
  {
    escalationId: "ESC-1002",
    roleId: "ROL-5002",
    roleName: "Emma Watson",
    escalationType: "Membership Upgrade",
    priority: "Medium",
    status: "In Review",
    createdOn: "09 Jul 2026",
  },
  {
    escalationId: "ESC-1003",
    roleId: "ROL-5003",
    roleName: "David Miller",
    escalationType: "Refund Delay",
    priority: "Low",
    status: "Resolved",
    createdOn: "08 Jul 2026",
  },
  {
    escalationId: "ESC-1004",
    roleId: "ROL-5004",
    roleName: "Sophia Brown",
    escalationType: "Membership Upgrade",
    priority: "High",
    status: "Open",
    createdOn: "07 Jul 2026",
  },
  {
    escalationId: "ESC-1005",
    roleId: "ROL-5005",
    roleName: "Daniel Thomas",
    escalationType: "Membership Upgrade",
    priority: "Critical",
    status: "Resolved",
    createdOn: "06 Jul 2026",
  },
];