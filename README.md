# Arxiv Papers Dashboard

A standalone LAN dashboard that surfaces arXiv papers with a filterable,
sortable table (title, short summary, arXiv subjects, interest categories,
relevance score, citations) drawn from the arXiv pipeline SQLite database.

This is the **papers-table dashboard** extracted from the personal
jarvis-lite home dashboard, published as its own small FastAPI app so it can
be redeployed anywhere.

## What it shows

- **Papers table** — Title → arxiv.org link, 180-char summary with full text
  on hover, published date, arXiv subject codes, pipeline interest categories,
  a numeric **interest score** (color-hot ≥10 / warm ≥5), and citation count.
  Deep-dived papers get a ★ next to the title.
- **Filters** — keyword (title/summary), interest category dropdown, multi-select
  arXiv subjects, date range, min interest score. Columns sort on click.
- **Subject Legend** — a tab listing the full arXiv taxonomy grouped by archive,
  with ● marking subjects present in your library.
- **Weekly outputs** — a second panel listing the latest pipeline briefing /
  deep-dive text files with previews.

Scores and categories are computed by the upstream arXiv pipeline (the cron job
that writes `arxiv_papers.db`); this dashboard only reads and renders them.
Data is served read-only; missing sources degrade to a friendly message, not a
500.

## Data source

The dashboard reads the arXiv pipeline's SQLite database directly (read-only):

| Env var | Default |
|---|---|
| `ARXIV_DB` | `~/.hermes/datasets/arxiv/arxiv_papers.db` |
| `ARXIV_BRIEFING_DIR` | `/mnt/g/My Drive/05_Work/Arxiv Briefings` |
| `ARXIV_DEEPDIVE_DIR` | `/mnt/g/My Drive/05_Work/Arxiv Deep Dives` |

Point `ARXIV_DB` at wherever your pipeline writes its DB and it works with no
other config.

## Run

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn server.app:app --host 0.0.0.0 --port 8010
```

`--host 0.0.0.0` makes it reachable from other machines on the LAN
(which this dashboard is built for). Open `http://<host>:8010/`.

### systemd (user service)

```ini
[Unit]
Description=Arxiv Papers Dashboard
After=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/arxiv-dashboard
ExecStart=/opt/arxiv-dashboard/.venv/bin/python -m uvicorn server.app:app --host 0.0.0.0 --port 8010
Restart=always

[Install]
WantedBy=default.target
```

## Notes

- No data files are committed — this is code only. The `.gitignore` keeps the
  DB, caches, and any local outputs out.
- API contracts: `GET /api/papers`, `GET /api/briefings`, `GET /api/health`.