import { useEffect, useState } from "react";
import { useCategoryStore } from "../../store/category-store";
import CategoryHeader from "../../components/category/CategoryHeader";
import CategoryDetailsCard from "../../components/category/CategoryDetailsCard";
import FooterActions from "../../components/category/FooterActions";
import SubCategoryCard from "../../components/category/SubCategoryCard";
import type { SubCategory } from "../../components/category/SubCategoryCard";
import { useNavigate, useParams } from "react-router-dom";

type CategoryFormPageProps = {
    mode: "create" | "rename" | "subcategory";
};

export const CategoryFormPage = ({
    mode,
}: CategoryFormPageProps) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const createCategory = useCategoryStore(
        (state) => state.createCategory
    );

    const updateCategory = useCategoryStore(
        (state) => state.updateCategory
    );

    const categories = useCategoryStore(
        (state) => state.categories
    );

    const category = categories.find(
        (item) => item.id === id
    );

    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");

    const [iconPreview, setIconPreview] = useState<string>();
    const [headerPreview, setHeaderPreview] = useState<string>();

    const [, setIconFile] = useState<File | null>(null);
    const [, setHeaderFile] = useState<File | null>(null);

    const [subCategories, setSubCategories] = useState<SubCategory[]>([
        {
            id: Date.now(),
            name: "",
            description: "",
            icon: "",
        },
    ]);

    useEffect(() => {
        if (!category) return;

        if (mode === "rename") {
            setCategoryName(category.name);
        }

        if (mode === "subcategory") {
            setCategoryName(category.name);
            setDescription(category.description);

            setIconPreview(category.icon);
            setHeaderPreview(category.image);
        }
    }, [mode, category]);

    const handleCategoryIcon = (file: File | null) => {
        if (!file) return;

        setIconFile(file);
        setIconPreview(URL.createObjectURL(file));
    };

    const handleHeaderImage = (file: File | null) => {
        if (!file) return;

        setHeaderFile(file);
        setHeaderPreview(URL.createObjectURL(file));
    };

    const handleAddSubCategory = () => {
        setSubCategories((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: "",
                description: "",
                icon: "",
            },
        ]);
    };

    const handleRemoveSubCategory = (id: number) => {
        setSubCategories((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    const handleNameChange = (
        id: number,
        value: string
    ) => {
        setSubCategories((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, name: value }
                    : item
            )
        );
    };

    const handleDescriptionChange = (
        id: number,
        value: string
    ) => {
        setSubCategories((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, description: value }
                    : item
            )
        );
    };

    const handleSubCategoryIcon = (
        id: number,
        file: File | null
    ) => {
        setSubCategories((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;

                if (!file) {
                    return {
                        ...item,
                        icon: "",
                    };
                }

                return {
                    ...item,
                    icon: URL.createObjectURL(file),
                };
            })
        );
    };

    const handleSubmit = () => {
        if (mode === "create") {
            createCategory({
                id: `CAT${Date.now()}`,
                name: categoryName,
                description,
                icon: iconPreview,
                image: headerPreview,

                status: "Accepted",

                subCategory: subCategories.length,

                services: 0,
                experts: 0,
                revenue: "₹0",

                createdAt: new Date().toLocaleDateString("en-GB"),
                updatedAt: new Date().toLocaleDateString("en-GB"),
                createdBy: "Super Admin",
                adminNotes: "",

                subCategories: subCategories.map((item, index) => ({
                    id: `SUB${Date.now()}${index}`,
                    name: item.name,
                    description: item.description,
                    status: "Active",
                    icon: item.icon,
                    addedOn: new Date().toLocaleDateString("en-GB"),
                    createdBy: "Super Admin",
                    updatedAt: new Date().toLocaleDateString("en-GB"),
                    adminNotes: "",
                    services: 0,
                    experts: 0,
                })),
            });
        } else if (category) {
            updateCategory({
                ...category,
                name: categoryName,
            });
        }

        navigate("/categories/management");
    };

    return (
        <div className="min-h-screen bg-[#0B0B0B] px-8 pb-8 pt-2">
            <div className="mx-auto max-w-7xl">
                <CategoryHeader
                    title={
                        mode === "create"
                            ? "Create New Category"
                            : mode === "rename"
                                ? "Rename Category"
                                : "Create New Sub-Category"
                    }
                    breadcrumb={
                        mode === "create"
                            ? "Create New Category"
                            : mode === "rename"
                                ? "Rename Category"
                                : "Create New Sub-Category"

                    }
                />

                <div className="mt-6 space-y-6">
                    <CategoryDetailsCard
                        readOnly={mode === "subcategory"}
                        categoryName={categoryName}
                        description={description}
                        iconPreview={iconPreview}
                        imagePreview={headerPreview}
                        onCategoryNameChange={(e) =>
                            setCategoryName(e.target.value)
                        }
                        onDescriptionChange={(e) =>
                            setDescription(e.target.value)
                        }
                        onIconChange={handleCategoryIcon}
                        onImageChange={handleHeaderImage}
                    />

                    <SubCategoryCard
                        subCategories={subCategories}
                        onAdd={handleAddSubCategory}
                        onRemove={handleRemoveSubCategory}
                        onNameChange={handleNameChange}
                        onDescriptionChange={
                            handleDescriptionChange
                        }
                        onIconChange={handleSubCategoryIcon}
                    />

                    <FooterActions
                        onSubmit={handleSubmit}
                        submitText={
                            mode === "create"
                                ? "Create Category"
                                : mode === "rename"
                                    ? "Rename Category"
                                    : "Create Sub-Category"
                        }
                    />
                </div>
            </div>
        </div>
    );
};
