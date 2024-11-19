#!/bin/bash
# .husky/setup.sh

# Ensure we're in project root
cd "$(dirname "$0")/.."

# Ensure package.json exists
if [ ! -f package.json ]; then
    echo '{"name": "devcontainer-configs"}' > package.json
fi

# Install dependencies
npm install --save-dev husky axios

# Add prepare script to package.json if not exists
if ! grep -q "\"prepare\":" package.json; then
    sed -i '/"name":/a \  "scripts": {\n    "prepare": "husky"\n  },' package.json
fi

# Initialize husky
npm run prepare

# Create .husky directory if it doesn't exist
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bash "$(dirname -- "$0")/update-sizes.sh"
EOF

# Make scripts executable
chmod +x .husky/pre-commit
chmod +x .husky/update-sizes.sh

echo "Husky setup complete! Pre-commit hooks are ready."