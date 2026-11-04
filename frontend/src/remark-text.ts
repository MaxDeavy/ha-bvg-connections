/**
 * Turn remark text from the HAFAS API into plain text and safe links.
 *
 * Remarks can contain HTML such as `<a href="…">[MEHR/MORE]</a>`. The text is
 * untrusted, so it is never handed to innerHTML: tags are tokenised here, only
 * `<a>` elements with an http(s) href survive (as data, rendered by Lit), and
 * every other tag is dropped while its text is kept.
 */

export type RemarkPart = { text: string; href?: string };

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  eacute: "é",
  egrave: "è",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  bdquo: "„",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  euro: "€",
};

const DROP_CONTENT = new Set(["script", "style"]);
const LINE_BREAKS = new Set(["br", "p", "div", "li"]);
const MORE_LABEL = /^\[?\s*(mehr|more)(\s*\/\s*(mehr|more))?\s*\]?$/i;

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return Object.hasOwn(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : match;
  });
}

export function safeHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(decodeEntities(raw).trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function hrefOf(attributes: string): string | undefined {
  const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(attributes);
  return safeHref(match ? (match[1] ?? match[2] ?? match[3]) : undefined);
}

export function parseRemark(raw: string | null | undefined, moreLabel: string): RemarkPart[] {
  const parts: RemarkPart[] = [];
  const push = (text: string, href?: string) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (!href && last && !last.href) last.text += text;
    else parts.push(href ? { text, href } : { text });
  };

  let source = raw ?? "";
  // Some feeds entity-encode the markup itself.
  if (!source.includes("<") && /&lt;/i.test(source)) source = decodeEntities(source);
  const tag = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>|<!--[\s\S]*?-->/gi;
  let link: { href?: string; text: string } | null = null;
  let dropUntil: string | null = null;
  let index = 0;
  let match: RegExpExecArray | null;

  const emitText = (text: string) => {
    if (dropUntil) return;
    if (link) link.text += text;
    else push(text);
  };

  while ((match = tag.exec(source))) {
    emitText(source.slice(index, match.index));
    index = tag.lastIndex;
    const [, closing, rawName, attributes] = match;
    if (!rawName) continue;
    const name = rawName.toLowerCase();
    if (dropUntil) {
      if (closing && name === dropUntil) dropUntil = null;
      continue;
    }
    if (DROP_CONTENT.has(name) && !closing) {
      dropUntil = name;
    } else if (name === "a") {
      if (!closing && !link) {
        link = { href: hrefOf(attributes ?? ""), text: "" };
      } else if (closing && link) {
        finishLink(link, moreLabel, push);
        link = null;
      }
    } else if (LINE_BREAKS.has(name)) {
      emitText(" ");
    }
  }
  emitText(source.slice(index));
  if (link) finishLink(link, moreLabel, push);

  return tidy(parts);
}

function finishLink(
  link: { href?: string; text: string },
  moreLabel: string,
  push: (text: string, href?: string) => void,
): void {
  const label = decodeEntities(link.text).replace(/\s+/g, " ").trim();
  if (link.href) push(!label || MORE_LABEL.test(label) ? moreLabel : label, link.href);
  else if (label && !MORE_LABEL.test(label)) push(label);
}

function tidy(parts: RemarkPart[]): RemarkPart[] {
  const result = parts
    .map((part) => ({
      ...part,
      text: part.href ? part.text : decodeEntities(part.text).replace(/[ \t\r\n\f]+/g, " "),
    }))
    .filter((part) => part.text.trim() !== "");
  if (result.length) {
    result[0].text = result[0].text.trimStart();
    result[result.length - 1].text = result[result.length - 1].text.trimEnd();
  }
  return result;
}

/** Plain text of a remark, e.g. for one-line previews. */
export function remarkPlainText(raw: string | null | undefined, moreLabel: string): string {
  return parseRemark(raw, moreLabel)
    .filter((part) => !part.href)
    .map((part) => part.text)
    .join("")
    .trim();
}
