// A diagonal arrow tucking back into a corner: the "snap back to the
// default corner" glyph shared by the panel settings popovers (Palette,
// Map) and the MovablePanel header reset button, so the reset affordances
// can't drift. `className` is overridable so a host can let it inherit the
// button's currentColor (the header button) instead of the fixed slate.
export function ResetPositionGlyph({
  size = 14,
  className = 'shrink-0 text-slate-500 dark:text-slate-400',
}: {
  size?: number;
  className?: string;
} = {}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden
      fill="none"
      className={className}
    >
      <path
        d="M6.5 3H9v2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 3L5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M3 7v2h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
