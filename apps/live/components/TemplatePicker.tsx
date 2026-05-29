import { useState } from 'react';
import type { Participant } from '@/lib/identity';
import { initialsOf } from '@/lib/identity';
import type { TemplateKind } from '@/lib/templates';
import { TEMPLATES } from '@/lib/templates';

type TemplatePickerProps = {
  // The user's current identity. Their name is editable inside the picker;
  // a colour was assigned at participant creation (random from the curated
  // palette) and is shown but not editable here.
  participant: Participant;
  onPick: (kind: TemplateKind, name: string) => void;
};

// The "Start a new diagram" modal — now also the welcome screen. Lets the
// user adjust their display name (pre-filled with a generated one) and
// pick a template, all in one step. Dismissed once a template is chosen.
export function TemplatePicker({ participant, onPick }: TemplatePickerProps) {
  const [name, setName] = useState(participant.name);
  const trimmedName = name.trim();
  const effectiveName = trimmedName || participant.name;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
    >
      <div className="pointer-events-auto w-[34rem] max-w-[90%] animate-fly-up-in rounded-xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <h2 className="text-lg font-semibold text-slate-900">Welcome to livediagram</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us your name and pick a template to start with.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <div
            role="img"
            aria-label={`Your avatar colour: ${participant.color}`}
            style={{ backgroundColor: participant.color }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          >
            {initialsOf(effectiveName)}
          </div>
          <div className="flex-1">
            <label
              htmlFor="welcome-name"
              className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Your name
            </label>
            <input
              id="welcome-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={participant.name}
              className="mt-0.5 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Pick a template
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.kind}
              type="button"
              onClick={() => onPick(t.kind, effectiveName)}
              className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="flex h-16 w-full items-center justify-center rounded-md bg-slate-50">
                <TemplatePreview kind={t.kind} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ kind }: { kind: TemplateKind }) {
  switch (kind) {
    case 'blank':
      return (
        <svg width="60" height="40" viewBox="0 0 60 40" aria-hidden>
          <rect
            x="6"
            y="4"
            width="48"
            height="32"
            rx="3"
            fill="none"
            stroke="rgb(148 163 184)"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'mindmap':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" aria-hidden>
          <circle
            cx="40"
            cy="25"
            r="9"
            fill="rgb(186 230 253)"
            stroke="rgb(14 165 233)"
            strokeWidth="1.25"
          />
          <circle cx="14" cy="25" r="5" fill="none" stroke="rgb(14 165 233)" strokeWidth="1.25" />
          <circle cx="66" cy="25" r="5" fill="none" stroke="rgb(14 165 233)" strokeWidth="1.25" />
          <circle cx="40" cy="6" r="5" fill="none" stroke="rgb(14 165 233)" strokeWidth="1.25" />
          <circle cx="40" cy="44" r="5" fill="none" stroke="rgb(14 165 233)" strokeWidth="1.25" />
          <line x1="31" y1="25" x2="19" y2="25" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="49" y1="25" x2="61" y2="25" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="40" y1="16" x2="40" y2="11" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="40" y1="34" x2="40" y2="39" stroke="rgb(100 116 139)" strokeWidth="1" />
        </svg>
      );
    case 'orgchart':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" aria-hidden>
          <rect
            x="32"
            y="4"
            width="16"
            height="9"
            rx="1.5"
            fill="rgb(186 230 253)"
            stroke="rgb(14 165 233)"
            strokeWidth="1"
          />
          <rect
            x="10"
            y="32"
            width="16"
            height="9"
            rx="1.5"
            fill="none"
            stroke="rgb(14 165 233)"
            strokeWidth="1"
          />
          <rect
            x="32"
            y="32"
            width="16"
            height="9"
            rx="1.5"
            fill="none"
            stroke="rgb(14 165 233)"
            strokeWidth="1"
          />
          <rect
            x="54"
            y="32"
            width="16"
            height="9"
            rx="1.5"
            fill="none"
            stroke="rgb(14 165 233)"
            strokeWidth="1"
          />
          <line x1="40" y1="13" x2="40" y2="22" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="18" y1="22" x2="62" y2="22" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="18" y1="22" x2="18" y2="32" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="40" y1="22" x2="40" y2="32" stroke="rgb(100 116 139)" strokeWidth="1" />
          <line x1="62" y1="22" x2="62" y2="32" stroke="rgb(100 116 139)" strokeWidth="1" />
        </svg>
      );
    case 'retrospective':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50" aria-hidden>
          {[8, 32, 56].map((x) => (
            <g key={x}>
              <line
                x1={x + 8}
                y1="6"
                x2={x + 8}
                y2="11"
                stroke="rgb(100 116 139)"
                strokeWidth="1"
              />
              <rect
                x={x}
                y="14"
                width="16"
                height="10"
                rx="1"
                fill="rgb(254 243 199)"
                stroke="rgb(253 224 71)"
                strokeWidth="0.75"
              />
              <rect
                x={x}
                y="26"
                width="16"
                height="10"
                rx="1"
                fill="rgb(254 243 199)"
                stroke="rgb(253 224 71)"
                strokeWidth="0.75"
              />
              <rect
                x={x}
                y="38"
                width="16"
                height="8"
                rx="1"
                fill="rgb(254 243 199)"
                stroke="rgb(253 224 71)"
                strokeWidth="0.75"
              />
            </g>
          ))}
        </svg>
      );
  }
}
