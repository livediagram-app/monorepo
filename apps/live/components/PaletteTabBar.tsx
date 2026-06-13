import { useEffect, useRef, useState } from 'react';

export type PaletteTab = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

// Replaces the old stack of Tools / Devices / Icons accordions with a
// single icon tab bar: clicking a tab expands its panel below, clicking
// the active tab again collapses it, and clicking another switches. One
// activeId makes the tabs mutually exclusive by construction, so the
// palette stays compact however many categories we add — a new category
// is just another entry in the `tabs` array the caller passes.
export function PaletteTabBar({
  tabs,
  defaultOpenId = null,
}: {
  tabs: PaletteTab[];
  // Tab to expand on first render. `null` (the default) opens the
  // palette with every panel collapsed; pass an id to have that
  // category open by default (Shapes, the most common entry point).
  defaultOpenId?: string | null;
}) {
  // Committed tab — changed ONLY by click (no hover preview). Clicking the
  // open tab collapses it; clicking another switches. One active tab at a
  // time keeps the categories mutually exclusive.
  const [activeId, setActiveId] = useState<string | null>(defaultOpenId);
  // Kept so the panel's content stays mounted through the collapse
  // animation: `activeId` drops to null the instant the user closes a tab
  // (driving the height -> 0 transition), while `displayedId` holds the
  // last shown tab so its content doesn't blank out mid-animation.
  const [displayedId, setDisplayedId] = useState<string | null>(defaultOpenId);
  useEffect(() => {
    if (activeId) setDisplayedId(activeId);
  }, [activeId]);
  const select = (id: string) => setActiveId((cur) => (cur === id ? null : id));
  const displayed = tabs.find((t) => t.id === (activeId ?? displayedId)) ?? null;

  // Soft category-change animation. The panel's height is driven off the
  // measured content height and eased, so switching from a short
  // category (Tools) to a tall one (Icons) glides instead of snapping;
  // the content itself fades in (keyed below). `animate` gates the
  // transition on until after the first measured frame so the
  // default-open panel doesn't animate itself open on page load.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="border-t border-slate-100 dark:border-slate-800">
      {/* Categories stretch edge-to-edge: no side padding, no rounded
          container border, and no separator below (the panel that expands
          underneath provides its own visual break). */}
      <div className="py-1">
        <div
          className="flex items-stretch divide-x divide-slate-200 dark:divide-slate-700"
          role="tablist"
          aria-label="Palette categories"
        >
          {tabs.map((tab) => {
            // Highlight the active (clicked) tab so the lit icon matches
            // the panel below.
            const isShown = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeId}
                aria-label={tab.label}
                onClick={() => select(tab.id)}
                className={
                  isShown
                    ? 'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 bg-brand-500 text-white transition'
                    : 'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white'
                }
              >
                {tab.icon}
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        className={`overflow-hidden${animate ? ' transition-[height] duration-200 ease-out' : ''}`}
        style={{ height: activeId ? (height ?? undefined) : 0 }}
      >
        <div ref={contentRef} className="px-3 pb-3 pt-3">
          <div key={displayed?.id ?? 'empty'} className="animate-fade-in">
            {displayed?.content}
          </div>
        </div>
      </div>
    </div>
  );
}
