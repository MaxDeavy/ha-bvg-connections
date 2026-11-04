import { describe, expect, it } from "vitest";
import { decodeEntities, parseRemark, remarkPlainText, safeHref } from "../src/remark-text";

const BVG_LINK =
  'Bitte steigen Sie am Elcknerplatz ein. <a href="https://www.bvg.de/de/verbindungen/stoerungsmeldungen?modalDisruptionId=adb66544&amp;x=1" target="_blank" rel="noopener">[MEHR/MORE]</a>';

describe("parseRemark", () => {
  it("turns BVG [MEHR/MORE] anchors into a labelled link", () => {
    expect(parseRemark(BVG_LINK, "Mehr")).toEqual([
      { text: "Bitte steigen Sie am Elcknerplatz ein. " },
      {
        text: "Mehr",
        href: "https://www.bvg.de/de/verbindungen/stoerungsmeldungen?modalDisruptionId=adb66544&x=1",
      },
    ]);
  });

  it("keeps a descriptive link label and falls back to the more label when empty", () => {
    expect(parseRemark('Siehe <a href="https://example.org/a">Fahrplan</a>.', "More")).toEqual([
      { text: "Siehe " },
      { text: "Fahrplan", href: "https://example.org/a" },
      { text: "." },
    ]);
    expect(parseRemark("<a href='http://example.org'></a>", "More")).toEqual([
      { text: "More", href: "http://example.org/" },
    ]);
  });

  it("drops links with unsafe or missing hrefs", () => {
    expect(parseRemark('Klick <a href="javascript:alert(1)">hier</a>', "Mehr")).toEqual([{ text: "Klick hier" }]);
    expect(parseRemark('<a href="data:text/html,x">[MEHR]</a>Text', "Mehr")).toEqual([{ text: "Text" }]);
    expect(parseRemark("<a>ohne Ziel</a>", "Mehr")).toEqual([{ text: "ohne Ziel" }]);
    expect(parseRemark('<a href="/relativ">rel</a>', "Mehr")).toEqual([{ text: "rel" }]);
  });

  it("strips other tags, drops script content and keeps text", () => {
    expect(
      parseRemark('<b>Bauarbeiten</b><br>zwischen <img src=x onerror=alert(1)>A<script>alert(1)</script> und B', "Mehr"),
    ).toEqual([{ text: "Bauarbeiten zwischen A und B" }]);
    expect(parseRemark("<!-- intern -->Hinweis", "Mehr")).toEqual([{ text: "Hinweis" }]);
  });

  it("decodes entities without creating markup", () => {
    expect(parseRemark("S&amp;U Zoo &auml;&#246;&#xFC; &nbsp;x", "Mehr")).toEqual([{ text: "S&U Zoo äöü x" }]);
    expect(parseRemark("<b>Takt</b> &lt;10 min", "Mehr")).toEqual([{ text: "Takt <10 min" }]);
    expect(parseRemark('&lt;a href="https://example.org"&gt;[MEHR/MORE]&lt;/a&gt;', "Mehr")).toEqual([
      { text: "Mehr", href: "https://example.org/" },
    ]);
  });

  it("leaves comparisons that look like tags alone", () => {
    expect(parseRemark("Takt < 10 min > sonst", "Mehr")).toEqual([{ text: "Takt < 10 min > sonst" }]);
  });

  it("handles empty input", () => {
    expect(parseRemark(undefined, "Mehr")).toEqual([]);
    expect(parseRemark("", "Mehr")).toEqual([]);
  });
});

describe("helpers", () => {
  it("builds plain text previews without link labels", () => {
    expect(remarkPlainText(BVG_LINK, "Mehr")).toBe("Bitte steigen Sie am Elcknerplatz ein.");
  });

  it("only accepts absolute http(s) URLs", () => {
    expect(safeHref("https://www.bvg.de/x?a=1&amp;b=2")).toBe("https://www.bvg.de/x?a=1&b=2");
    expect(safeHref(" JavaScript:alert(1)")).toBeUndefined();
    expect(safeHref("mailto:a@b.de")).toBeUndefined();
    expect(safeHref("")).toBeUndefined();
  });

  it("leaves unknown entities untouched", () => {
    expect(decodeEntities("&unknown; &#0; &amp;")).toBe("&unknown; &#0; &");
  });
});
