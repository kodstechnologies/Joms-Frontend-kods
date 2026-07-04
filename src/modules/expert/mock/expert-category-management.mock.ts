import type { Category } from "../components/category/category-table-columns";
import { CATEGORY_VIEW_LOREM } from "../components/category/category-view.theme";

const legalSubCategories = [
  {
    id: "ESUB001",
    name: "Corporate Law",
    status: "Active" as const,
    description: CATEGORY_VIEW_LOREM,
    adminNotes: CATEGORY_VIEW_LOREM,
    icon: "",
    addedOn: "Jan 15",
    createdBy: "Super Admin",
    updatedAt: "January 15 2025",
    services: 125,
    experts: 125,
  },
  {
    id: "ESUB002",
    name: "Family Law",
    status: "Paused" as const,
    description: CATEGORY_VIEW_LOREM,
    adminNotes: CATEGORY_VIEW_LOREM,
    icon: "",
    addedOn: "Jan 15",
    createdBy: "Super Admin",
    updatedAt: "January 15 2025",
    services: 125,
    experts: 125,
  },
  {
    id: "ESUB003",
    name: "Criminal Law",
    status: "Active" as const,
    description: CATEGORY_VIEW_LOREM,
    adminNotes: CATEGORY_VIEW_LOREM,
    icon: "",
    addedOn: "Jan 15",
    createdBy: "Super Admin",
    updatedAt: "January 15 2025",
    services: 125,
    experts: 125,
  },
];

const subCategoryTemplate = [
  {
    id: "ESUB001",
    name: "Consultation",
    status: "Active" as const,
    description: "Expert legal consultation services.",
    adminNotes: "Approved after credential verification.",
    icon: "",
    addedOn: "15 Jan 2025",
    createdBy: "Super Admin",
    updatedAt: "20 Jan 2025",
    services: 25,
    experts: 18,
  },
  {
    id: "ESUB002",
    name: "Advisory",
    status: "Paused" as const,
    description: "Professional legal advisory services.",
    adminNotes: "Temporarily paused by admin.",
    icon: "",
    addedOn: "18 Jan 2025",
    createdBy: "Super Admin",
    updatedAt: "22 Jan 2025",
    services: 10,
    experts: 8,
  },
];

function createCategory(
  id: string,
  name: string,
  status: string,
  services = 42,
  experts = 42,
): Category {
  return {
    id,
    name,
    description: "Expert profession category",
    icon: "",
    image: "",
    status,
    subCategory: 5,
    services,
    experts,
    revenue: "₹3,45,000",
    createdAt: "15 Jan 2025",
    updatedAt: "20 Jan 2025",
    createdBy: "Super Admin",
    adminNotes: "Category approved after reviewing expert credentials.",
    subCategories: subCategoryTemplate,
  };
}

function createPausedCategory(
  id: string,
  name: string,
  previousStatus: string,
  services = 42,
  experts = 42,
): Category {
  return {
    ...createCategory(id, name, "Paused", services, experts),
    previousStatus,
  };
}

const pausedCategorySeed: Category[] = [
  createPausedCategory("ECATP01", "Legal", "Accepted"),
  createPausedCategory("ECATP02", "Medical", "Pending", 58, 58),
  createPausedCategory("ECATP03", "Finance", "Deleted", 89, 89),
  createPausedCategory("ECATP04", "Legal", "Accepted"),
  createPausedCategory("ECATP05", "Medical", "Pending", 58, 58),
  createPausedCategory("ECATP06", "Finance", "Deleted", 89, 89),
  createPausedCategory("ECATP07", "Legal", "Accepted"),
  createPausedCategory("ECATP08", "Medical", "Pending", 58, 58),
  createPausedCategory("ECATP09", "Finance", "Deleted", 89, 89),
  createPausedCategory("ECATP10", "Legal", "Accepted"),
  createPausedCategory("ECATP11", "Medical", "Pending", 58, 58),
  createPausedCategory("ECATP12", "Finance", "Deleted", 89, 89),
  createPausedCategory("ECATP13", "Legal", "Accepted"),
  createPausedCategory("ECATP14", "Medical", "Pending", 58, 58),
  createPausedCategory("ECATP15", "Finance", "Deleted", 89, 89),
  createPausedCategory("ECATP16", "Legal", "Accepted"),
  createPausedCategory("ECATP17", "Medical", "Pending", 58, 58),
  createPausedCategory("ECATP18", "Finance", "Deleted", 89, 89),
  createPausedCategory("ECATP19", "Legal", "Accepted"),
  createPausedCategory("ECATP20", "Medical", "Pending", 58, 58),
];

function createDeletedCategory(
  id: string,
  name: string,
  previousStatus: string,
  services = 42,
  experts = 42,
): Category {
  return {
    ...createCategory(id, name, "Deleted", services, experts),
    previousStatus,
  };
}

const deletedCategorySeed: Category[] = [
  createDeletedCategory("ECATD01", "Legal", "Accepted"),
  createDeletedCategory("ECATD02", "Medical", "Pending", 58, 58),
  createDeletedCategory("ECATD03", "Finance", "Deleted", 89, 89),
  createDeletedCategory("ECATD04", "Legal", "Accepted"),
  createDeletedCategory("ECATD05", "Medical", "Pending", 58, 58),
  createDeletedCategory("ECATD06", "Finance", "Deleted", 89, 89),
  createDeletedCategory("ECATD07", "Legal", "Accepted"),
  createDeletedCategory("ECATD08", "Medical", "Pending", 58, 58),
  createDeletedCategory("ECATD09", "Finance", "Deleted", 89, 89),
  createDeletedCategory("ECATD10", "Legal", "Accepted"),
  createDeletedCategory("ECATD11", "Medical", "Pending", 58, 58),
  createDeletedCategory("ECATD12", "Finance", "Deleted", 89, 89),
  createDeletedCategory("ECATD13", "Legal", "Accepted"),
  createDeletedCategory("ECATD14", "Medical", "Pending", 58, 58),
  createDeletedCategory("ECATD15", "Finance", "Deleted", 89, 89),
  createDeletedCategory("ECATD16", "Legal", "Accepted"),
  createDeletedCategory("ECATD17", "Medical", "Pending", 58, 58),
  createDeletedCategory("ECATD18", "Finance", "Deleted", 89, 89),
  createDeletedCategory("ECATD19", "Legal", "Accepted"),
  createDeletedCategory("ECATD20", "Medical", "Pending", 58, 58),
];

export const expertCategoryManagementSeed: Category[] = [
  {
    ...createCategory("ECAT001", "Legal", "Accepted", 125, 125),
    description: CATEGORY_VIEW_LOREM,
    adminNotes: CATEGORY_VIEW_LOREM,
    createdAt: "January 15 2025",
    updatedAt: "January 15 2025",
    subCategories: legalSubCategories,
  },
  createCategory("ECAT002", "Medical", "Accepted", 58, 58),
  createCategory("ECAT003", "Finance", "Pending", 89, 89),
  createCategory("ECAT004", "Coaching", "Deleted", 10, 10),
  createCategory("ECAT005", "Legal", "Accepted"),
  createCategory("ECAT006", "Medical", "Accepted", 58, 58),
  createCategory("ECAT007", "Finance", "Pending", 89, 89),
  createCategory("ECAT008", "Coaching", "Deleted", 10, 10),
  createCategory("ECAT009", "Legal", "Accepted"),
  createCategory("ECAT010", "Medical", "Accepted", 58, 58),
  createCategory("ECAT011", "Finance", "Pending", 89, 89),
  createCategory("ECAT012", "Coaching", "Deleted", 10, 10),
  createCategory("ECAT013", "Legal", "Accepted"),
  createCategory("ECAT014", "Medical", "Accepted", 58, 58),
  createCategory("ECAT015", "Finance", "Pending", 89, 89),
  createCategory("ECAT016", "Coaching", "Deleted", 10, 10),
  createCategory("ECAT017", "Legal", "Accepted"),
  createCategory("ECAT018", "Medical", "Accepted", 58, 58),
  createCategory("ECAT019", "Finance", "Pending", 89, 89),
  createCategory("ECAT020", "Coaching", "Deleted", 10, 10),
  ...pausedCategorySeed,
  ...deletedCategorySeed,
];
