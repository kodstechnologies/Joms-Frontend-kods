import type { Category } from "../components/category/category-table-columns";
import { CATEGORY_VIEW_LOREM } from "../components/category/category-view.theme";

const technologySubCategories = [
  {
    id: "SUB001",
    name: "UI/UX",
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
    id: "SUB002",
    name: "UI/UX",
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
    id: "SUB003",
    name: "UI/UX",
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
    id: "SUB001",
    name: "Wedding",
    status: "Active" as const,
    description: "Professional wedding photography services.",
    adminNotes: "Approved after document verification.",
    icon: "",
    addedOn: "15 Jan 2025",
    createdBy: "Super Admin",
    updatedAt: "20 Jan 2025",
    services: 25,
    experts: 18,
  },
  {
    id: "SUB002",
    name: "Fashion",
    status: "Paused" as const,
    description: "Professional fashion photography.",
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
    description: "Professional photography services",
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
    adminNotes: "Category approved after reviewing all uploaded details.",
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
  createPausedCategory("CATP01", "Photography", "Accepted"),
  createPausedCategory("CATP02", "Makeup Artists", "Pending", 58, 58),
  createPausedCategory("CATP03", "Videography", "Deleted", 89, 89),
  createPausedCategory("CATP04", "Photography", "Accepted"),
  createPausedCategory("CATP05", "Makeup Artists", "Pending", 58, 58),
  createPausedCategory("CATP06", "Videography", "Deleted", 89, 89),
  createPausedCategory("CATP07", "Photography", "Accepted"),
  createPausedCategory("CATP08", "Makeup Artists", "Pending", 58, 58),
  createPausedCategory("CATP09", "Videography", "Deleted", 89, 89),
  createPausedCategory("CATP10", "Photography", "Accepted"),
  createPausedCategory("CATP11", "Makeup Artists", "Pending", 58, 58),
  createPausedCategory("CATP12", "Videography", "Deleted", 89, 89),
  createPausedCategory("CATP13", "Photography", "Accepted"),
  createPausedCategory("CATP14", "Makeup Artists", "Pending", 58, 58),
  createPausedCategory("CATP15", "Videography", "Deleted", 89, 89),
  createPausedCategory("CATP16", "Photography", "Accepted"),
  createPausedCategory("CATP17", "Makeup Artists", "Pending", 58, 58),
  createPausedCategory("CATP18", "Videography", "Deleted", 89, 89),
  createPausedCategory("CATP19", "Photography", "Accepted"),
  createPausedCategory("CATP20", "Makeup Artists", "Pending", 58, 58),
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
  createDeletedCategory("CATD01", "Photography", "Accepted"),
  createDeletedCategory("CATD02", "Makeup Artists", "Pending", 58, 58),
  createDeletedCategory("CATD03", "Videography", "Deleted", 89, 89),
  createDeletedCategory("CATD04", "Photography", "Accepted"),
  createDeletedCategory("CATD05", "Makeup Artists", "Pending", 58, 58),
  createDeletedCategory("CATD06", "Videography", "Deleted", 89, 89),
  createDeletedCategory("CATD07", "Photography", "Accepted"),
  createDeletedCategory("CATD08", "Makeup Artists", "Pending", 58, 58),
  createDeletedCategory("CATD09", "Videography", "Deleted", 89, 89),
  createDeletedCategory("CATD10", "Photography", "Accepted"),
  createDeletedCategory("CATD11", "Makeup Artists", "Pending", 58, 58),
  createDeletedCategory("CATD12", "Videography", "Deleted", 89, 89),
  createDeletedCategory("CATD13", "Photography", "Accepted"),
  createDeletedCategory("CATD14", "Makeup Artists", "Pending", 58, 58),
  createDeletedCategory("CATD15", "Videography", "Deleted", 89, 89),
  createDeletedCategory("CATD16", "Photography", "Accepted"),
  createDeletedCategory("CATD17", "Makeup Artists", "Pending", 58, 58),
  createDeletedCategory("CATD18", "Videography", "Deleted", 89, 89),
  createDeletedCategory("CATD19", "Photography", "Accepted"),
  createDeletedCategory("CATD20", "Makeup Artists", "Pending", 58, 58),
];

export const categoryManagementSeed: Category[] = [
  {
    ...createCategory("CAT001", "Technology", "Accepted", 125, 125),
    description: CATEGORY_VIEW_LOREM,
    adminNotes: CATEGORY_VIEW_LOREM,
    createdAt: "January 15 2025",
    updatedAt: "January 15 2025",
    subCategories: technologySubCategories,
  },
  createCategory("CAT002", "Makeup Artists", "Accepted", 58, 58),
  createCategory("CAT003", "Photography", "Pending", 89, 89),
  createCategory("CAT004", "Photography", "Deleted", 10, 10),
  createCategory("CAT005", "Photography", "Accepted"),
  createCategory("CAT006", "Makeup Artists", "Accepted", 58, 58),
  createCategory("CAT007", "Photography", "Pending", 89, 89),
  createCategory("CAT008", "Photography", "Deleted", 10, 10),
  createCategory("CAT009", "Photography", "Accepted"),
  createCategory("CAT010", "Makeup Artists", "Accepted", 58, 58),
  createCategory("CAT011", "Photography", "Pending", 89, 89),
  createCategory("CAT012", "Photography", "Deleted", 10, 10),
  createCategory("CAT013", "Photography", "Accepted"),
  createCategory("CAT014", "Makeup Artists", "Accepted", 58, 58),
  createCategory("CAT015", "Photography", "Pending", 89, 89),
  createCategory("CAT016", "Photography", "Deleted", 10, 10),
  createCategory("CAT017", "Photography", "Accepted"),
  createCategory("CAT018", "Makeup Artists", "Accepted", 58, 58),
  createCategory("CAT019", "Photography", "Pending", 89, 89),
  createCategory("CAT020", "Photography", "Deleted", 10, 10),
  ...pausedCategorySeed,
  ...deletedCategorySeed,
];
