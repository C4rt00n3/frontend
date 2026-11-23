import type { ReactNode } from "react";

export type GlyphName =
  | "arrow"
  | "arrowLeft"
  | "branch"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "dots"
  | "edit"
  | "folder"
  | "home"
  | "logout"
  | "menu"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "trash"
  | "user"
  | "alert"
  | "archive";

const glyphs: Record<GlyphName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowLeft: <path d="M19 12H5m5 5-5-5 5-5" />,
  branch: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 5h2a4 4 0 0 1 4 4v5a4 4 0 0 0 4 4m-4-7a4 4 0 0 1 4-4" />
    </>
  ),
  chart: <path d="M4 19V9m5 10V5m5 14v-7m5 7V8M2 19h20" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </>
  ),
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />,
  folder: <path d="M3 6h7l2 2h9v11H3V6Z" />,
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  logout: <path d="M10 4H4v16h6m4-4 4-4-4-4m4 4H8" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.6-.8-1.9 1-1.8-2.1-2.1-1.8 1-1.9-.8-.6-2h-3l-.6 2-1.9.8-1.8-1-2.1 2.1 1 1.8-.8 1.9-2 .6v3l2 .6.8 1.9-1 1.8 2.1 2.1 1.8-1 1.9.8.6 2h3l.6-2 1.9-.8 1.8 1 2.1-2.1-1-1.8.8-1.9 2-.6Z" />
    </>
  ),
  spark: <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />,
  trash: <path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 3.5 19h17L12 3Z" />
      <path d="M12 9v4m0 3h.01" />
    </>
  ),
  archive: <path d="M3 5h18v4H3V5Zm2 4v10h14V9M10 13h4" />,
};

export function Glyph({ name, size = 18 }: { name: GlyphName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs[name]}
    </svg>
  );
}
