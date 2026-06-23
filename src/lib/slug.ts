export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[|/]/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

export function uniqueSlug(base: string, used: Set<string>): string {
  let slug = slugify(base);
  let n = 2;
  while (used.has(slug)) slug = `${slugify(base)}-${n++}`;
  used.add(slug);
  return slug;
}
