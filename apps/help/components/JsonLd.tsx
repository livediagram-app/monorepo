// Renders one or more Schema.org JSON-LD objects into a script tag. Used for
// breadcrumb / article / website structured data (spec/55). The payload is
// app-authored (never user input), so dangerouslySetInnerHTML is safe here.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
      suppressHydrationWarning
    />
  );
}
