/*
 * Server-side HTML sanitizer
 * - Strict allow-list for tags and attributes
 * - Removes script/style tags and contents
 * - Strips all event-* attributes and inline style attributes
 * - Allows iframe only for verified hosts (youtube.com, youtu.be, vimeo.com)
 * - Rewrites/normalizes attributes for safety (rel noopener, referrerpolicy no-referrer)
 */

import { URL } from "url";

const ALLOWED_TAGS = new Set([
  "a",
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "img",
  "figure",
  "figcaption",
  "div",
  "span",
  "iframe",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  iframe: ["src", "width", "height", "allowfullscreen", "loading"],
  '*': ["class"],
};

const ALLOWED_IFRAME_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];

function stripScriptAndStyle(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
}

function removeDangerousAttrs(tagHtml: string): string {
  // remove event handlers like onerror, onload
  tagHtml = tagHtml.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // remove style attributes entirely
  tagHtml = tagHtml.replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // remove javascript: URIs in href/src
  tagHtml = tagHtml.replace(/(href|src)\s*=\s*(?:"|')?\s*javascript:[^\s"'>]*/gi, "");
  return tagHtml;
}

function parseAttributes(attrString: string): Record<string, string | true> {
  const attrs: Record<string, string | true> = {};
  const re = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(attrString))) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    attrs[name] = value === "" ? true : value;
  }
  return attrs;
}

function serializeAttributes(attrs: Record<string, string | true>): string {
  return Object.entries(attrs)
    .map(([k, v]) => (v === true ? `${k}` : `${k}="${String(v).replace(/"/g, '&quot;')}"`))
    .join(" ");
}

function isAllowedIframeSrc(src: string): boolean {
  try {
    if (!src) return false;
    const url = new URL(src, "https://example.com");
    const host = url.hostname.toLowerCase();
    return ALLOWED_IFRAME_HOSTS.some((allowed) => host === allowed || host.endsWith("." + allowed));
  } catch {
    return false;
  }
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  let html = String(input);

  html = stripScriptAndStyle(html);

  // process iframes first: validate and rewrite; any disallowed iframe removed entirely
  html = html.replace(/<iframe\b([^>]*)>([\s\S]*?)<\/iframe>/gi, (full, attrString) => {
    const attrs = removeDangerousAttrs(attrString);
    const parsed = parseAttributes(attrs);
    const src = String(parsed.src ?? "").trim();

    if (!isAllowedIframeSrc(src)) {
      return ""; // remove disallowed iframe
    }

    // rebuild a safe iframe
    const safeAttrs: Record<string, string | true> = {};
    safeAttrs.src = src;
    safeAttrs.loading = "lazy";
    safeAttrs.sandbox = "allow-same-origin allow-scripts"; // sandbox present
    safeAttrs.referrerpolicy = "no-referrer";
    safeAttrs.allowfullscreen = true;

    const attrText = serializeAttributes(safeAttrs);
    return `<iframe ${attrText}></iframe>`;
  });

  // Remove other tags not in allow list and strip dangerous attributes
  html = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/gi, (full, tagNameRaw, attrString) => {
    const tagName = String(tagNameRaw).toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      // strip the tag but keep inner text for opening tags; for closing tags remove
      return "";
    }

    // sanitize attributes
    const cleaned = removeDangerousAttrs(attrString || "");
    const parsed = parseAttributes(cleaned);

    const allowedForTag = new Set([...(ALLOWED_ATTRS[tagName] ?? []), ...(ALLOWED_ATTRS['*'] ?? [])]);
    const outAttrs: Record<string, string | true> = {};

    for (const [k, v] of Object.entries(parsed)) {
      if (!allowedForTag.has(k)) continue;

      // special handling
      if ((k === 'href' || k === 'src') && typeof v === 'string') {
        const lower = v.trim().toLowerCase();
        // disallow javascript: and data: URIs (except allow data for images? safer to block)
        if (lower.startsWith('javascript:') || lower.startsWith('data:')) continue;
        try {
          const url = new URL(v, 'https://example.com');
          if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
        } catch {
          continue;
        }
        outAttrs[k] = v;
        continue;
      }

      if (k === 'target') {
        outAttrs.target = String(v);
        outAttrs.rel = 'noopener noreferrer';
        continue;
      }

      // boolean attributes
      if (v === true) {
        outAttrs[k] = true;
        continue;
      }

      outAttrs[k] = String(v);
    }

    const attrText = serializeAttributes(outAttrs);
    return `<${tagName}${attrText ? ' ' + attrText : ''}>`;
  });

  // final pass: remove any remaining <script> or event handlers that slipped through
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/\son[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  return html;
}
