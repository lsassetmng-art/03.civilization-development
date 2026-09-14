"use client";

type StructuredDataScriptProps = {
  data: Record<string, unknown>;
};

export function StructuredDataScript({
  data,
}: StructuredDataScriptProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
