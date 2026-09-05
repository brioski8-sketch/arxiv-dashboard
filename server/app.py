"""arxiv-dashboard — standalone LAN dashboard for the arxiv pipeline papers table.

Serves a filterable, sortable table (title, short summary, categories, interest
score, citations) backed by the arxiv pipeline's SQLite DB, plus the weekly
briefing / deep-dive text outputs.

The DB is opened read-only. If a source is missing the API degrades to
{"error": ...} with HTTP 200 (dashboard degradation contract) instead of 500.

Paths are env-overridable:
  ARXIV_DB          default ~/.hermes/datasets/arxiv/arxiv_papers.db
  ARXIV_BRIEFING_DIR  default "/mnt/g/My Drive/05_Work/Arxiv Briefings"
  ARXIV_DEEPDIVE_DIR  default "/mnt/g/My Drive/05_Work/Arxiv Deep Dives"

Run:  uvicorn server.app:app --host 0.0.0.0 --port 8010
"""
from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

ARXIV_DB = Path(os.environ.get(
    "ARXIV_DB",
    str(Path.home() / ".hermes" / "datasets" / "arxiv" / "arxiv_papers.db"),
))
BRIEFING_DIR = Path(os.environ.get(
    "ARXIV_BRIEFING_DIR", "/mnt/g/My Drive/05_Work/Arxiv Briefings"))
DEEP_DIVE_DIR = Path(os.environ.get(
    "ARXIV_DEEPDIVE_DIR", "/mnt/g/My Drive/05_Work/Arxiv Deep Dives"))

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(title="arxiv-dashboard", docs_url=None, redoc_url=None)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _latest_files(directory: Path, pattern: str, limit: int = 4) -> list[dict]:
    """Newest files matching pattern, with a short text preview."""
    if not directory.is_dir():
        return []
    files = sorted(directory.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)[:limit]
    out = []
    for p in files:
        try:
            text = p.read_text(errors="replace")[:4000]
        except Exception as exc:
            text = f"(unreadable: {exc})"
        out.append({
            "name": p.name,
            "ts": datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).isoformat(),
            "preview": text,
        })
    return out


@app.get("/api/papers")
def api_papers() -> dict:
    """Papers table: title, short summary, categories, interest score.

    Reads the arxiv pipeline DB directly (live, cheap). Serves all papers;
    filtering/sorting happens client-side.
    """
    try:
        con = sqlite3.connect(f"file:{ARXIV_DB}?mode=ro", uri=True)
        con.row_factory = sqlite3.Row
        rows = con.execute(
            "SELECT arxiv_id, title, summary, published, ingested_at, "
            "relevance_score, relevance_categories, categories, citation_count, "
            "influential_citation_count, deep_dived "
            "FROM papers"
        ).fetchall()
        con.close()
        papers = []
        for r in rows:
            s = (r["summary"] or "").replace("\n", " ").strip()
            papers.append({
                "arxiv_id": r["arxiv_id"],
                "title": r["title"],
                "summary": s,
                "published": r["published"],
                "relevance_score": r["relevance_score"] or 0,
                "categories": [c for c in (r["relevance_categories"] or "").split(",") if c],
                "arxiv_subjects": [c.strip() for c in (r["categories"] or "").replace(";", ",").split(",") if c.strip()],
                "citation_count": r["citation_count"] or 0,
                "influential_citation_count": r["influential_citation_count"] or 0,
                "deep_dived": bool(r["deep_dived"]),
            })
        return {"updated_at": _now_iso(), "count": len(papers), "papers": papers}
    except Exception as exc:
        return {"updated_at": _now_iso(), "error": f"arxiv papers db unavailable: {exc}"}


@app.get("/api/briefings")
def api_briefings() -> dict:
    """Weekly briefing + deep-dive text outputs (latest few, with preview)."""
    return {
        "updated_at": _now_iso(),
        "briefings": _latest_files(BRIEFING_DIR, "short_2026*.txt"),
        "deep_dives": _latest_files(DEEP_DIVE_DIR, "short_deep_dive_2026*.txt"),
    }


@app.get("/api/health")
def api_health() -> dict:
    return {
        "ok": ARXIV_DB.exists(),
        "db": str(ARXIV_DB),
        "updated_at": _now_iso(),
    }


# Static frontend last so /api/* wins.
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
