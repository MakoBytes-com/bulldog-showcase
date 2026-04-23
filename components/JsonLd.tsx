type Props = {
  data: object | object[];
};

/**
 * Renders one or more JSON-LD blobs as <script type="application/ld+json">.
 * Safe for server-components. Content is not user-generated, so the
 * dangerouslySetInnerHTML usage here is deliberate and appropriate.
 */
export function JsonLd({ data }: Props) {
  const payloads = Array.isArray(data) ? data : [data];
  return (
    <>
      {payloads.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}
    </>
  );
}
