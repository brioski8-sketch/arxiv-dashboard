/* ---- arxiv-dashboard frontend ----
   Filterable, sortable papers table (title, summary, subjects, categories,
   interest score, citations) rendered client-side. Data comes from
   /api/papers (reads the arxiv pipeline DB). */

function getJSON(url) {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  });
}

const ARXIV_SUBJECT_LEGEND = {
  "astro-ph": { name: "Astrophysics", subjects: {
    "astro-ph.CO": "Cosmology and Nongalactic Astrophysics",
    "astro-ph.EP": "Earth and Planetary Astrophysics",
    "astro-ph.GA": "Astrophysics of Galaxies",
    "astro-ph.HE": "High Energy Astrophysical Phenomena",
    "astro-ph.IM": "Instrumentation and Methods for Astrophysics",
    "astro-ph.SR": "Solar and Stellar Astrophysics",
  }},
  "cond-mat": { name: "Condensed Matter", subjects: {
    "cond-mat.dis-nn": "Disordered Systems and Neural Networks",
    "cond-mat.mes-hall": "Mesoscale and Nanoscale Physics",
    "cond-mat.mtrl-sci": "Materials Science",
    "cond-mat.other": "Other Condensed Matter",
    "cond-mat.quant-gas": "Quantum Gases",
    "cond-mat.soft": "Soft Condensed Matter",
    "cond-mat.stat-mech": "Statistical Mechanics",
    "cond-mat.str-el": "Strongly Correlated Electrons",
    "cond-mat.supr-con": "Superconductivity",
  }},
  "cs": { name: "Computing Research Repository (Computer Science)", subjects: {
    "cs.AI": "Artificial Intelligence",
    "cs.AR": "Hardware Architecture",
    "cs.CC": "Computational Complexity",
    "cs.CE": "Computational Engineering, Finance, and Science",
    "cs.CG": "Computational Geometry",
    "cs.CL": "Computation and Language (NLP)",
    "cs.CR": "Cryptography and Security",
    "cs.CV": "Computer Vision and Pattern Recognition",
    "cs.CY": "Computers and Society",
    "cs.DB": "Databases",
    "cs.DC": "Distributed, Parallel, and Cluster Computing",
    "cs.DL": "Digital Libraries",
    "cs.DM": "Discrete Mathematics",
    "cs.DS": "Data Structures and Algorithms",
    "cs.ET": "Emerging Technologies",
    "cs.FL": "Formal Languages and Automata Theory",
    "cs.GR": "Graphics",
    "cs.GT": "Computer Science and Game Theory",
    "cs.HC": "Human-Computer Interaction",
    "cs.IR": "Information Retrieval",
    "cs.IT": "Information Theory",
    "cs.LG": "Machine Learning",
    "cs.MA": "Multiagent Systems",
    "cs.MM": "Multimedia",
    "cs.MS": "Mathematical Software",
    "cs.NA": "Numerical Analysis",
    "cs.NE": "Neural and Evolutionary Computing",
    "cs.NI": "Networking and Internet Architecture",
    "cs.OH": "Other Computer Science",
    "cs.PF": "Performance",
    "cs.PL": "Programming Languages",
    "cs.RO": "Robotics",
    "cs.SC": "Symbolic Computation",
    "cs.SD": "Sound",
    "cs.SE": "Software Engineering",
    "cs.SI": "Social and Information Networks",
    "cs.SY": "Systems and Control",
  }},
  "econ": { name: "Economics", subjects: {
    "econ.EM": "Econometrics",
    "econ.GN": "General Economics",
    "econ.TH": "Theoretical Economics",
  }},
  "eess": { name: "Electrical Engineering and Systems Science", subjects: {
    "eess.AS": "Audio and Speech Processing",
    "eess.IV": "Image and Video Processing",
    "eess.SP": "Signal Processing",
    "eess.SY": "Systems and Control",
  }},
  "math": { name: "Mathematics", subjects: {
    "math.AC": "Commutative Algebra",
    "math.AG": "Algebraic Geometry",
    "math.AP": "Analysis of PDEs",
    "math.AT": "Algebraic Topology",
    "math.CA": "Classical Analysis and ODEs",
    "math.CO": "Combinatorics",
    "math.CT": "Category Theory",
    "math.CV": "Complex Variables",
    "math.DG": "Differential Geometry",
    "math.DS": "Dynamical Systems",
    "math.FA": "Functional Analysis",
    "math.GM": "General Mathematics",
    "math.GN": "General Topology",
    "math.GR": "Group Theory",
    "math.GT": "Geometric Topology",
    "math.HO": "History and Overview",
    "math.KT": "K-Theory and Homology",
    "math.LO": "Logic",
    "math.MG": "Metric Geometry",
    "math.MP": "Mathematical Physics",
    "math.NA": "Numerical Analysis",
    "math.NT": "Number Theory",
    "math.OA": "Operator Algebras",
    "math.OC": "Optimization and Control",
    "math.PR": "Probability",
    "math.QA": "Quantum Algebra",
    "math.RA": "Rings and Algebras",
    "math.RT": "Representation Theory",
    "math.SG": "Symplectic Geometry",
    "math.SP": "Spectral Theory",
    "math.ST": "Statistics Theory",
  }},
  "q-bio": { name: "Quantitative Biology", subjects: {
    "q-bio.BM": "Biomolecules",
    "q-bio.CB": "Cell Behavior",
    "q-bio.GN": "Genomics",
    "q-bio.MN": "Molecular Networks",
    "q-bio.NC": "Neurons and Cognition",
    "q-bio.OT": "Other Quantitative Biology",
    "q-bio.PE": "Populations and Evolution",
    "q-bio.QM": "Quantitative Methods",
    "q-bio.SC": "Quantitative Methods",
    "q-bio.TO": "Tissues and Organs",
  }},
  "q-fin": { name: "Quantitative Finance", subjects: {
    "q-fin.CP": "Computational Finance",
    "q-fin.EC": "Economics",
    "q-fin.GN": "General Finance",
    "q-fin.MF": "Mathematical Finance",
    "q-fin.PM": "Portfolio Management",
    "q-fin.PR": "Pricing of Securities",
    "q-fin.RM": "Risk Management",
    "q-fin.ST": "Statistical Finance",
    "q-fin.TR": "Trading and Market Microstructure",
  }},
  "stat": { name: "Statistics", subjects: {
    "stat.AP": "Applications",
    "stat.CO": "Computation",
    "stat.ME": "Methodology",
    "stat.ML": "Machine Learning",
    "stat.OT": "Other Statistics",
    "stat.TH": "Theory",
  }},
  "physics": { name: "Physics (other)", subjects: {
    "physics.acc-ph": "Accelerator Physics",
    "physics.ao-ph": "Atmospheric and Oceanic Physics",
    "physics.app-ph": "Applied Physics",
    "physics.atm-clus": "Atomic and Molecular Clusters",
    "physics.atom-ph": "Atomic Physics",
    "physics.bio-ph": "Biological Physics",
    "physics.chem-ph": "Chemical Physics",
    "physics.class-ph": "Classical Physics",
    "physics.comp-ph": "Computational Physics",
    "physics.data-an": "Data Analysis, Statistics and Probability",
    "physics.ed-ph": "Physics Education",
    "physics.flu-dyn": "Fluid Dynamics",
    "physics.gen-ph": "General Physics",
    "physics.geo-ph": "Geophysics",
    "physics.hist-ph": "History and Philosophy of Physics",
    "physics.ins-det": "Instrumentation and Detection",
    "physics.med-ph": "Medical Physics",
    "physics.optics": "Optics",
    "physics.plasm-ph": "Plasma Physics",
    "physics.pop-ph": "Popular Physics",
    "physics.soc-ph": "Physics and Society",
    "physics.space-ph": "Space Physics",
  }},
  "gr-qc": { name: "General Relativity and Quantum Cosmology", subjects: {} },
  "hep-ex": { name: "High Energy Physics - Experiment", subjects: {} },
  "hep-lat": { name: "High Energy Physics - Lattice", subjects: {} },
  "hep-ph": { name: "High Energy Physics - Phenomenology", subjects: {} },
  "hep-th": { name: "High Energy Physics - Theory", subjects: {} },
  "math-ph": { name: "Mathematical Physics", subjects: {} },
  "nlin": { name: "Nonlinear Sciences", subjects: {
    "nlin.AO": "Adaptation and Self-Organizing Systems",
    "nlin.CD": "Chaotic Dynamics",
    "nlin.CG": "Cellular Automata and Lattice Gases",
    "nlin.PS": "Pattern Formation and Solitons",
    "nlin.SI": "Exactly Solvable and Integrable Systems",
  }},
  "nucl-ex": { name: "Nuclear Experiment", subjects: {} },
  "nucl-th": { name: "Nuclear Theory", subjects: {} },
  "quant-ph": { name: "Quantum Physics", subjects: {} },
  "q-alg": { name: "Quantum Algebra (legacy)", subjects: {} },
};

let arxivPapers = [];
let arxivState = {
  sort: "score", dir: "desc",
  q: "", cat: "", subjects: [], from: "", to: "", minScore: 0, PAGE_SIZE: 50, page: 1,
};

function arxivShortSummary(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s;
}

function tr_append(tr, cells) { for (const c of cells) tr.appendChild(c); }

function arxivApplyFilters() {
  const st = arxivState;
  const q = st.q.trim().toLowerCase();
  let list = arxivPapers.filter(p => {
    if (q && !(p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))) return false;
    if (st.cat && !p.categories.includes(st.cat)) return false;
    if (st.subjects.length && !st.subjects.some(s => (p.arxiv_subjects || []).includes(s))) return false;
    if (st.from && p.published < st.from) return false;
    if (st.to && p.published > st.to) return false;
    if (st.minScore > 0 && p.relevance_score < st.minScore) return false;
    return true;
  });
  const dir = st.dir === "asc" ? 1 : -1;
  const key = st.sort;
  list.sort((a, b) => {
    let va, vb;
    if (key === "score") { va = a.relevance_score; vb = b.relevance_score; }
    else if (key === "published") { va = a.published; vb = b.published; }
    else if (key === "citations") { va = a.citation_count; vb = b.citation_count; }
    else { va = (a.title || "").toLowerCase(); vb = (b.title || "").toLowerCase(); }
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
  return list;
}

function arxivRenderTable() {
  const w = document.getElementById("widget-arxiv");
  if (!w) return;
  const host = w.querySelector(".arxiv-pane-papers");
  if (!host) return;
  for (const n of [...host.querySelectorAll(".src, .arxiv-table, .arxiv-pager")]) n.remove();
  const body = host;
  const st = arxivState;
  const list = arxivApplyFilters();

  const count = document.createElement("div");
  count.className = "src";
  const total = arxivPapers.length;
  count.textContent = `${list.length} of ${total} papers` +
    (list.length ? ` · showing ${Math.min(st.page, Math.max(1, Math.ceil(list.length / st.PAGE_SIZE))) * st.PAGE_SIZE - st.PAGE_SIZE + 1}–${Math.min(list.length, st.page * st.PAGE_SIZE)}` : "");
  body.appendChild(count);

  const tbl = document.createElement("table");
  tbl.className = "arxiv-table";

  const cols = [
    { key: "title", label: "Title" },
    { key: null, label: "Summary" },
    { key: "published", label: "Published" },
    { key: null, label: "arXiv Subjects" },
    { key: null, label: "Interest Categories" },
    { key: "score", label: "Interest" },
    { key: "citations", label: "Cites" },
  ];
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  for (const c of cols) {
    const th = document.createElement("th");
    if (c.key) {
      th.className = "sortable";
      th.textContent = (st.sort === c.key ? (st.dir === "asc" ? "▲ " : "▼ ") : "") + c.label;
      th.addEventListener("click", () => {
        if (st.sort === c.key) st.dir = st.dir === "asc" ? "desc" : "asc";
        else { st.sort = c.key; st.dir = "desc"; }
        st.page = 1;
        arxivRenderTable();
      });
    } else th.textContent = c.label;
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  tbl.appendChild(thead);

  const tbody = document.createElement("tbody");
  const start = (st.page - 1) * st.PAGE_SIZE;
  for (const p of list.slice(start, start + st.PAGE_SIZE)) {
    const tr = document.createElement("tr");
    const tdTitle = document.createElement("td");
    tdTitle.className = "arxiv-title";
    const a = document.createElement("a");
    a.href = "https://arxiv.org/abs/" + String(p.arxiv_id).split("/abs/").pop();
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = p.title || p.arxiv_id;
    if (p.deep_dived) a.textContent += " ★";
    tdTitle.appendChild(a);
    const tdSum = document.createElement("td");
    tdSum.className = "arxiv-summary";
    tdSum.title = p.summary || "";
    tdSum.textContent = arxivShortSummary(p.summary, 180);
    const tdPub = document.createElement("td");
    tdPub.textContent = p.published;
    const tdSub = document.createElement("td");
    tdSub.className = "arxiv-cats";
    tdSub.textContent = (p.arxiv_subjects || []).join(", ");
    const tdCat = document.createElement("td");
    tdCat.className = "arxiv-cats";
    tdCat.textContent = p.categories.join(", ");
    const tdScore = document.createElement("td");
    tdScore.className = "arxiv-score";
    tdScore.textContent = p.relevance_score;
    if (p.relevance_score >= 10) tdScore.classList.add("hot");
    else if (p.relevance_score >= 5) tdScore.classList.add("warm");
    const tdCit = document.createElement("td");
    tdCit.textContent = p.citation_count;
    tr_append(tr, [tdTitle, tdSum, tdPub, tdSub, tdCat, tdScore, tdCit]);
    tbody.appendChild(tr);
  }
  tbl.appendChild(tbody);
  body.appendChild(tbl);

  const pages = Math.max(1, Math.ceil(list.length / st.PAGE_SIZE));
  if (pages > 1) {
    const pager = document.createElement("div");
    pager.className = "arxiv-pager";
    const prev = document.createElement("button");
    prev.textContent = "‹ Prev";
    prev.disabled = st.page <= 1;
    prev.onclick = () => { st.page--; arxivRenderTable(); };
    const next = document.createElement("button");
    next.textContent = "Next ›";
    next.disabled = st.page >= pages;
    next.onclick = () => { st.page++; arxivRenderTable(); };
    const lbl = document.createElement("span");
    lbl.textContent = ` page ${st.page} / ${pages} `;
    pager.appendChild(prev); pager.appendChild(lbl); pager.appendChild(next);
    body.appendChild(pager);
  }
}

function arxivFilterBar() {
  const bar = document.createElement("div");
  bar.className = "arxiv-filters";
  const mk = (labelText, el) => {
    const wrap = document.createElement("label");
    wrap.className = "arxiv-filter";
    const span = document.createElement("span");
    span.textContent = labelText;
    wrap.appendChild(span);
    wrap.appendChild(el);
    bar.appendChild(wrap);
    return el;
  };
  const q = document.createElement("input");
  q.type = "search"; q.placeholder = "keyword…";
  q.value = arxivState.q;
  let qT; q.addEventListener("input", () => {
    clearTimeout(qT);
    qT = setTimeout(() => { arxivState.q = q.value; arxivState.page = 1; arxivRenderTable(); }, 250);
  });
  mk("Keyword", q);

  const cat = document.createElement("select");
  const cats = [...new Set(arxivPapers.flatMap(p => p.categories))].sort();
  cat.appendChild(new Option("All categories", ""));
  for (const c of cats) cat.appendChild(new Option(c, c));
  cat.value = arxivState.cat;
  cat.addEventListener("change", () => { arxivState.cat = cat.value; arxivState.page = 1; arxivRenderTable(); });
  mk("Category", cat);

  const subjWrap = document.createElement("div");
  subjWrap.className = "arxiv-filter arxiv-subj-filter";
  const subjLabel = document.createElement("span");
  subjLabel.textContent = "arXiv Subjects";
  subjWrap.appendChild(subjLabel);
  subjWrap.appendChild(arxivSubjectMultiSelect());
  bar.appendChild(subjWrap);

  const from = document.createElement("input");
  from.type = "date"; from.value = arxivState.from;
  from.addEventListener("change", () => { arxivState.from = from.value; arxivState.page = 1; arxivRenderTable(); });
  mk("From", from);

  const to = document.createElement("input");
  to.type = "date"; to.value = arxivState.to;
  to.addEventListener("change", () => { arxivState.to = to.value; arxivState.page = 1; arxivRenderTable(); });
  mk("To", to);

  const ms = document.createElement("select");
  ms.appendChild(new Option("Any score", "0"));
  for (const v of [1, 3, 5, 10, 15]) ms.appendChild(new Option("≥ " + v, String(v)));
  ms.value = String(arxivState.minScore);
  ms.addEventListener("change", () => { arxivState.minScore = parseInt(ms.value, 10) || 0; arxivState.page = 1; arxivRenderTable(); });
  mk("Min score", ms);

  const reset = document.createElement("button");
  reset.textContent = "Reset";
  reset.onclick = () => {
    arxivState = { ...arxivState, q: "", cat: "", subjects: [], from: "", to: "", minScore: 0, page: 1 };
    arxivRenderTable();
  };
  bar.appendChild(reset);
  return bar;
}

/* multi-select dropdown for arXiv subjects: button + checkbox panel */
function arxivSubjectMultiSelect() {
  const st = arxivState;
  const container = document.createElement("div");
  container.className = "arxiv-ms";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "arxiv-ms-btn";
  const updateBtn = () => {
    btn.textContent = st.subjects.length
      ? `${st.subjects.length} subject${st.subjects.length > 1 ? "s" : ""} selected`
      : "All arXiv subjects";
  };
  updateBtn();

  const panel = document.createElement("div");
  panel.className = "arxiv-ms-panel";

  const subjects = [...new Set(arxivPapers.flatMap(p => p.arxiv_subjects || []))].sort();

  const applyAndRender = () => {
    updateBtn();
    arxivState.page = 1;
    arxivRenderTable();
    for (const cb of panel.querySelectorAll("input[type=checkbox]")) {
      cb.checked = st.subjects.includes(cb.value);
    }
  };

  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "filter subjects…";
  search.className = "arxiv-ms-search";
  let qT;
  search.addEventListener("input", () => {
    clearTimeout(qT);
    qT = setTimeout(() => {
      const needle = search.value.trim().toLowerCase();
      for (const lab of panel.querySelectorAll("label.arxiv-ms-item")) {
        lab.style.display = !needle || lab.dataset.sub.includes(needle) ? "" : "none";
      }
    }, 150);
  });
  panel.appendChild(search);

  const actions = document.createElement("div");
  actions.className = "arxiv-ms-actions";
  const clear = document.createElement("button");
  clear.type = "button";
  clear.textContent = "Clear";
  clear.onclick = () => { st.subjects = []; applyAndRender(); };
  const all = document.createElement("button");
  all.type = "button";
  all.textContent = "Select all shown";
  all.onclick = () => {
    for (const lab of panel.querySelectorAll("label.arxiv-ms-item")) {
      if (lab.style.display !== "none" && !st.subjects.includes(lab.dataset.sub)) st.subjects.push(lab.dataset.sub);
    }
    applyAndRender();
  };
  actions.appendChild(clear); actions.appendChild(all);
  panel.appendChild(actions);

  for (const s of subjects) {
    const lab = document.createElement("label");
    lab.className = "arxiv-ms-item";
    lab.dataset.sub = s.toLowerCase();
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = s;
    cb.checked = st.subjects.includes(s);
    cb.addEventListener("change", () => {
      if (cb.checked) { if (!st.subjects.includes(s)) st.subjects.push(s); }
      else st.subjects = st.subjects.filter(x => x !== s);
      applyAndRender();
    });
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(" " + s));
    panel.appendChild(lab);
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) panel.classList.remove("open");
  });

  container.appendChild(btn);
  container.appendChild(panel);
  return container;
}

/* Subject Legend tab: full arXiv taxonomy grouped by archive */
function arxivLegend() {
  const pane = document.createElement("div");
  pane.className = "arxiv-legend";
  const present = new Set(arxivPapers.flatMap(p => p.arxiv_subjects || []));
  const note = document.createElement("p");
  note.className = "src";
  note.textContent = "arXiv's native subject classification, grouped by archive. Subjects present in your library are marked ●.";
  pane.appendChild(note);
  for (const [archive, info] of Object.entries(ARXIV_SUBJECT_LEGEND)) {
    const sec = document.createElement("section");
    sec.className = "arxiv-legend-sec";
    const h = document.createElement("h3");
    h.textContent = info.name;
    sec.appendChild(h);
    const dl = document.createElement("dl");
    const entries = Object.keys(info.subjects || {}).length
      ? Object.entries(info.subjects)
      : [[archive, info.name + " (archive)"]];
    for (const [sub, label] of entries) {
      const dt = document.createElement("dt");
      dt.textContent = (present.has(sub) ? "● " : "") + sub;
      if (present.has(sub)) dt.classList.add("present");
      const dd = document.createElement("dd");
      dd.textContent = label;
      dl.appendChild(dt); dl.appendChild(dd);
    }
    sec.appendChild(dl);
    pane.appendChild(sec);
  }
  return pane;
}

async function loadArxiv() {
  const w = document.getElementById("widget-arxiv");
  const body = w.querySelector(".widget-body");
  try {
    const d = await getJSON("/api/papers");
    if (d.error) { body.textContent = "Source unavailable: " + d.error; return; }
    arxivPapers = d.papers || [];
    document.getElementById("paper-count").textContent = d.count + " papers";
    body.textContent = "";

    const strip = document.createElement("div");
    strip.className = "arxiv-tabs";
    const tabPapers = document.createElement("button");
    tabPapers.type = "button"; tabPapers.className = "tab active"; tabPapers.textContent = "Papers";
    const tabLegend = document.createElement("button");
    tabLegend.type = "button"; tabLegend.className = "tab"; tabLegend.textContent = "Subject Legend";
    const panePapers = document.createElement("div");
    panePapers.className = "arxiv-pane-papers";
    const paneLegend = document.createElement("div");
    paneLegend.className = "arxiv-pane-legend";
    paneLegend.hidden = true;
    function show(tab) {
      panePapers.hidden = tab !== "papers";
      paneLegend.hidden = tab !== "legend";
      tabPapers.classList.toggle("active", tab === "papers");
      tabLegend.classList.toggle("active", tab === "legend");
    }
    tabPapers.onclick = () => show("papers");
    tabLegend.onclick = () => show("legend");
    strip.appendChild(tabPapers); strip.appendChild(tabLegend);
    body.appendChild(strip);
    panePapers.appendChild(arxivFilterBar());
    body.appendChild(panePapers);
    paneLegend.appendChild(arxivLegend());
    body.appendChild(paneLegend);
    arxivRenderTable();
  } catch (err) {
    body.textContent = "Source unavailable: " + err.message;
  }
}

async function loadBriefings() {
  const body = document.getElementById("widget-briefings").querySelector(".widget-body");
  try {
    const d = await getJSON("/api/briefings");
    if (d.error) { body.textContent = "Source unavailable: " + d.error; return; }
    body.textContent = "";
    for (const f of (d.briefings || []).slice(0, 3)) {
      const det = document.createElement("details");
      const sum = document.createElement("summary");
      sum.textContent = "Briefing · " + f.name;
      const pre = document.createElement("pre");
      pre.className = "scrollable";
      pre.textContent = f.preview;
      det.appendChild(sum); det.appendChild(pre);
      body.appendChild(det);
    }
    for (const f of (d.deep_dives || []).slice(0, 3)) {
      const det = document.createElement("details");
      const sum = document.createElement("summary");
      sum.textContent = "Deep dive · " + f.name;
      const pre = document.createElement("pre");
      pre.className = "scrollable";
      pre.textContent = f.preview;
      det.appendChild(sum); det.appendChild(pre);
      body.appendChild(det);
    }
    if (!d.briefings.length && !d.deep_dives.length) body.textContent = "No outputs found yet.";
  } catch (err) {
    body.textContent = "Source unavailable: " + err.message;
  }
}

async function refresh() {
  await Promise.all([loadArxiv(), loadBriefings()]);
  document.getElementById("last-refresh").textContent = "refreshed " + new Date().toLocaleTimeString();
}
refresh();
setInterval(refresh, 1800000);