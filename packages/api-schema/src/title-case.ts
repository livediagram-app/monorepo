// Shared display-casing helper. Raises the first letter of each word
// WITHOUT lowering the rest, so a lowercased preset value (theme names
// like `mint`, template ids like `flowchart`) renders as Title Case
// while an acronym or PascalCase value (`PNG`, `JSON`, `ER`, `UML`,
// `FormatPainter`, `ShareLink`) is left intact.
//
// Lives here because both the live editor (template titles) and the
// telemetry dashboard (action / type enum values, which are this
// package's own TELEMETRY_* vocabulary) need the exact same rule — an
// identical one-liner had been copy-pasted into each. Keeping one
// definition stops the two surfaces drifting on how a preset value is
// capitalised for display.
export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
