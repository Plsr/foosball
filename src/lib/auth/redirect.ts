export function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.includes("\\")) {
    return "/";
  }

  const baseUrl = new URL("https://app.local");
  const destination = new URL(value, baseUrl);

  if (destination.origin !== baseUrl.origin) {
    return "/";
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
