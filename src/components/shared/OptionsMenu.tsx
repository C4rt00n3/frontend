import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Glyph, type GlyphName } from "@/components/ui/Glyph";

export interface MenuOption {
  label: string;
  icon: GlyphName;
  onSelect: () => void;
  danger?: boolean;
}

export function OptionsMenu({ options, label = "Opções" }: { options: MenuOption[]; label?: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="product-secondary">
          <Glyph name="dots" /> {label}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu-content" align="end" sideOffset={6}>
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.label}
              className={`menu-item ${option.danger ? "danger" : ""}`}
              onSelect={option.onSelect}
            >
              <Glyph name={option.icon} size={16} /> {option.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
