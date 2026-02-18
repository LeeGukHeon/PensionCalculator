import { useEffect } from "react";

function upsertMeta(name, content, attribute = "name") {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}='${name}']`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export default function useDocumentMeta({ title, description, canonical }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    upsertMeta("description", description);
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:url", canonical, "property");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    let canonicalLink = document.head.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }

    if (canonical) {
      canonicalLink.setAttribute("href", canonical);
    }
  }, [title, description, canonical]);
}
