/**
 * Content of a CMS page section. Sections are schema-less on purpose: each website section
 * stores whatever fields its component reads (titles, items, images, nested lists…), and the
 * Pages & CMS editor reads and writes them generically. Typing every section would mean a
 * schema per website component, so the editor keeps this one loose type for that JSON —
 * use it only for section content, never for API responses with a known shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CmsJson = any;

/** A section, or an item inside one */
export type CmsRecord = Record<string, CmsJson>;
