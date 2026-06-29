// The 3-step wizard header for the template picker (theme -> template ->
// name), plus its StepChip pill. Split out of TemplatePicker.tsx.
export function WizardSteps({
  step,
  onStep,
}: {
  step: 'template' | 'theme';
  onStep: (s: 'template' | 'theme') => void;
}) {
  const onTheme = step === 'theme';
  // A compact, left-aligned stepper. The old version stretched a
  // full-width hairline between the two chips, leaving an awkward expanse
  // of empty rule across the header; this keeps the chips together at the
  // left with a short connector so it reads as a tidy "1 → 2" pair.
  // The active chip's pill has a negative left margin so its text still
  // lines up flush with the title above it.
  return (
    <div className="flex items-center justify-start gap-1.5 -ml-2.5">
      <StepChip
        n={1}
        label="Template"
        state={onTheme ? 'done' : 'active'}
        onClick={() => onStep('template')}
      />
      {/* A mini progress track between the chips: the brand fill grows
          from 0 to full as you advance to step 2, so the connector reads
          as progress rather than a static rule. */}
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out ${
            onTheme ? 'w-full' : 'w-0'
          }`}
        />
      </div>
      <StepChip
        n={2}
        label="Theme"
        state={onTheme ? 'active' : 'upcoming'}
        onClick={() => onStep('theme')}
      />
    </div>
  );
}

function StepChip({
  n,
  label,
  state,
  onClick,
}: {
  n: number;
  label: string;
  state: 'active' | 'done' | 'upcoming';
  onClick?: () => void;
}) {
  const lit = state === 'active' || state === 'done';
  const circle = lit
    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
  const text = lit ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500';
  // The current step sits in a soft brand pill so "you are here" reads at
  // a glance; the other chips stay flush (matching padding keeps the row
  // from shifting as the active step moves).
  const pill =
    state === 'active'
      ? 'rounded-full bg-brand-50 dark:bg-brand-500/15'
      : 'rounded-full bg-transparent';
  const inner = (
    <>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${circle}`}
      >
        {state === 'done' ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2.5 6.2 5 8.5l4.5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          n
        )}
      </span>
      <span className={`text-xs font-medium transition-colors ${text}`}>{label}</span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-2.5 py-1 transition-colors ${pill}`}
    >
      {inner}
    </button>
  ) : (
    <div className={`flex items-center gap-2 px-2.5 py-1 ${pill}`}>{inner}</div>
  );
}
