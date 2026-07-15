import os
import re

def update_docs():
    sizes = {}
    versions = {}
    if not os.path.exists('metadata'):
        print("No metadata directory found.")
        return

    # 1. Read sizes and versions from metadata
    for f in os.listdir('metadata'):
        if f.endswith('.size'):
            name = f.split('.')[0]
            with open(os.path.join('metadata', f), 'r') as fh:
                sizes[name] = fh.read().strip()
        elif f.endswith('.versions'):
            name = f.split('.')[0]
            versions[name] = {}
            with open(os.path.join('metadata', f), 'r') as fh:
                for line in fh:
                    if '=' in line:
                        k, v = line.strip().split('=', 1)
                        versions[name][k] = v
    
    print(f"Loaded image sizes: {sizes}")
    print(f"Loaded image versions: {versions}")

    # 2. Update docs/SETUP.md
    if os.path.exists('docs/SETUP.md'):
        print("Updating docs/SETUP.md...")
        with open('docs/SETUP.md', 'r') as fh:
            content = fh.read()
        
        for name, size in sizes.items():
            pattern = rf"(\|[ \t]*\*\*{name}\*\*[ \t]*\|[^|]+\|[^|]+\|)[ \t]*~?[^|]+[ \t]*\|"
            content = re.sub(pattern, rf"\g<1> ~{size} |", content)
            
        with open('docs/SETUP.md', 'w') as fh:
            fh.write(content)

    # 3. Update docs/IMAGE_VARIANTS.md
    if os.path.exists('docs/IMAGE_VARIANTS.md'):
        print("Updating docs/IMAGE_VARIANTS.md...")
        with open('docs/IMAGE_VARIANTS.md', 'r') as fh:
            content = fh.read()

        # Update Comparison Table Rows
        header_match = re.search(r"\|[ \t]*Feature[ \t]*\|([ \t]*[a-zA-Z0-9_-]+[ \t]*\|)+", content)
        if header_match:
            headers = [h.strip() for h in header_match.group(0).split('|')[2:-1]]
            
            # A. Update Size Row
            existing_sizes = {}
            size_match = re.search(r"\|[ \t]*\*\*Size\*\*[ \t]*\|(.*)", content)
            if size_match:
                parts = size_match.group(1).split('|')
                for idx, h in enumerate(headers):
                    if idx < len(parts):
                        existing_sizes[h] = parts[idx].strip()

            size_row = "| **Size**        "
            for h in headers:
                if h in sizes:
                    size_row += f"| ~{sizes[h]} "
                elif h in existing_sizes:
                    size_row += f"| {existing_sizes[h]} "
                else:
                    size_row += "| - "
            size_row += "|"
            size_pattern = r"\|[ \t]*\*\*Size\*\*[ \t]*\|" + "".join(r"[^|]+\|" for _ in range(len(headers)))
            content = re.sub(size_pattern, size_row, content)

            # B. Update Bun Version Row
            existing_buns = {}
            bun_match = re.search(r"\|[ \t]*\*\*Bun Version\*\*[ \t]*\|(.*)", content)
            if bun_match:
                parts = bun_match.group(1).split('|')
                for idx, h in enumerate(headers):
                    if idx < len(parts):
                        existing_buns[h] = parts[idx].strip()

            bun_row = "| **Bun Version** "
            for h in headers:
                if h in versions and 'bun' in versions[h]:
                    bun_row += f"| {versions[h]['bun']} "
                elif h in existing_buns:
                    bun_row += f"| {existing_buns[h]} "
                else:
                    bun_row += "| ❌ "
            bun_row += "|"
            bun_pattern = r"\|[ \t]*\*\*Bun Version\*\*[ \t]*\|" + "".join(r"[^|]+\|" for _ in range(len(headers)))
            content = re.sub(bun_pattern, bun_row, content)

            # C. Update Node.js Row
            existing_nodes = {}
            node_match = re.search(r"\|[ \t]*\*\*Node\.js\*\*[ \t]*\|(.*)", content)
            if node_match:
                parts = node_match.group(1).split('|')
                for idx, h in enumerate(headers):
                    if idx < len(parts):
                        existing_nodes[h] = parts[idx].strip()

            node_row = "| **Node.js**     "
            for h in headers:
                if h in versions and 'node' in versions[h]:
                    node_row += f"| ✅ v{versions[h]['node']} "
                elif h in existing_nodes:
                    node_row += f"| {existing_nodes[h]} "
                else:
                    node_row += "| ❌ "
            node_row += "|"
            node_pattern = r"\|[ \t]*\*\*Node\.js\*\*[ \t]*\|" + "".join(r"[^|]+\|" for _ in range(len(headers)))
            content = re.sub(node_pattern, node_row, content)

        # Update other occurrences
        for name, size in sizes.items():
            # Match: ### X. name (~size)
            content = re.sub(rf"(###[ \t]+[0-9]+\.[ \t]+{name}[ \t]+\()[^)]+(\))", rf"\g<1>~{size}\g<2>", content)
            # Match: **name** (~size) or **name** (size)
            content = re.sub(rf"(\*\*{name}\*\*[ \t]+\()[^)]+(\))", rf"\g<1>~{size}\g<2>", content)
            # Match: `name` (size) or `name` (~size)
            content = re.sub(rf"(`{name}`[ \t]+\()[^)]+(\))", rf"\g<1>{size}\g<2>", content)

            # Specific lists / descriptions
            if name == 'ubuntu-bun':
                content = re.sub(r"Smallest size - Only [0-9]+ MB!", f"Smallest size - Only {size}!", content)
            elif name == 'ubuntu-bun-node':
                content = re.sub(r"Balanced size - Feature-rich at only [0-9]+ MB", f"Balanced size - Feature-rich at only {size}", content)
            elif name == 'ai':
                content = re.sub(r"AI additions - Custom taste workspace at only [0-9]+ MB", f"AI additions - Custom taste workspace at only {size}", content)

        with open('docs/IMAGE_VARIANTS.md', 'w') as fh:
            fh.write(content)
            
    print("Documentation updated successfully.")

if __name__ == '__main__':
    update_docs()
