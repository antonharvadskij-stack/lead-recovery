export const SITE = "https://leadrelay.lovable.app";

export function pageLinks(path: string) {
  const href = `${SITE}${path}`;
  return [
    { rel: "canonical", href },
    { rel: "alternate", hrefLang: "en", href },
    { rel: "alternate", hrefLang: "x-default", href },
  ];
}