#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$HOME/03.civilization-development/06.streaming-os"
WATCH="$ROOT/StreamWatch"

mkdir -p \
  "$ROOT" \
  "$WATCH/docs" \
  "$WATCH/web" \
  "$WATCH/sql" \
  "$WATCH/scripts" \
  "$WATCH/supabase/functions/streamwatch-phase1"

cat > "$WATCH/docs/000_STREAMWATCH_IMPLEMENTATION_ROADMAP.md" <<'DOC'
# ============================================================
# STREAMWATCH IMPLEMENTATION ROADMAP
# ============================================================

status: phase1-bootstrap-generated
system: StreamingOS
app: StreamWatch
owner: Boss
prepared_by: Zero
schema: streaming
db_target: PERSONA_DATABASE_URL

source_of_truth:
- updated integrated file loaded in this chat
- phase1 additive scope freeze
- api exact contract
- request response examples

phase_1_scope:
  database:
    - streaming.viewer_profile_records
    - streaming.viewer_progress_states
    - streaming.category_tree_nodes
    - streaming.cast_handoff_sessions
  screens:
    - profile_picker
    - viewer_home
    - viewer_library_home
    - viewer_series_detail
    - tv_connect_sheet
    - restriction_gate
  api:
    - /streamwatch/profile/list
    - /streamwatch/profile/select
    - /streamwatch/home-feed/read
    - /streamwatch/category-tree/read
    - /streamwatch/library/read
    - /streamwatch/progress/upsert
    - /streamwatch/tv-handoff/start
    - /streamwatch/tv-handoff/claim
    - /streamwatch/entitlement/read
    - /streamwatch/membership/join/execute

deferred:
- dedicated favorites tables
- dedicated watch-later tables
- offline download ownership
- drm download behavior
- guardian override pin model
- gifting and party-watch

fixed_rules:
- profile context is explicit when continuity matters
- progress truth is separate from history truth
- entitlement read is authoritative for CTA resolution
- tv handoff is distinct from same-device large-screen mode
- favorites and watch later remain interpreted lists in phase1
DOC

cat > "$WATCH/docs/010_STREAMWATCH_PHASE1_BOUNDARY.md" <<'DOC'
# ============================================================
# STREAMWATCH PHASE1 BOUNDARY
# ============================================================

status: implementation-boundary
system: StreamingOS
app: StreamWatch
schema: streaming
phase: phase1

in_scope:
- viewer profile separation
- category tree browse
- home feed read starter
- library home starter
- progress upsert
- tv handoff start and claim
- entitlement read starter
- membership join execute starter
- purchase and rental CTA placeholder handling in UI

out_of_scope:
- real billing settlement execution
- real media playback engine
- real cast device discovery
- drm download
- dedicated favorite canonical table
- dedicated watch later canonical table
- party watch and gifting

review_rule:
- SQL must be reviewed by Sato (DB) before production apply
DOC

cat > "$WATCH/web/index.html" <<'DOC'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>StreamWatch Phase1</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">StreamWatch</div>
      <div class="profile-box">
        <label for="profileSelect">Profile</label>
        <select id="profileSelect"></select>
      </div>
    </header>

    <nav class="mobile-nav">
      <button class="nav active" data-screen="home">Home</button>
      <button class="nav" data-screen="category">Category</button>
      <button class="nav" data-screen="search">Search</button>
      <button class="nav" data-screen="library">Library</button>
      <button class="nav" data-screen="following">Following</button>
    </nav>

    <main>
      <section id="home" class="screen active">
        <h1>Home</h1>
        <div class="grid two">
          <article class="card">
            <h2>Featured</h2>
            <div id="featuredList" class="stack"></div>
          </article>
          <article class="card">
            <h2>Continue Watching</h2>
            <div id="continueList" class="stack"></div>
          </article>
        </div>
        <div class="grid two">
          <article class="card">
            <h2>Live Now</h2>
            <div id="liveList" class="stack"></div>
          </article>
          <article class="card">
            <h2>Recommendations</h2>
            <div id="recommendList" class="stack"></div>
          </article>
        </div>
      </section>

      <section id="category" class="screen">
        <h1>Category Tree</h1>
        <div class="grid two">
          <article class="card">
            <h2>Tree</h2>
            <div id="categoryTree" class="stack"></div>
          </article>
          <article class="card">
            <h2>Selected Branch Result</h2>
            <div id="categoryResult" class="stack"></div>
          </article>
        </div>
      </section>

      <section id="search" class="screen">
        <h1>Search</h1>
        <article class="card">
          <label for="searchInput">Keyword</label>
          <input id="searchInput" type="text" placeholder="series, creator, live, archive" />
          <div id="searchResult" class="stack top-gap"></div>
        </article>
      </section>

      <section id="library" class="screen">
        <h1>Library</h1>
        <div class="grid three">
          <article class="card"><h2>Favorites</h2><div id="favoritesList" class="stack"></div></article>
          <article class="card"><h2>Watch Later</h2><div id="watchLaterList" class="stack"></div></article>
          <article class="card"><h2>History</h2><div id="historyList" class="stack"></div></article>
        </div>
        <div class="grid two">
          <article class="card"><h2>Purchased / Entitled</h2><div id="entitledList" class="stack"></div></article>
          <article class="card"><h2>TV Connect</h2><div id="tvConnectBox" class="stack"></div></article>
        </div>
      </section>

      <section id="following" class="screen">
        <h1>Following</h1>
        <article class="card">
          <div id="followingList" class="stack"></div>
        </article>
      </section>
    </main>
  </div>
  <script src="./app.js"></script>
</body>
</html>
DOC

cat > "$WATCH/web/app.css" <<'DOC'
:root {
  color-scheme: dark;
  --bg: #0f1115;
  --panel: #171a21;
  --panel-2: #1f2430;
  --text: #eef2ff;
  --muted: #a9b0c7;
  --line: #2f3648;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Arial, sans-serif;
}
.topbar, .mobile-nav {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--panel);
}
.brand { font-size: 20px; font-weight: 700; }
.profile-box { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.mobile-nav { overflow-x: auto; }
.nav {
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 12px;
}
.nav.active { outline: 2px solid #8ab4ff; }
main { padding: 16px; }
.screen { display: none; }
.screen.active { display: block; }
.grid { display: grid; gap: 16px; margin-bottom: 16px; }
.grid.two { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.grid.three { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
}
.stack { display: grid; gap: 10px; }
.item {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
}
.item .meta { color: var(--muted); font-size: 12px; margin-top: 4px; }
input, select {
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
}
.top-gap { margin-top: 12px; }
DOC

cat > "$WATCH/web/app.js" <<'DOC'
const state = {
  activeScreen: 'home',
  activeProfileId: 'profile-main',
  profiles: [
    { id: 'profile-main', name: 'Boss', restriction: 'standard' },
    { id: 'profile-kid', name: 'Kid', restriction: 'family_safe' }
  ],
  feed: {
    featured: [
      { title: 'Featured Live Concert', reason: 'promoted', cta: 'watch_live' },
      { title: 'Premium Archive Movie', reason: 'ranking_highlight', cta: 'buy_now' }
    ],
    continueWatching: [
      { title: 'Series Episode 8', reason: 'continue_watching', progress: '742 / 1800 sec', cta: 'resume' }
    ],
    liveNow: [
      { title: 'Gaming Championship', reason: 'live_now', cta: 'watch_live' }
    ],
    recommendations: [
      { title: 'Creator Spotlight', reason: 'personalized', cta: 'play_now' }
    ]
  },
  categoryNodes: [
    { id: 'cat-ent', label: 'Entertainment', depth: 0 },
    { id: 'cat-movie', label: 'Movies', depth: 1 },
    { id: 'cat-live', label: 'Live Events', depth: 1 },
    { id: 'cat-edu', label: 'Education', depth: 0 }
  ],
  library: {
    favorites: [
      { title: 'Archived Special Event', note: 'protected playlist interpretation' }
    ],
    watchLater: [
      { title: 'Science Documentary', note: 'protected playlist interpretation' }
    ],
    history: [
      { title: 'Travel Clip', note: 'history fact' }
    ],
    entitled: [
      { title: 'Membership Live Show', note: 'membership_entitled / watch_live' }
    ]
  },
  following: [
    { title: 'Creator Alpha', note: 'live notifications on' },
    { title: 'Channel Beta', note: 'membership available' }
  ]
};

function renderList(id, items, formatter) {
  const root = document.getElementById(id);
  root.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = formatter(item);
    root.appendChild(div);
  });
}

function renderProfiles() {
  const select = document.getElementById('profileSelect');
  select.innerHTML = state.profiles.map(p => `<option value="${p.id}">${p.name} (${p.restriction})</option>`).join('');
  select.value = state.activeProfileId;
  select.onchange = () => {
    state.activeProfileId = select.value;
    const current = state.profiles.find(p => p.id === state.activeProfileId);
    document.getElementById('tvConnectBox').innerHTML = `<div class="item"><strong>Profile switched</strong><div class="meta">active profile: ${current.name} / restriction: ${current.restriction}</div></div>`;
  };
}

function renderHome() {
  renderList('featuredList', state.feed.featured, item => `<strong>${item.title}</strong><div class="meta">reason: ${item.reason} / cta: ${item.cta}</div>`);
  renderList('continueList', state.feed.continueWatching, item => `<strong>${item.title}</strong><div class="meta">${item.reason} / ${item.progress} / cta: ${item.cta}</div>`);
  renderList('liveList', state.feed.liveNow, item => `<strong>${item.title}</strong><div class="meta">${item.reason} / cta: ${item.cta}</div>`);
  renderList('recommendList', state.feed.recommendations, item => `<strong>${item.title}</strong><div class="meta">${item.reason} / cta: ${item.cta}</div>`);
}

function renderCategory() {
  renderList('categoryTree', state.categoryNodes, item => `<strong>${'&nbsp;'.repeat(item.depth * 4)}${item.label}</strong><div class="meta">node_id: ${item.id}</div>`);
  document.getElementById('categoryResult').innerHTML = `<div class="item"><strong>Selected branch result</strong><div class="meta">remembered branch return / breadcrumb / sibling move are phase1 UI requirements</div></div>`;
}

function renderLibrary() {
  renderList('favoritesList', state.library.favorites, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  renderList('watchLaterList', state.library.watchLater, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  renderList('historyList', state.library.history, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  renderList('entitledList', state.library.entitled, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  document.getElementById('tvConnectBox').innerHTML = `<div class="item"><strong>TV Connect Sheet</strong><div class="meta">route handoff must remain distinct from same-device large-screen mode</div></div>`;
}

function renderFollowing() {
  renderList('followingList', state.following, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
}

function bindNavigation() {
  document.querySelectorAll('.nav').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.screen).classList.add('active');
    });
  });
}

function bindSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const pool = [
      ...state.feed.featured,
      ...state.feed.continueWatching,
      ...state.feed.liveNow,
      ...state.feed.recommendations,
      ...state.library.favorites,
      ...state.library.watchLater,
      ...state.library.history
    ];
    const matched = pool.filter(item => item.title.toLowerCase().includes(q));
    const root = document.getElementById('searchResult');
    root.innerHTML = matched.length
      ? matched.map(item => `<div class="item"><strong>${item.title}</strong><div class="meta">phase1 local search mock</div></div>`).join('')
      : `<div class="item"><strong>No result</strong><div class="meta">type movie / live / series / creator</div></div>`;
  });
}

renderProfiles();
renderHome();
renderCategory();
renderLibrary();
renderFollowing();
bindNavigation();
bindSearch();
DOC

cat > "$WATCH/supabase/functions/streamwatch-phase1/index.ts" <<'DOC'
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Payload = Record<string, unknown>;

function json(status: number, body: Payload) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization, apikey, x-client-info"
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return json(200, { ok: true });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: Payload = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const action = String(body.action ?? "");

  switch (action) {
    case "profile_list":
      return json(200, {
        profiles: [
          { viewer_profile_id: "profile-main", display_name: "Boss", restriction_mode: "standard" },
          { viewer_profile_id: "profile-kid", display_name: "Kid", restriction_mode: "family_safe" }
        ]
      });

    case "profile_select":
      return json(200, {
        result: "ok",
        active_viewer_profile_id: body.viewer_profile_id ?? null,
        effective_restriction_context: "standard"
      });

    case "home_feed_read":
      return json(200, {
        feed_scope: body.feed_scope ?? "personalized",
        feed_items: [
          { target_type: "video_asset", target_id: "uuid-demo-1", display_reason: "continue_watching" },
          { target_type: "live_session", target_id: "uuid-demo-2", display_reason: "live_now" }
        ]
      });

    case "category_tree_read":
      return json(200, {
        nodes: [
          { category_node_id: "cat-ent", label: "Entertainment", depth: 0 },
          { category_node_id: "cat-movie", label: "Movies", depth: 1 },
          { category_node_id: "cat-live", label: "Live Events", depth: 1 }
        ]
      });

    case "library_read":
      return json(200, {
        sections: {
          favorites: [{ target_id: "fav-1", title: "Archived Special Event" }],
          watch_later: [{ target_id: "wl-1", title: "Science Documentary" }],
          history: [{ target_id: "his-1", title: "Travel Clip" }],
          entitled: [{ target_id: "ent-1", title: "Membership Live Show" }]
        }
      });

    case "progress_upsert":
      return json(200, {
        result: "ok",
        continuity_state: "in_progress",
        device_mode: body.device_mode ?? null,
        target_id: body.target_id ?? null
      });

    case "tv_handoff_start":
      return json(200, {
        result: "ok",
        handoff_session_id: "handoff-demo-1",
        claim_code: "SW-4821"
      });

    case "tv_handoff_claim":
      return json(200, {
        result: "ok",
        handoff_session_id: body.handoff_session_id ?? null,
        claimed: true
      });

    case "entitlement_read":
      return json(200, {
        target_type: body.target_type ?? "video_asset",
        target_id: body.target_id ?? null,
        entitlement_state: "membership_entitled",
        playback_cta: "watch_live",
        archive_access_flag: true
      });

    case "membership_join_execute":
      return json(200, {
        result: "ok",
        transaction_state: "confirmed",
        entitlement_refresh_required: true
      });

    default:
      return json(400, {
        error: "unknown_action",
        allowed_actions: [
          "profile_list",
          "profile_select",
          "home_feed_read",
          "category_tree_read",
          "library_read",
          "progress_upsert",
          "tv_handoff_start",
          "tv_handoff_claim",
          "entitlement_read",
          "membership_join_execute"
        ]
      });
  }
});
DOC

cat > "$WATCH/sql/001_streamwatch_phase1_core.sql" <<'DOC'
-- ============================================================
-- STREAMWATCH PHASE1 CORE SQL
-- schema: streaming
-- db_target: PERSONA_DATABASE_URL
-- review_required: Sato (DB)
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS streaming;

CREATE TABLE IF NOT EXISTS streaming.viewer_profile_records (
  viewer_profile_id uuid PRIMARY KEY,
  actor_civilization_id uuid NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  preferred_language_code text,
  subtitle_default_code text,
  autoplay_enabled boolean NOT NULL DEFAULT true,
  live_notification_enabled boolean NOT NULL DEFAULT true,
  restriction_mode text NOT NULL,
  age_band text,
  is_default_profile boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_viewer_profile_restriction_mode CHECK (
    restriction_mode IN ('standard','family_safe','teen','restricted')
  )
);

CREATE INDEX IF NOT EXISTS idx_viewer_profile_records_actor
  ON streaming.viewer_profile_records(actor_civilization_id);

CREATE TABLE IF NOT EXISTS streaming.viewer_progress_states (
  progress_state_id uuid PRIMARY KEY,
  actor_civilization_id uuid NOT NULL,
  viewer_profile_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  position_seconds integer NOT NULL DEFAULT 0,
  duration_seconds integer,
  completion_ratio numeric(7,4) NOT NULL DEFAULT 0,
  continuity_state text NOT NULL DEFAULT 'not_started',
  last_device_mode text,
  last_route_context text,
  last_played_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_viewer_progress_states UNIQUE (viewer_profile_id, target_type, target_id),
  CONSTRAINT fk_viewer_progress_states_profile FOREIGN KEY (viewer_profile_id)
    REFERENCES streaming.viewer_profile_records(viewer_profile_id),
  CONSTRAINT chk_viewer_progress_target_type CHECK (
    target_type IN ('video_asset','live_session','archive_asset','clip_asset','series')
  ),
  CONSTRAINT chk_viewer_progress_continuity_state CHECK (
    continuity_state IN ('not_started','in_progress','completed')
  ),
  CONSTRAINT chk_viewer_progress_completion_ratio CHECK (
    completion_ratio >= 0 AND completion_ratio <= 1
  )
);

CREATE INDEX IF NOT EXISTS idx_viewer_progress_states_profile_target
  ON streaming.viewer_progress_states(viewer_profile_id, target_type, target_id);

CREATE TABLE IF NOT EXISTS streaming.category_tree_nodes (
  category_node_id uuid PRIMARY KEY,
  parent_category_node_id uuid,
  root_key text NOT NULL,
  node_key text NOT NULL,
  display_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_category_tree_parent FOREIGN KEY (parent_category_node_id)
    REFERENCES streaming.category_tree_nodes(category_node_id)
);

CREATE INDEX IF NOT EXISTS idx_category_tree_nodes_parent_sort
  ON streaming.category_tree_nodes(parent_category_node_id, sort_order);

CREATE TABLE IF NOT EXISTS streaming.cast_handoff_sessions (
  handoff_session_id uuid PRIMARY KEY,
  actor_civilization_id uuid NOT NULL,
  viewer_profile_id uuid NOT NULL,
  source_device_mode text NOT NULL,
  target_route_kind text NOT NULL,
  target_route_label text,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  resume_position_seconds integer NOT NULL DEFAULT 0,
  subtitle_default_code text,
  audio_default_code text,
  claim_code text NOT NULL,
  claim_state text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_cast_handoff_sessions_profile FOREIGN KEY (viewer_profile_id)
    REFERENCES streaming.viewer_profile_records(viewer_profile_id),
  CONSTRAINT chk_cast_handoff_claim_state CHECK (
    claim_state IN ('pending','claimed','expired','cancelled')
  )
);

CREATE INDEX IF NOT EXISTS idx_cast_handoff_sessions_claim_code
  ON streaming.cast_handoff_sessions(claim_code);

CREATE OR REPLACE FUNCTION streaming.fn_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_viewer_profile_records_touch_updated_at ON streaming.viewer_profile_records;
CREATE TRIGGER trg_viewer_profile_records_touch_updated_at
BEFORE UPDATE ON streaming.viewer_profile_records
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_viewer_progress_states_touch_updated_at ON streaming.viewer_progress_states;
CREATE TRIGGER trg_viewer_progress_states_touch_updated_at
BEFORE UPDATE ON streaming.viewer_progress_states
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_category_tree_nodes_touch_updated_at ON streaming.category_tree_nodes;
CREATE TRIGGER trg_category_tree_nodes_touch_updated_at
BEFORE UPDATE ON streaming.category_tree_nodes
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_cast_handoff_sessions_touch_updated_at ON streaming.cast_handoff_sessions;
CREATE TRIGGER trg_cast_handoff_sessions_touch_updated_at
BEFORE UPDATE ON streaming.cast_handoff_sessions
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

COMMIT;
DOC

cat > "$WATCH/sql/002_streamwatch_phase1_seed.sql" <<'DOC'
BEGIN;

INSERT INTO streaming.viewer_profile_records (
  viewer_profile_id,
  actor_civilization_id,
  display_name,
  preferred_language_code,
  subtitle_default_code,
  restriction_mode,
  is_default_profile
)
VALUES
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Boss','ja','ja','standard',true),
  ('22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Kid','ja','ja','family_safe',false)
ON CONFLICT (viewer_profile_id) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  preferred_language_code = EXCLUDED.preferred_language_code,
  subtitle_default_code = EXCLUDED.subtitle_default_code,
  restriction_mode = EXCLUDED.restriction_mode,
  is_default_profile = EXCLUDED.is_default_profile,
  updated_at = now();

INSERT INTO streaming.category_tree_nodes (
  category_node_id,
  parent_category_node_id,
  root_key,
  node_key,
  display_label,
  sort_order
)
VALUES
  ('30000000-0000-0000-0000-000000000001',NULL,'entertainment','entertainment','Entertainment',10),
  ('30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','entertainment','movies','Movies',20),
  ('30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','entertainment','live-events','Live Events',30),
  ('30000000-0000-0000-0000-000000000004',NULL,'education','education','Education',40)
ON CONFLICT (category_node_id) DO UPDATE
SET
  parent_category_node_id = EXCLUDED.parent_category_node_id,
  root_key = EXCLUDED.root_key,
  node_key = EXCLUDED.node_key,
  display_label = EXCLUDED.display_label,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO streaming.viewer_progress_states (
  progress_state_id,
  actor_civilization_id,
  viewer_profile_id,
  target_type,
  target_id,
  position_seconds,
  duration_seconds,
  completion_ratio,
  continuity_state,
  last_device_mode,
  last_route_context,
  last_played_at
)
VALUES
  ('40000000-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','video_asset','50000000-0000-0000-0000-000000000001',742,1800,0.4122,'in_progress','mobile','local_player',now())
ON CONFLICT (viewer_profile_id, target_type, target_id) DO UPDATE
SET
  position_seconds = EXCLUDED.position_seconds,
  duration_seconds = EXCLUDED.duration_seconds,
  completion_ratio = EXCLUDED.completion_ratio,
  continuity_state = EXCLUDED.continuity_state,
  last_device_mode = EXCLUDED.last_device_mode,
  last_route_context = EXCLUDED.last_route_context,
  last_played_at = EXCLUDED.last_played_at,
  updated_at = now();

INSERT INTO streaming.cast_handoff_sessions (
  handoff_session_id,
  actor_civilization_id,
  viewer_profile_id,
  source_device_mode,
  target_route_kind,
  target_route_label,
  target_type,
  target_id,
  resume_position_seconds,
  subtitle_default_code,
  audio_default_code,
  claim_code,
  claim_state,
  expires_at
)
VALUES
  ('60000000-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','mobile','tv_route','Living Room TV','video_asset','50000000-0000-0000-0000-000000000001',742,'ja','ja','SW-4821','pending',now() + interval '30 minutes')
ON CONFLICT (handoff_session_id) DO UPDATE
SET
  source_device_mode = EXCLUDED.source_device_mode,
  target_route_kind = EXCLUDED.target_route_kind,
  target_route_label = EXCLUDED.target_route_label,
  resume_position_seconds = EXCLUDED.resume_position_seconds,
  claim_code = EXCLUDED.claim_code,
  claim_state = EXCLUDED.claim_state,
  expires_at = EXCLUDED.expires_at,
  updated_at = now();

COMMIT;
DOC

cat > "$WATCH/sql/003_streamwatch_phase1_verify.sql" <<'DOC'
SELECT 'viewer_profile_records' AS table_name, count(*) AS row_count FROM streaming.viewer_profile_records
UNION ALL
SELECT 'viewer_progress_states' AS table_name, count(*) AS row_count FROM streaming.viewer_progress_states
UNION ALL
SELECT 'category_tree_nodes' AS table_name, count(*) AS row_count FROM streaming.category_tree_nodes
UNION ALL
SELECT 'cast_handoff_sessions' AS table_name, count(*) AS row_count FROM streaming.cast_handoff_sessions
ORDER BY table_name;

SELECT
  viewer_profile_id,
  display_name,
  restriction_mode,
  is_default_profile,
  is_active
FROM streaming.viewer_profile_records
ORDER BY display_name;

SELECT
  viewer_profile_id,
  target_type,
  position_seconds,
  duration_seconds,
  completion_ratio,
  continuity_state,
  last_device_mode
FROM streaming.viewer_progress_states
ORDER BY updated_at DESC;

SELECT
  category_node_id,
  parent_category_node_id,
  root_key,
  node_key,
  display_label,
  sort_order
FROM streaming.category_tree_nodes
ORDER BY root_key, sort_order;

SELECT
  handoff_session_id,
  viewer_profile_id,
  target_route_kind,
  target_route_label,
  claim_code,
  claim_state,
  expires_at
FROM streaming.cast_handoff_sessions
ORDER BY created_at DESC;
DOC

cat > "$WATCH/scripts/010_apply_watch_phase1_sql.sh" <<'DOC'
#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

: "${PERSONA_DATABASE_URL:?PERSONA_DATABASE_URL is required}"

echo "============================================================"
echo "STREAMWATCH PHASE1 SQL APPLY"
echo "BASE_DIR = $BASE_DIR"
echo "SQL_DIR  = $SQL_DIR"
echo "DB_ENV   = PERSONA_DATABASE_URL"
echo "REVIEW   = Sato (DB)"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_DIR/001_streamwatch_phase1_core.sql"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_DIR/002_streamwatch_phase1_seed.sql"

echo "DONE: StreamWatch phase1 SQL applied"
DOC
chmod +x "$WATCH/scripts/010_apply_watch_phase1_sql.sh"

cat > "$WATCH/scripts/020_verify_watch_phase1_sql.sh" <<'DOC'
#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

: "${PERSONA_DATABASE_URL:?PERSONA_DATABASE_URL is required}"

echo "============================================================"
echo "STREAMWATCH PHASE1 SQL VERIFY"
echo "BASE_DIR = $BASE_DIR"
echo "SQL_DIR  = $SQL_DIR"
echo "DB_ENV   = PERSONA_DATABASE_URL"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_DIR/003_streamwatch_phase1_verify.sql"
DOC
chmod +x "$WATCH/scripts/020_verify_watch_phase1_sql.sh"

echo "============================================================"
echo "STREAMWATCH PHASE1 BOOTSTRAP DONE"
echo "ROOT  : $ROOT"
echo "WATCH : $WATCH"
echo "FILES :"
find "$WATCH" -maxdepth 3 -type f | sort
echo "============================================================"

