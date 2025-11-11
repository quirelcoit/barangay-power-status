import clsx from "clsx";

interface StatusBadgeProps {
  status:
    | "no_power"
    | "partial"
    | "energized"
    | "new"
    | "triaged"
    | "in_progress"
    | "resolved"
    | "rejected";
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const styles = {
    no_power: "bg-danger-100 text-danger-800",
    partial: "bg-yellow-100 text-yellow-800",
    energized: "bg-power-100 text-power-800",
    new: "bg-blue-100 text-blue-800",
    triaged: "bg-purple-100 text-purple-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-power-100 text-power-800",
    rejected: "bg-gray-100 text-gray-800",
  };

  const labels = {
    no_power: "⚠️ NO POWER",
    partial: "⚡ PARTIAL",
    energized: "✓ ENERGIZED",
    new: "NEW",
    triaged: "TRIAGED",
    in_progress: "IN PROGRESS",
    resolved: "RESOLVED",
    rejected: "REJECTED",
  };

  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <span
      className={clsx(
        "inline-block rounded-full font-semibold",
        sizeClass,
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
