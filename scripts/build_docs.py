"""Convert plain-text page sources into src/lib/docs.ts.

Source format (one or more pages per file, files processed in sorted order):

  === slug
  group: Group name
  title: Page title
  desc: One-sentence description

  --- section-id | Section title
  Text paragraphs (blank line separates paragraphs).
  ```code [Label]
  code lines
  ```
  @after
  paragraphs shown after the example
  @note
  callout text
  @table
  Header 1 | Header 2
  cell | cell        (write \\| for a literal pipe)
  @links
  Label -> href
"""
import json
import pathlib
import re
import sys

GROUPS = ["Start here", "Language guide", "Tutorials", "Tooling", "Standard library", "Contribute"]


def parse(text, origin):
    pages = []
    page = None
    section = None
    field = "text"
    in_code = False
    for lineno, line in enumerate(text.split("\n"), 1):
        if in_code:
            if line == "```":
                in_code = False
                continue
            section["code"].append(line)
            continue
        if line.startswith("=== "):
            page = {"slug": line[4:].strip(), "meta": {}, "sections": []}
            pages.append(page)
            section = None
            continue
        if page is None:
            if line.strip():
                sys.exit(f"{origin}:{lineno}: content before page header")
            continue
        if section is None and re.match(r"^(group|title|desc): ", line):
            key, value = line.split(": ", 1)
            page["meta"][key] = value.strip()
            continue
        if line.startswith("--- "):
            ident, title = [part.strip() for part in line[4:].split(" | ", 1)]
            section = {"id": ident, "title": title, "text": [], "code": [], "after": [], "note": [],
                       "table": [], "links": [], "lang": None}
            page["sections"].append(section)
            field = "text"
            continue
        if section is None:
            if line.strip():
                sys.exit(f"{origin}:{lineno}: text outside a section")
            continue
        if line.startswith("```code"):
            if section["code"]:
                sys.exit(f"{origin}:{lineno}: second code block in section {section['id']}")
            label = line[len("```code"):].strip()
            section["lang"] = label or None
            in_code = True
            continue
        if line in ("@after", "@note", "@table", "@links", "@text"):
            field = line[1:]
            continue
        section[field].append(line)
    if in_code:
        sys.exit(f"{origin}: unterminated code block")
    return pages


def paragraphs(lines):
    text = "\n".join(lines).strip()
    # Join wrapped lines inside a paragraph; keep blank-line paragraph breaks.
    parts = [re.sub(r"\s*\n\s*", " ", p.strip()) for p in re.split(r"\n\s*\n", text) if p.strip()]
    return "\n\n".join(parts)


def to_doc(page, origin):
    meta = page["meta"]
    for key in ("group", "title", "desc"):
        if key not in meta:
            sys.exit(f"{origin}: page {page['slug']} missing {key}")
    if meta["group"] not in GROUPS:
        sys.exit(f"{origin}: unknown group {meta['group']}")
    ids = set()
    sections = []
    for s in page["sections"]:
        if s["id"] in ids:
            sys.exit(f"{origin}: duplicate section id {s['id']} in {page['slug']}")
        ids.add(s["id"])
        out = {
            "id": s["id"],
            "title": s["title"],
            "text": paragraphs(s["text"]),
            "code": "\n".join(l for l in s["code"] if not re.match(r"^// (check|expect|expect-status):", l)).strip("\n"),
            "note": paragraphs(s["note"]),
        }
        if s["lang"]:
            out["lang"] = s["lang"]
        after = paragraphs(s["after"])
        if after:
            out["after"] = after
        rows = [l for l in s["table"] if l.strip()]
        if rows:
            split = lambda r: [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", r)]
            header = split(rows[0])
            body = [split(r) for r in rows[1:]]
            for r in body:
                if len(r) != len(header):
                    sys.exit(f"{origin}: table row width mismatch in {page['slug']}#{s['id']}: {r}")
            out["table"] = {"headers": header, "rows": body}
        links = [l for l in s["links"] if l.strip()]
        if links:
            out["links"] = [dict(zip(("label", "href"), [p.strip() for p in l.split(" -> ", 1)])) for l in links]
        sections.append(out)
    return {"slug": page["slug"], "group": meta["group"], "title": meta["title"],
            "description": meta["desc"], "sections": sections}


def main(src_dir, out_file):
    docs = []
    for path in sorted(pathlib.Path(src_dir).glob("*.txt")):
        for page in parse(path.read_text(), path.name):
            docs.append(to_doc(page, path.name))
    slugs = [d["slug"] for d in docs]
    if len(slugs) != len(set(slugs)):
        sys.exit("duplicate slugs")
    # Keep pages of a group together, in GROUPS order, preserving file order within a group.
    docs.sort(key=lambda d: GROUPS.index(d["group"]))
    header = (
        "export type Section = { id: string; title: string; text: string; code: string; note: string; "
        "lang?: string; links?: { label: string; href: string }[]; after?: string; "
        "table?: { headers: string[]; rows: string[][] } };\n"
        "export type Doc = { slug: string; group: string; title: string; description: string; sections: Section[] };\n"
    )
    body = "export const docs: Doc[] = " + json.dumps(docs, ensure_ascii=False, indent=2) + ";\n"
    groups = "export const groups = " + json.dumps(GROUPS, ensure_ascii=False) + ";\n"
    pathlib.Path(out_file).write_text(header + body + groups)
    print(f"wrote {len(docs)} pages, {sum(len(d['sections']) for d in docs)} sections")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
