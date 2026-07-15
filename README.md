# Data Redundancy Removal System

A browser-based system that identifies, classifies, and prevents duplicate data entries from being added to a database. Built as a CodeAlpha internship project.

---

## Features

| Feature | Description |
|---|---|
| Duplicate detection | Exact and fuzzy email matching using Levenshtein distance |
| False positive classification | Flags entries where name + phone match but email differs |
| Configurable thresholds | Adjustable similarity % per field (email, name, phone) |
| Bulk CSV import | Paste and process multiple rows at once |
| Audit log | Timestamped trail of every ADD / SKIP / FP / DEL action |
| Export | Download the verified database as CSV or JSON |
| Similarity visualisation | Per-field similarity bars explaining why an entry was flagged |

---

## Project Structure

```
data-redundancy-system/
├── index.html                  # Main entry point
├── assets/
│   └── css/
│       └── style.css           # All styles
└── src/
    ├── main.js                 # App bootstrap
    ├── utils/
    │   ├── helpers.js          # Shared utility functions
    │   └── similarity.js       # Levenshtein similarity algorithm
    ├── data/
    │   ├── store.js            # Central in-memory data store
    │   └── validator.js        # Classification engine
    └── components/
        ├── stats.js            # Summary stat cards
        ├── auditLog.js         # Audit trail renderer
        ├── databaseView.js     # Records table + delete
        ├── similarityCard.js   # Similarity bar chart card
        ├── formHandler.js      # Single-entry form logic
        ├── bulkHandler.js      # CSV bulk import logic
        ├── exportHandler.js    # CSV / JSON export
        └── ui.js               # Tab switching
```

---

## How to Run

This is a pure HTML/CSS/JS project — no build step required.

```bash
# Clone or download the repo, then open in a browser:
open index.html

# Or serve locally (optional, avoids any file:// quirks):
npx serve .
# Then visit http://localhost:3000
```

---

## Classification Logic

The validator checks each incoming entry against every existing record:

```
1. Exact duplicate   → email matches exactly (case-insensitive)   → BLOCKED
2. Fuzzy duplicate   → email similarity ≥ threshold               → BLOCKED
3. False positive    → name + phone match, but email differs       → ADDED with warning flag
4. Unique            → no significant similarity found             → ADDED normally
```

Thresholds are configurable in the **Settings** tab (default: email 90%, name 80%, phone 95%).

---

## Similarity Algorithm

Uses **Levenshtein edit distance** normalised to a 0–100% similarity score:

```
similarity(a, b) = (1 - editDistance(a, b) / max(len(a), len(b))) × 100
```

Both strings are normalised (lowercase, trimmed, whitespace collapsed) before comparison.

---

## Bulk CSV Format

```
name,email,phone,category
Alice Johnson,alice@example.com,9876543210,Customer
Bob Smith,bob@acme.com,9123456789,Employee
```

- Header row is optional and automatically skipped.
- `phone` and `category` are optional fields.
- Rows with missing `name` or invalid `email` are skipped and counted as errors.

---

## Technologies Used

- Vanilla JavaScript (ES6 modules pattern with IIFEs)
- HTML5 / CSS3
- Tabler Icons (CDN)
- No frameworks, no build tools, no dependencies

---

## Author

Built for the **CodeAlpha Data Science Internship** — Task 1: Data Redundancy Removal System.
