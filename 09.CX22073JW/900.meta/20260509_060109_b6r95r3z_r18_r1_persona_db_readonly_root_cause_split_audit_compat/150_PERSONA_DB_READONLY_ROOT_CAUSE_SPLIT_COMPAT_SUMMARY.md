# Persona DB Read-only Root Cause Split Compat Summary

## Parsed decision values

```
NORMAL_TRANSACTION_READ_ONLY=off
NO_PGOPTIONS_TRANSACTION_READ_ONLY=off
FORCE_OFF_EXIT=0
FORCE_OFF_INSIDE_TRANSACTION_READ_ONLY=off
DDL_TRANSACTION_READ_ONLY=UNKNOWN
DDL_FORCE_OFF_EXIT=99
DDL_FORCE_OFF_INSIDE_TRANSACTION_READ_ONLY=UNKNOWN
```

## Normal PERSONA_DATABASE_URL session
```
Output format is unaligned.
transaction_read_only=off
default_transaction_read_only=off
session_replication_role=origin
current_database=postgres
current_user=postgres
server_addr=2406:da12:b78:de00:8528:d827:b2b0:d897/128
server_port=5432
pg_is_in_recovery=false
db_role_setting=search_path="\$user", public, extensions | app.settings.jwt_exp=3600
BEGIN
inside_plain_begin_transaction_read_only=off
inside_plain_begin_default_transaction_read_only=off
ROLLBACK
note=No INSERT/UPDATE/DELETE executed.
```

## URL/env shape key lines
```
4:PERSONA_DATABASE_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"parse_ok":true,"protocol":"postgresql:","host_present":true,"port":"6543","username_present":true,"password_present":true,"pathname_present":true,"search_keys":["sslmode"],"contains_options":false,"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_readonly_words":false,"contains_target_session_attrs":false}
5:PERSONA_DATABASE_URL_DDL_SHAPE={"name":"PERSONA_DATABASE_URL_DDL","present":false,"parse_ok":false,"protocol":"","host_present":false,"port":"","username_present":false,"password_present":false,"pathname_present":false,"search_keys":[],"contains_options":false,"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_readonly_words":false,"contains_target_session_attrs":false}
6:DATABASE_URL_SHAPE={"name":"DATABASE_URL","present":true,"parse_ok":true,"protocol":"postgresql:","host_present":true,"port":"6543","username_present":true,"password_present":true,"pathname_present":true,"search_keys":["sslmode"],"contains_options":false,"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_readonly_words":false,"contains_target_session_attrs":false}
7:DATABASE_URL_DDL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"parse_ok":true,"protocol":"postgresql:","host_present":true,"port":"5432","username_present":true,"password_present":true,"pathname_present":true,"search_keys":["sslmode"],"contains_options":false,"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_readonly_words":false,"contains_target_session_attrs":false}
8:AIWORKEROS_DATABASE_URL_SHAPE={"name":"AIWORKEROS_DATABASE_URL","present":false,"parse_ok":false,"protocol":"","host_present":false,"port":"","username_present":false,"password_present":false,"pathname_present":false,"search_keys":[],"contains_options":false,"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_readonly_words":false,"contains_target_session_attrs":false}
9:AIWORKEROS_RUNTIME_DATABASE_URL_SHAPE={"name":"AIWORKEROS_RUNTIME_DATABASE_URL","present":false,"parse_ok":false,"protocol":"","host_present":false,"port":"","username_present":false,"password_present":false,"pathname_present":false,"search_keys":[],"contains_options":false,"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_readonly_words":false,"contains_target_session_attrs":false}
10:PGOPTIONS_PRESENT=NO
11:PGHOST_PRESENT=NO
12:PGPORT_PRESENT=NO
13:PGUSER_PRESENT=NO
14:PGDATABASE_PRESENT=NO
15:NODE_ENV_PRESENT=NO
16:FINAL_STATUS=URL_AND_ENV_SHAPE_AUDIT_DONE
```

## Server DB source key lines
```
40:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
43:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
59:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
62:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
392:  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
436: 1100:         db: "PERSONA_DATABASE_URL",
458: 1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
495:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
496:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
516:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
517:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
537:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
538:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
557:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
558:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
578:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
579:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
642:PERSONA_DATABASE_URL
650:PERSONA_DATABASE_URL
652:SERVER_USES_PERSONA_DATABASE_URL=YES
653:SERVER_USES_DATABASE_URL=YES
654:SERVER_USES_AIWORKEROS_DATABASE_URL=NO
655:SERVER_HAS_READONLY_TEXT=NO
656:BRIDGE_HAS_READONLY_TEXT=NO
657:DIAGNOSIS=SERVER_USES_PERSONA_DATABASE_URL_NO_READONLY_TEXT
```

## Decision
- PERSONA_DATABASE_URL fresh session is write-capable.
- R16 false direction came from the previous audit forcing read-only, or the running server inherited/uses a different connection/session helper.
- Next should audit the server DB execution helper and restart environment before retrying POST.
