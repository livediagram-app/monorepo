import { describe, expect, it } from 'vitest';
import { LEGAL_LAST_UPDATED, LEGAL_LAST_UPDATED_DISPLAY } from './legal-revisions';

// `LEGAL_LAST_UPDATED` (Date) drives the sitemap's `lastModified`
// for /terms + /privacy. `LEGAL_LAST_UPDATED_DISPLAY` (string) is
// what the visible "Last updated <date>" line on each legal page
// renders. They're derived from the same ISO string in
// legal-revisions.ts, so a bump on the ISO source must keep both
// in lockstep. The tests below pin the wire format on the display
// string so a future "let me just use .toISOString()" or "let me
// drop the explicit en-GB options" simplification can't silently
// reformat the visible legal date to ISO or to American date
// order, neither of which match the rest of the marketing site's
// en-GB locale (see app/layout.tsx, inLanguage: 'en-GB').

describe('LEGAL_LAST_UPDATED', () => {
  it('is a valid Date instance', () => {
    expect(LEGAL_LAST_UPDATED).toBeInstanceOf(Date);
    expect(Number.isNaN(LEGAL_LAST_UPDATED.getTime())).toBe(false);
  });
});

describe('LEGAL_LAST_UPDATED_DISPLAY', () => {
  it('emits en-GB long-form day-month-year, e.g. "31 May 2026" (no comma, full month name)', () => {
    // Regex contract: <day> <Month> <year>. Catches the four
    // common regressions:
    //   - "31/05/2026" (numeric short)
    //   - "May 31, 2026" (en-US ordering)
    //   - "31 May, 2026" (extra comma if a future revision adds
    //     hourCycle: 'h23' or similar and shifts the formatter)
    //   - "2026-05-31" (ISO leak if someone swaps to toISOString)
    expect(LEGAL_LAST_UPDATED_DISPLAY).toMatch(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  });

  it("derives from LEGAL_LAST_UPDATED (year matches the Date's UTC year)", () => {
    // Defends against a hand-edited string drifting from the
    // parsed Date. The display string's final token is the year;
    // the regex above doesn't pin that the year MATCHES the
    // underlying Date, only that it's four digits. This test
    // closes that gap.
    const parts = LEGAL_LAST_UPDATED_DISPLAY.split(' ');
    const yearFromDisplay = Number(parts[parts.length - 1]);
    expect(yearFromDisplay).toBe(LEGAL_LAST_UPDATED.getUTCFullYear());
  });
});
