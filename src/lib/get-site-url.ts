export function getSiteURL(): string {
  let url = window.location.origin;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}
