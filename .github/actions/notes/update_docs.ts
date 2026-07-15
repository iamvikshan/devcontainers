import { existsSync } from "node:fs";

type VersionsMap = Record<string, string>;

interface Metadata {
  sizes: Record<string, string>;
  versions: Record<string, VersionsMap>;
}

/**
 * Parses CLI arguments (--images="agents,bun") or environment variable CHANGED_IMAGES
 * to ensure we only touch documentation for images actually built in this CI run.
 */
function getAllowedImages(): Set<string> | null {
  const cliArg = process.argv.find((arg) => arg.startsWith("--images="));
  const rawList = cliArg ? cliArg.split("=")[1] : process.env.CHANGED_IMAGES;

  if (!rawList || rawList.trim() === "") return null;
  return new Set(rawList.split(",").map((s) => s.trim()).filter(Boolean));
}

/**
 * Reads metadata using Bun native Glob and asynchronous File APIs.
 */
async function loadMetadata(allowedImages: Set<string> | null): Promise<Metadata> {
  const sizes: Record<string, string> = {};
  const versions: Record<string, VersionsMap> = {};

  if (!existsSync("metadata")) {
    console.log("No metadata directory found.");
    return { sizes, versions };
  }

  // 1. Scan size files natively via Bun.Glob
  const sizeGlob = new Bun.Glob("*.size");
  for await (const file of sizeGlob.scan("metadata")) {
    const name = file.replace(/\.size$/, "");
    if (allowedImages && !allowedImages.has(name)) continue;

    const content = await Bun.file(`metadata/${file}`).text();
    sizes[name] = content.trim();
  }

  // 2. Scan version files natively via Bun.Glob
  const versionGlob = new Bun.Glob("*.versions");
  for await (const file of versionGlob.scan("metadata")) {
    const name = file.replace(/\.versions$/, "");
    if (allowedImages && !allowedImages.has(name)) continue;

    versions[name] = {};
    const content = await Bun.file(`metadata/${file}`).text();

    for (const line of content.split("\n")) {
      if (line.includes("=")) {
        const [key, ...valParts] = line.trim().split("=");
        versions[name][key] = valParts.join("=");
      }
    }
  }

  return { sizes, versions };
}

/**
 * Helper to extract existing table cell values from IMAGE_VARIANTS.md
 * so untouched columns preserve their exact data.
 */
function extractExistingRow(content: string, rowLabelRegex: string, headers: string[]): Record<string, string> {
  const existing: Record<string, string> = {};
  const match = content.match(new RegExp(`\\|[ \\t]*${rowLabelRegex}[ \\t]*\\|(.*)`));

  if (match) {
    const parts = match[1].split("|");
    headers.forEach((h, idx) => {
      if (idx < parts.length) {
        existing[h] = parts[idx].trim();
      }
    });
  }
  return existing;
}

/**
 * Updates docs/SETUP.md sizes
 */
async function updateSetupMd(sizes: Record<string, string>) {
  const filePath = "docs/SETUP.md";
  if (!existsSync(filePath)) return;

  console.log(`Updating ${filePath}...`);
  let content = await Bun.file(filePath).text();

  for (const [name, size] of Object.entries(sizes)) {
    // Match: (| **name** | col2 | col3 |) ~?old_size |
    const pattern = new RegExp(`(\\|[ \\t]*\\*\\*${name}\\*\\*[ \\t]*\\|[^|]+\\|[^|]+\\|)[ \\t]*~?[^|]+[ \\t]*\\|`, "g");
    content = content.replace(pattern, `$1 ~${size} |`);
  }

  await Bun.write(filePath, content);
}

/**
 * Updates docs/IMAGE_VARIANTS.md comparison table and descriptions
 */
async function updateImageVariantsMd(sizes: Record<string, string>, versions: Record<string, VersionsMap>) {
  const filePath = "docs/IMAGE_VARIANTS.md";
  if (!existsSync(filePath)) return;

  console.log(`Updating ${filePath}...`);
  let content = await Bun.file(filePath).text();

  // Extract table headers (Container names: bun, ubuntu, agents, etc.)
  const headerMatch = content.match(/\|[ \t]*Feature[ \t]*\|([ \t]*[a-zA-Z0-9_-]+[ \t]*\|)+/);
  if (headerMatch) {
    const rawRow = headerMatch[0];
    const headers = rawRow
      .split("|")
      .map((h) => h.trim())
      .filter((h) => h && h !== "Feature");

    // A. Update Size Row
    const existingSizes = extractExistingRow(content, "\\*\\*Size\\*\\*", headers);
    let sizeRow = "| **Size**        ";
    for (const h of headers) {
      if (h in sizes) sizeRow += `| ~${sizes[h]} `;
      else if (h in existingSizes) sizeRow += `| ${existingSizes[h]} `;
      else sizeRow += "| - ";
    }
    sizeRow += "|";
    const sizePattern = new RegExp(`\\|[ \\t]*\\*\\*Size\\*\\*[ \\t]*\\|` + "[^|]+\\|".repeat(headers.length), "g");
    content = content.replace(sizePattern, sizeRow);

    // B. Update Bun Version Row
    const existingBuns = extractExistingRow(content, "\\*\\*Bun Version\\*\\*", headers);
    let bunRow = "| **Bun Version** ";
    for (const h of headers) {
      if (versions[h]?.bun) bunRow += `| ${versions[h].bun} `;
      else if (h in existingBuns) bunRow += `| ${existingBuns[h]} `;
      else bunRow += "| ❌ ";
    }
    bunRow += "|";
    const bunPattern = new RegExp(`\\|[ \\t]*\\*\\*Bun Version\\*\\*[ \\t]*\\|` + "[^|]+\\|".repeat(headers.length), "g");
    content = content.replace(bunPattern, bunRow);

    // C. Update Node.js Row
    const existingNodes = extractExistingRow(content, "\\*\\*Node\\.js\\*\\*", headers);
    let nodeRow = "| **Node.js**     ";
    for (const h of headers) {
      if (versions[h]?.node) nodeRow += `| ✅ v${versions[h].node} `;
      else if (h in existingNodes) nodeRow += `| ${existingNodes[h]} `;
      else nodeRow += "| ❌ ";
    }
    nodeRow += "|";
    const nodePattern = new RegExp(`\\|[ \\t]*\\*\\*Node\\.js\\*\\*[ \\t]*\\|` + "[^|]+\\|".repeat(headers.length), "g");
    content = content.replace(nodePattern, nodeRow);
  }

  // Update inline sizes and specific text descriptions
  for (const [name, size] of Object.entries(sizes)) {
    // Match: ### X. name (~size)
    content = content.replace(new RegExp(`(###[ \\t]+[0-9]+\\.[ \\t]+${name}[ \\t]+\\()[^)]+(\\))`, "g"), `$1~${size}$2`);
    // Match: **name** (~size)
    content = content.replace(new RegExp(`(\\~?\\*\\*${name}\\*\\*[ \\t]+\\()[^)]+(\\))`, "g"), `$1~${size}$2`);
    // Match: `name` (size)
    content = content.replace(new RegExp("(`" + name + "`[ \\t]+\\()[^)]+(\\))", "g"), `$1${size}$2`);

    // Specific variant promotional strings
    if (name === "ubuntu-bun") {
      content = content.replace(/Smallest size - Only [0-9]+ MB!/g, `Smallest size - Only ${size}!`);
    } else if (name === "ubuntu-bun-node") {
      content = content.replace(/Balanced size - Feature-rich at only [0-9]+ MB/g, `Balanced size - Feature-rich at only ${size}`);
    } else if (name === "agents") {
      content = content.replace(/AI additions - Custom taste workspace at only [0-9]+ MB/g, `AI additions - Custom taste workspace at only ${size}`);
    }
  }

  await Bun.write(filePath, content);
}

// --- Main Execution ---
async function main() {
  const allowedImages = getAllowedImages();
  if (allowedImages) {
    console.log(`Locking documentation updates strictly to: [${Array.from(allowedImages).join(", ")}]`);
  }

  const { sizes, versions } = await loadMetadata(allowedImages);
  console.log("Loaded image sizes:", sizes);
  console.log("Loaded image versions:", versions);

  await updateSetupMd(sizes);
  await updateImageVariantsMd(sizes, versions);
  console.log("Documentation updated successfully.");
}

main().catch((err) => {
  console.error("Fatal error updating documentation:", err);
  process.exit(1);
});