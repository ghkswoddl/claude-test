// Minimal YAML-subset frontmatter parser. Shared between the browser
// (loaded as <script type="module">) and Node (scripts/build-index.js).
// Supports only what blog posts need: string / date / string-array values.

function parseScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineArray(value) {
  const inner = value.trim().slice(1, -1);
  if (!inner.trim()) return [];
  return inner.split(",").map((item) => parseScalar(item.trim()));
}

/**
 * @param {string} raw - full raw file text
 * @returns {{ data: Record<string, unknown>, content: string }}
 */
export function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/);

  if (lines[0] !== "---") {
    return { data: {}, content: raw };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { data: {}, content: raw };
  }

  const data = {};
  const fmLines = lines.slice(1, endIndex);

  for (let i = 0; i < fmLines.length; i++) {
    const line = fmLines[i];
    if (!line.trim()) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();

    if (rawValue === "") {
      // possible block-style array on following lines: "- item"
      const items = [];
      let j = i + 1;
      while (j < fmLines.length && /^\s*-\s+(.+)$/.test(fmLines[j])) {
        const match = fmLines[j].match(/^\s*-\s+(.+)$/);
        items.push(parseScalar(match[1]));
        j++;
      }
      data[key] = items;
      i = j - 1;
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[key] = parseInlineArray(rawValue);
    } else {
      data[key] = parseScalar(rawValue);
    }
  }

  const content = lines.slice(endIndex + 1).join("\n");
  return { data, content };
}
