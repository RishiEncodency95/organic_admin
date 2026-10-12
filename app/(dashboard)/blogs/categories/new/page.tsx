import ManageBlogCategoriesView from "@/components/blogs/ManageBlogCategoriesView";

// Categories are added from a popup on the Manage Categories page; this address opens it directly
export default function NewBlogCategoryPage() {
  return <ManageBlogCategoriesView startAdding />;
}
