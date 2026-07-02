import { useEffect, useState } from "react";
import { useCreateCategory } from "../../hooks/use-categories";
import CategoryHeader from "../../components/category/CategoryHeader";
import CategoryDetailsCard from "../../components/category/CategoryDetailsCard";
import FooterActions from "../../components/category/FooterActions";
import SubCategoryCard from "../../components/category/SubCategoryCard";
import type { SubCategory } from "../../components/category/SubCategoryCard";
import { useNavigate, useParams } from "react-router-dom";
import { useCategories } from "../../hooks/use-categories";
type CategoryFormPageProps = {
    mode: "create" | "rename" | "subcategory";
};

export const CategoryFormPage = ({
    mode,
}: CategoryFormPageProps) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const createCategoryMutation = useCreateCategory();
    const { data } = useCategories({
        page: 1,
        limit: 100,
    });

    const category = data?.data.find(
        (item) => item._id === id
    );

    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");

    const [iconPreview, setIconPreview] = useState<string>();
    const [headerPreview, setHeaderPreview] = useState<string>();

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [headerFile, setHeaderFile] = useState<File | null>(null);

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

            setIconPreview(category.icon3D || undefined);
            setHeaderPreview(category.image || undefined);
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
            createCategoryMutation.mutate(
                {
                    name: categoryName,
                    description,
                    icon3D: iconFile?.name ?? "",
                },
                {
                    onSuccess: () => {
                        navigate("/categories/management");
                    },
                }
            );

            return;
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
