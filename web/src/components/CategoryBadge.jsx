const CATEGORY_STYLES = {
  Health: "bg-gray-100 text-gray-600",
  Fitness: "bg-teal-50 text-teal-700",
  "Personal Growth": "bg-purple-50 text-purple-700",
};

const DEFAULT_STYLE = "bg-gray-100 text-gray-600";

export function getCategoryColor(category) {
  if (!category) return "gray";
  if (category.toLowerCase().includes("fitness")) return "teal";
  if (category.toLowerCase().includes("personal")) return "purple";
  return "gray";
}

export default function CategoryBadge({ category }) {
  const label = category || "General";
  const style = CATEGORY_STYLES[label] || DEFAULT_STYLE;

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${style}`}>
      {label}
    </span>
  );
}
