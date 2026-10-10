import { describe, expect, test } from "vitest";
import { format, localeFromAcceptLanguage } from "./config";
import { messages } from "./messages";
import { en } from "./messages/en";

/** Every leaf path with its value, e.g. ["help.faq.0.q", "Does a match…"]. */
function leaves(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  return Object.entries(value as object).flatMap(([key, child]) =>
    leaves(child, path ? `${path}.${key}` : key),
  );
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe.each(["hi", "kn"] as const)("%s messages", (locale) => {
  const source = new Map(leaves(en));
  const translated = new Map(leaves(messages[locale]));

  test("have exactly the English keys, including list lengths", () => {
    expect([...translated.keys()].sort()).toEqual([...source.keys()].sort());
  });

  test("keep every {placeholder} the English string uses", () => {
    for (const [path, text] of source) {
      expect([path, placeholders(translated.get(path) ?? "")]).toEqual([
        path,
        placeholders(text),
      ]);
    }
  });

  test("are translated, not copied from English", () => {
    const copied = [...source].filter(
      ([path, text]) =>
        translated.get(path) === text &&
        /[a-z]{4,}/i.test(text.replace(/\{\w+\}/g, "")),
    );
    // Brand names and scheme acronyms legitimately stay in Latin script.
    expect(copied.map(([path]) => path)).toEqual([]);
  });
});

test("Accept-Language picks the first supported language", () => {
  expect(localeFromAcceptLanguage("kn-IN,kn;q=0.9,en;q=0.8")).toBe("kn");
  expect(localeFromAcceptLanguage("fr-FR,hi;q=0.5")).toBe("hi");
  expect(localeFromAcceptLanguage("fr-FR")).toBe("en");
  expect(localeFromAcceptLanguage(null)).toBe("en");
});

test("format fills placeholders and leaves unknown ones visible", () => {
  expect(format("{count} schemes", { count: 3 })).toBe("3 schemes");
  expect(format("{a} and {b}", { a: 1 })).toBe("1 and {b}");
});
