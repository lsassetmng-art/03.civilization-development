begin;

create schema if not exists gameos;

comment on schema gameos is
  'GameOS canonical implementation schema. public schema is not used for GameOS truth.';

create table if not exists gameos.game_workspace (
  id uuid primary key,
  workspace_code text not null unique,
  workspace_name text not null,
  owner_user_id uuid not null,
  default_language_code text not null,
  visibility_status text not null,
  builder_access_status text not null,
  status text not null,
  source_basis_ref text null,
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  archived_at timestamptz null
);

create index if not exists ix_game_workspace_owner_user_id
  on gameos.game_workspace(owner_user_id);

create index if not exists ix_game_workspace_visibility_status
  on gameos.game_workspace(visibility_status);

create table if not exists gameos.game_template_profile (
  id uuid primary key,
  template_profile_code text not null unique,
  template_name text not null,
  runtime_family_code text not null,
  template_family_code text not null,
  seed_payload jsonb not null,
  compatibility_notes text null,
  status text not null,
  version_no integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid null,
  updated_at timestamptz not null default now(),
  updated_by uuid null,
  archived_at timestamptz null
);

create index if not exists ix_game_template_profile_runtime_family_code
  on gameos.game_template_profile(runtime_family_code);

create index if not exists ix_game_template_profile_template_family_code
  on gameos.game_template_profile(template_family_code);

create table if not exists gameos.game_runtime_profile (
  id uuid primary key,
  runtime_profile_code text not null unique,
  runtime_profile_name text not null,
  runtime_family_code text not null,
  engine_family_code text not null,
  language_support_payload jsonb not null,
  device_support_payload jsonb not null,
  export_capability_payload jsonb not null,
  validation_profile_payload jsonb not null,
  status text not null,
  version_no integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid null,
  updated_at timestamptz not null default now(),
  updated_by uuid null,
  archived_at timestamptz null
);

create index if not exists ix_game_runtime_profile_runtime_family_code
  on gameos.game_runtime_profile(runtime_family_code);

create index if not exists ix_game_runtime_profile_engine_family_code
  on gameos.game_runtime_profile(engine_family_code);

create table if not exists gameos.game_project (
  id uuid primary key,
  project_code text not null unique,
  workspace_id uuid not null
    references gameos.game_workspace(id),
  project_name text not null,
  runtime_family_code text not null,
  template_family_code text null,
  template_profile_id uuid null
    references gameos.game_template_profile(id),
  runtime_profile_id uuid not null
    references gameos.game_runtime_profile(id),
  owner_user_id uuid not null,
  latest_revision_id uuid null,
  latest_autosave_snapshot_id uuid null,
  save_state text not null,
  inline_validation_state text not null,
  export_readiness_state text not null,
  publish_readiness_state text not null,
  collaboration_lock_state text not null,
  status text not null,
  source_basis_ref text null,
  version_no integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  archived_at timestamptz null
);

create index if not exists ix_game_project_workspace_id
  on gameos.game_project(workspace_id);

create index if not exists ix_game_project_owner_user_id
  on gameos.game_project(owner_user_id);

create index if not exists ix_game_project_runtime_family_code
  on gameos.game_project(runtime_family_code);

create index if not exists ix_game_project_latest_revision_id
  on gameos.game_project(latest_revision_id);

create index if not exists ix_game_project_publish_readiness_state
  on gameos.game_project(publish_readiness_state);

create table if not exists gameos.game_project_revision (
  id uuid primary key,
  revision_ref text not null unique,
  project_id uuid not null
    references gameos.game_project(id),
  revision_no integer not null,
  basis_revision_id uuid null
    references gameos.game_project_revision(id),
  authored_change_summary text null,
  scene_payload jsonb not null,
  route_payload jsonb not null,
  map_payload jsonb null,
  system_flag_payload jsonb null,
  asset_binding_payload jsonb not null,
  inline_validation_state text not null,
  revision_hash text not null,
  is_autosave_basis boolean not null default false,
  status text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null,
  archived_at timestamptz null,
  unique(project_id, revision_no)
);

create index if not exists ix_game_project_revision_project_id_created_at
  on gameos.game_project_revision(project_id, created_at desc);

create index if not exists ix_game_project_revision_basis_revision_id
  on gameos.game_project_revision(basis_revision_id);

do $gameos_fk$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_game_project_latest_revision'
      and conrelid = 'gameos.game_project'::regclass
  ) then
    alter table gameos.game_project
      add constraint fk_game_project_latest_revision
      foreign key (latest_revision_id)
      references gameos.game_project_revision(id);
  end if;
end
$gameos_fk$;

create table if not exists gameos.game_project_create_idempotency (
  idempotency_key text primary key,
  command_id text not null,
  request_payload jsonb not null,
  project_id uuid not null
    references gameos.game_project(id),
  created_at timestamptz not null default now()
);

comment on table gameos.game_project_create_idempotency is
  'Operational M01 replay-suppression record. It is not gameplay canonical truth.';

alter table gameos.game_workspace enable row level security;
alter table gameos.game_template_profile enable row level security;
alter table gameos.game_runtime_profile enable row level security;
alter table gameos.game_project enable row level security;
alter table gameos.game_project_revision enable row level security;
alter table gameos.game_project_create_idempotency enable row level security;

drop policy if exists game_workspace_owner_read
  on gameos.game_workspace;

create policy game_workspace_owner_read
  on gameos.game_workspace
  for select
  to authenticated
  using (
    owner_user_id = auth.uid()
    and archived_at is null
  );

drop policy if exists game_template_profile_authenticated_read
  on gameos.game_template_profile;

create policy game_template_profile_authenticated_read
  on gameos.game_template_profile
  for select
  to authenticated
  using (
    status = 'active'
    and archived_at is null
  );

drop policy if exists game_runtime_profile_authenticated_read
  on gameos.game_runtime_profile;

create policy game_runtime_profile_authenticated_read
  on gameos.game_runtime_profile
  for select
  to authenticated
  using (
    status = 'active'
    and archived_at is null
  );

drop policy if exists game_project_owner_read
  on gameos.game_project;

create policy game_project_owner_read
  on gameos.game_project
  for select
  to authenticated
  using (
    owner_user_id = auth.uid()
    and archived_at is null
  );

drop policy if exists game_project_revision_owner_read
  on gameos.game_project_revision;

create policy game_project_revision_owner_read
  on gameos.game_project_revision
  for select
  to authenticated
  using (
    exists (
      select 1
      from gameos.game_project project
      where project.id = game_project_revision.project_id
        and project.owner_user_id = auth.uid()
        and project.archived_at is null
    )
  );

create or replace function gameos.create_builder_project(
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = gameos, pg_temp
as $function$
declare
  v_actor uuid := auth.uid();
  v_workspace gameos.game_workspace%rowtype;
  v_runtime gameos.game_runtime_profile%rowtype;
  v_template gameos.game_template_profile%rowtype;
  v_project gameos.game_project%rowtype;
  v_revision gameos.game_project_revision%rowtype;
  v_idem gameos.game_project_create_idempotency%rowtype;

  v_project_id uuid := gen_random_uuid();
  v_revision_id uuid := gen_random_uuid();
  v_revision_ref text :=
    'grev_' || replace(gen_random_uuid()::text, '-', '');

  v_payload_version integer;
  v_command_id text;
  v_idempotency_key text;
  v_workspace_code text;
  v_project_code text;
  v_project_name text;
  v_runtime_family_code text;
  v_runtime_profile_code text;
  v_template_family_code text;
  v_template_profile_code text;
  v_default_language_code text;
  v_seed_payload jsonb := '{}'::jsonb;
begin
  if v_actor is null then
    return jsonb_build_object(
      'errorCode', 'GAME_BUILDER_AUTH_REQUIRED',
      'errorMessage', 'Authenticated Builder authority is required.',
      'errorState', 'denied',
      'details', '{}'::jsonb,
      'retryAllowed', false
    );
  end if;

  v_payload_version :=
    nullif(p_payload ->> 'payloadVersion', '')::integer;

  v_command_id := nullif(trim(p_payload ->> 'commandId'), '');
  v_idempotency_key :=
    nullif(trim(p_payload ->> 'idempotencyKey'), '');
  v_workspace_code :=
    nullif(trim(p_payload ->> 'workspaceCode'), '');
  v_project_code :=
    nullif(trim(p_payload ->> 'projectCode'), '');
  v_project_name :=
    nullif(trim(p_payload ->> 'projectName'), '');
  v_runtime_family_code :=
    nullif(trim(p_payload ->> 'runtimeFamilyCode'), '');
  v_runtime_profile_code :=
    nullif(trim(p_payload ->> 'runtimeProfileCode'), '');
  v_template_family_code :=
    nullif(trim(p_payload ->> 'templateFamilyCode'), '');
  v_template_profile_code :=
    nullif(trim(p_payload ->> 'templateProfileCode'), '');
  v_default_language_code :=
    nullif(trim(p_payload ->> 'defaultLanguageCode'), '');

  if v_payload_version is distinct from 1
    or v_command_id is null
    or v_idempotency_key is null
    or v_workspace_code is null
    or v_project_code is null
    or v_project_name is null
    or v_runtime_family_code is null
    or v_runtime_profile_code is null
    or v_default_language_code is null
  then
    return jsonb_build_object(
      'errorCode', 'GAME_PROJECT_CREATE_REQUEST_INVALID',
      'errorMessage', 'Required create-project request fields are missing or invalid.',
      'errorState', 'failed',
      'details', jsonb_build_object(
        'payloadVersion', v_payload_version
      ),
      'retryAllowed', false
    );
  end if;

  perform pg_advisory_xact_lock(
    hashtext(v_idempotency_key)::bigint
  );

  select *
  into v_idem
  from gameos.game_project_create_idempotency
  where idempotency_key = v_idempotency_key;

  if found then
    if v_idem.request_payload <> p_payload then
      return jsonb_build_object(
        'errorCode', 'GAME_PROJECT_CREATE_IDEMPOTENCY_CONFLICT',
        'errorMessage', 'The idempotency key was already used with a different create intent.',
        'errorState', 'conflict',
        'details', jsonb_build_object(
          'idempotencyKey', v_idempotency_key
        ),
        'retryAllowed', false
      );
    end if;

    select *
    into v_project
    from gameos.game_project
    where id = v_idem.project_id;

    select *
    into v_revision
    from gameos.game_project_revision
    where id = v_project.latest_revision_id;

    return jsonb_build_object(
      'projectCode', v_project.project_code,
      'workspaceCode', v_workspace_code,
      'projectName', v_project.project_name,
      'runtimeFamilyCode', v_project.runtime_family_code,
      'runtimeProfileCode', v_runtime_profile_code,
      'templateProfileCode', v_template_profile_code,
      'latestRevisionRef', v_revision.revision_ref,
      'latestAutosaveSnapshotRef', null,
      'saveState', v_project.save_state,
      'inlineValidationState', v_project.inline_validation_state,
      'exportReadinessState', v_project.export_readiness_state,
      'publishReadinessState', v_project.publish_readiness_state,
      'collaborationLockState', v_project.collaboration_lock_state
    );
  end if;

  select *
  into v_workspace
  from gameos.game_workspace
  where workspace_code = v_workspace_code
    and status = 'active'
    and archived_at is null;

  if not found then
    return jsonb_build_object(
      'errorCode', 'GAME_PROJECT_CREATE_BASIS_INVALID',
      'errorMessage', 'Workspace basis is unavailable.',
      'errorState', 'failed',
      'details', jsonb_build_object(
        'workspaceCode', v_workspace_code
      ),
      'retryAllowed', false
    );
  end if;

  if v_workspace.owner_user_id <> v_actor then
    return jsonb_build_object(
      'errorCode', 'GAME_PROJECT_CREATE_DENIED',
      'errorMessage', 'The authenticated actor does not have M01 create authority for this workspace.',
      'errorState', 'denied',
      'details', jsonb_build_object(
        'workspaceCode', v_workspace_code
      ),
      'retryAllowed', false
    );
  end if;

  select *
  into v_runtime
  from gameos.game_runtime_profile
  where runtime_profile_code = v_runtime_profile_code
    and status = 'active'
    and archived_at is null;

  if not found
    or v_runtime.runtime_family_code <> v_runtime_family_code
  then
    return jsonb_build_object(
      'errorCode', 'GAME_PROJECT_CREATE_BASIS_INVALID',
      'errorMessage', 'Runtime profile is not compatible with the requested runtime family.',
      'errorState', 'failed',
      'details', jsonb_build_object(
        'runtimeFamilyCode', v_runtime_family_code,
        'runtimeProfileCode', v_runtime_profile_code
      ),
      'retryAllowed', false
    );
  end if;

  if v_template_profile_code is not null then
    select *
    into v_template
    from gameos.game_template_profile
    where template_profile_code = v_template_profile_code
      and status = 'active'
      and archived_at is null;

    if not found
      or v_template.runtime_family_code <> v_runtime_family_code
      or (
        v_template_family_code is not null
        and v_template.template_family_code <> v_template_family_code
      )
    then
      return jsonb_build_object(
        'errorCode', 'GAME_PROJECT_CREATE_BASIS_INVALID',
        'errorMessage', 'Runtime profile is not compatible with template profile.',
        'errorState', 'failed',
        'details', jsonb_build_object(
          'runtimeProfileCode', v_runtime_profile_code,
          'templateProfileCode', v_template_profile_code
        ),
        'retryAllowed', false
      );
    end if;

    v_seed_payload := v_template.seed_payload;
  end if;

  if exists (
    select 1
    from gameos.game_project
    where project_code = v_project_code
  ) then
    return jsonb_build_object(
      'errorCode', 'GAME_PROJECT_CODE_ALREADY_EXISTS',
      'errorMessage', 'The requested project code already exists.',
      'errorState', 'conflict',
      'details', jsonb_build_object(
        'projectCode', v_project_code
      ),
      'retryAllowed', false
    );
  end if;

  insert into gameos.game_project (
    id,
    project_code,
    workspace_id,
    project_name,
    runtime_family_code,
    template_family_code,
    template_profile_id,
    runtime_profile_id,
    owner_user_id,
    latest_revision_id,
    latest_autosave_snapshot_id,
    save_state,
    inline_validation_state,
    export_readiness_state,
    publish_readiness_state,
    collaboration_lock_state,
    status,
    source_basis_ref,
    version_no,
    created_by,
    updated_by
  )
  values (
    v_project_id,
    v_project_code,
    v_workspace.id,
    v_project_name,
    v_runtime_family_code,
    v_template_family_code,
    case
      when v_template_profile_code is null then null
      else v_template.id
    end,
    v_runtime.id,
    v_actor,
    null,
    null,
    'draft',
    'not_run',
    'not_ready',
    'not_ready',
    'unlocked',
    'active',
    v_command_id,
    1,
    v_actor,
    v_actor
  );

  insert into gameos.game_project_revision (
    id,
    revision_ref,
    project_id,
    revision_no,
    basis_revision_id,
    authored_change_summary,
    scene_payload,
    route_payload,
    map_payload,
    system_flag_payload,
    asset_binding_payload,
    inline_validation_state,
    revision_hash,
    is_autosave_basis,
    status,
    created_by
  )
  values (
    v_revision_id,
    v_revision_ref,
    v_project_id,
    1,
    null,
    'Initial M01 project seed',
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    jsonb_build_object(
      'templateSeed', v_seed_payload,
      'defaultLanguageCode', v_default_language_code
    ),
    '[]'::jsonb,
    'not_run',
    md5(
      jsonb_build_object(
        'request', p_payload,
        'templateSeed', v_seed_payload
      )::text
    ),
    false,
    'active',
    v_actor
  );

  update gameos.game_project
  set
    latest_revision_id = v_revision_id,
    updated_at = now(),
    updated_by = v_actor
  where id = v_project_id;

  insert into gameos.game_project_create_idempotency (
    idempotency_key,
    command_id,
    request_payload,
    project_id
  )
  values (
    v_idempotency_key,
    v_command_id,
    p_payload,
    v_project_id
  );

  return jsonb_build_object(
    'projectCode', v_project_code,
    'workspaceCode', v_workspace_code,
    'projectName', v_project_name,
    'runtimeFamilyCode', v_runtime_family_code,
    'runtimeProfileCode', v_runtime_profile_code,
    'templateProfileCode', v_template_profile_code,
    'latestRevisionRef', v_revision_ref,
    'latestAutosaveSnapshotRef', null,
    'saveState', 'draft',
    'inlineValidationState', 'not_run',
    'exportReadinessState', 'not_ready',
    'publishReadinessState', 'not_ready',
    'collaborationLockState', 'unlocked'
  );
end
$function$;

create or replace function gameos.builder_bootstrap()
returns jsonb
language sql
security definer
set search_path = gameos, pg_temp
as $function$
  select jsonb_build_object(
    'permissionBasis', 'creator_owner',

    'workspaces',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'workspaceCode', workspace.workspace_code,
            'workspaceName', workspace.workspace_name,
            'defaultLanguageCode', workspace.default_language_code
          )
          order by workspace.updated_at desc
        )
        from gameos.game_workspace workspace
        where workspace.owner_user_id = auth.uid()
          and workspace.status = 'active'
          and workspace.archived_at is null
      ),
      '[]'::jsonb
    ),

    'runtimeProfiles',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'runtimeProfileCode', runtime.runtime_profile_code,
            'runtimeProfileName', runtime.runtime_profile_name,
            'runtimeFamilyCode', runtime.runtime_family_code
          )
          order by runtime.runtime_family_code,
                   runtime.runtime_profile_name
        )
        from gameos.game_runtime_profile runtime
        where runtime.status = 'active'
          and runtime.archived_at is null
      ),
      '[]'::jsonb
    ),

    'templates',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'templateProfileCode', template.template_profile_code,
            'templateName', template.template_name,
            'templateFamilyCode', template.template_family_code,
            'runtimeFamilyCode', template.runtime_family_code,
            'compatibilityNotes', template.compatibility_notes
          )
          order by template.runtime_family_code,
                   template.template_name
        )
        from gameos.game_template_profile template
        where template.status = 'active'
          and template.archived_at is null
      ),
      '[]'::jsonb
    ),

    'recentProjects',
    coalesce(
      (
        select jsonb_agg(item.payload order by item.updated_at desc)
        from (
          select
            project.updated_at,
            jsonb_build_object(
              'projectCode', project.project_code,
              'projectName', project.project_name,
              'runtimeFamilyCode', project.runtime_family_code,
              'latestRevisionRef', revision.revision_ref,
              'saveState', project.save_state
            ) as payload
          from gameos.game_project project
          left join gameos.game_project_revision revision
            on revision.id = project.latest_revision_id
          where project.owner_user_id = auth.uid()
            and project.archived_at is null
          order by project.updated_at desc
          limit 20
        ) item
      ),
      '[]'::jsonb
    ),

    'draftCount',
    (
      select count(*)
      from gameos.game_project project
      where project.owner_user_id = auth.uid()
        and project.archived_at is null
        and project.save_state = 'draft'
    ),

    'validationPendingCount', 0,
    'submissionPendingCount', 0
  );
$function$;

create or replace function gameos.builder_project_summary(
  p_project_code text
)
returns jsonb
language sql
security definer
set search_path = gameos, pg_temp
as $function$
  select jsonb_build_object(
    'projectCode', project.project_code,
    'workspaceCode', workspace.workspace_code,
    'projectName', project.project_name,
    'runtimeFamilyCode', project.runtime_family_code,
    'runtimeProfileCode', runtime.runtime_profile_code,
    'templateProfileCode', template.template_profile_code,
    'latestRevisionRef', revision.revision_ref,
    'latestAutosaveSnapshotRef', null,
    'saveState', project.save_state,
    'inlineValidationState', project.inline_validation_state,
    'exportReadinessState', project.export_readiness_state,
    'publishReadinessState', project.publish_readiness_state,
    'collaborationLockState', project.collaboration_lock_state
  )
  from gameos.game_project project
  join gameos.game_workspace workspace
    on workspace.id = project.workspace_id
  join gameos.game_runtime_profile runtime
    on runtime.id = project.runtime_profile_id
  left join gameos.game_template_profile template
    on template.id = project.template_profile_id
  left join gameos.game_project_revision revision
    on revision.id = project.latest_revision_id
  where project.project_code = p_project_code
    and project.owner_user_id = auth.uid()
    and project.archived_at is null;
$function$;

revoke all
  on function gameos.create_builder_project(jsonb)
  from public;

revoke all
  on function gameos.builder_bootstrap()
  from public;

revoke all
  on function gameos.builder_project_summary(text)
  from public;

grant usage on schema gameos to authenticated;

grant select
  on gameos.game_workspace,
     gameos.game_template_profile,
     gameos.game_runtime_profile,
     gameos.game_project,
     gameos.game_project_revision
  to authenticated;

grant execute
  on function gameos.create_builder_project(jsonb)
  to authenticated;

grant execute
  on function gameos.builder_bootstrap()
  to authenticated;

grant execute
  on function gameos.builder_project_summary(text)
  to authenticated;

commit;
