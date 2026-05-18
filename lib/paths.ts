/** Build a public URL path with correct encoding for spaces and special characters. */
export function publicPath(...segments: string[]): string {
  return `/${segments.map((s) => encodeURIComponent(s)).join('/')}`
}
