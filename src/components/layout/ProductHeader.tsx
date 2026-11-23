import { useNavigate } from "react-router";
import { Glyph } from "@/components/ui/Glyph";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMetaValue } from "@/contexts/PageMetaContext";
import { initials } from "@/utils/format";

export function ProductHeader({ openMenu }: { openMenu: () => void }) {
  const { eyebrow, title } = usePageMetaValue();
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="product-header">
      <button className="mobile-menu" onClick={openMenu} aria-label="Abrir navegação">
        <Glyph name="menu" />
      </button>
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <button className="header-avatar" onClick={() => navigate("/app/settings")} aria-label="Minha conta">
          {initials(user?.name)}
        </button>
      </div>
    </header>
  );
}
