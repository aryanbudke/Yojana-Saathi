import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
export function CategoryChip({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="secondary"
      className="category-chip"
      aria-pressed={selected}
      onClick={onClick}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
