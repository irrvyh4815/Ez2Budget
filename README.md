# Ez2Budget

Ez2Budget is a browser-based engineering budget workbook for construction, architecture, and civil engineering estimates in Taiwan.

## Features

- Multiple saved budget books per customer or project
- Separate budget library and budget editor views
- Custom major categories with reorder, rename, add, and delete controls
- Detail line items with automatic numbering
- Bulk selection for future operations, including AI quote prompts, copy, and delete
- CSV and JSON export
- Local browser storage, no backend required for the current version

## Local Preview

Use any static file server from the project root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

## Deploy To Vercel

This is a static site. In Vercel:

1. Import the GitHub repository.
2. Leave Framework Preset as `Other`.
3. Leave Build Command empty.
4. Leave Output Directory empty.
5. Deploy.

The included `vercel.json` adds basic static-site headers.

## GitHub Checklist

```bash
git add .
git commit -m "Initial Ez2Budget static app"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```
