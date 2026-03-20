# Stacksr — Hugo Site

Dark industrial-tech themed Stacksr.

## Quick Start

### 1. Install Hugo Extended

**macOS**
```bash
brew install hugo
```

**Windows**
```bash
winget install Hugo.Hugo.Extended
```

**Linux**
```bash
sudo apt install hugo
# or grab the extended binary from https://github.com/gohugoio/hugo/releases
```

Verify:
```bash
hugo version
# Must show: hugo vX.XX+extended
```

### 2. Run locally

```bash
cd stacksr-site
hugo server -D -p 1313 --bind 0.0.0.0 --baseURL http://localhost:1313/ --disableFastRender --noHTTPCache
```

Open **http://localhost:1313** in your browser.

### 3. Create new content

```bash
# New blog post
hugo new blog/my-post.md

# New docs article
hugo new docs/aiot/my-guide.md
```

Edit the file in `content/`, set `draft: false` when ready to publish.

### 4. Build for production

```bash
hugo --minify
# Output is in /public — deploy this folder
```

### 5. Deploy to GitHub Pages

Push to the `main` branch — the GitHub Actions workflow in
`.github/workflows/hugo.yml` handles everything automatically.

---

## Project Structure

```
stacksr-site/
├── assets/css/main.css        ← all styles (edit to customise)
├── layouts/                   ← HTML templates
│   ├── index.html             ← homepage
│   ├── _default/              ← base shell + default single page
│   ├── blog/                  ← blog list + single post
│   ├── docs/                  ← docs list + single article
│   ├── about/                 ← about page
│   ├── partials/              ← header + footer
│   └── 404.html               ← custom 404
├── content/                   ← your Markdown content
│   ├── _index.md              ← homepage content
│   ├── about.md               ← about page
│   ├── blog/                  ← blog posts
│   └── docs/aiot/             ← docs articles
├── archetypes/                ← templates for hugo new
├── static/images/             ← put images here
├── hugo.yaml                  ← site configuration
└── .github/workflows/         ← GitHub Actions deploy
```

## Customisation

| What | Where |
|---|---|
| Colors, fonts, spacing | `assets/css/main.css` → `:root` variables |
| Hero text | `hugo.yaml` → `params.heroTitle` / `params.heroSubtitle` |
| Category tiles | `hugo.yaml` → `params.categories` |
| Nav links | `hugo.yaml` → `menu.main` |
| About sidebar | `hugo.yaml` → `params.about` |
