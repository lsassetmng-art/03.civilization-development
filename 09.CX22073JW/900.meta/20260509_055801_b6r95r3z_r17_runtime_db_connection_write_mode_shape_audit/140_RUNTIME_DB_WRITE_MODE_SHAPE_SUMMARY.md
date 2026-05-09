# Runtime DB Connection Write-mode Shape Summary

## Session default without SET

```
1:            section             | transaction_read_only | default_transaction_read_only | session_replication_role | database_name | db_user  |                server_addr                 | server_port | pg_is_in_recovery 
3: 01_session_default_without_set | off                   | off                           | origin                   | postgres      | postgres | 2406:da12:b78:de00:8528:d827:b2b0:d897/128 |        5432 | f
7:              section              | transaction_read_only | default_transaction_read_only 
9: 02_inside_plain_begin_without_set | off                   | off
13:                            section                             |                                   note                                   
15: 03_runtime_create_function_can_be_called_only_in_write_session | No function call executed here. This audit only checks session defaults.
```

## Current shell / server process DB env shape

```
5:DATABASE_URL_PRESENT=YES
6:DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
7:DATABASE_URL_DDL_PRESENT=YES
8:DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
9:PERSONA_DATABASE_URL_PRESENT=YES
10:PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
11:PERSONA_DATABASE_URL_DDL_PRESENT=NO
12:AIWORKEROS_DATABASE_URL_PRESENT=NO
13:AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
14:AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
15:PGDATABASE_PRESENT=NO
16:PGHOST_PRESENT=NO
17:PGPORT_PRESENT=NO
18:PGUSER_PRESENT=NO
19:PGPASSWORD_PRESENT=NO
20:PGOPTIONS_PRESENT=NO
21:NODE_ENV_PRESENT=NO
22:AIWORKEROS_BASE_URL_PRESENT=YES
23:PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
24:PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
27:RUNTIME_SERVER_PROCESS_COUNT=2
31:DATABASE_URL_PRESENT=YES
32:DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
33:DATABASE_URL_DDL_PRESENT=YES
34:DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
35:PERSONA_DATABASE_URL_PRESENT=YES
36:PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
37:PERSONA_DATABASE_URL_DDL_PRESENT=NO
38:AIWORKEROS_DATABASE_URL_PRESENT=NO
39:AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
40:AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
41:PGDATABASE_PRESENT=NO
42:PGHOST_PRESENT=NO
43:PGPORT_PRESENT=NO
44:PGUSER_PRESENT=NO
45:PGPASSWORD_PRESENT=NO
46:PGOPTIONS_PRESENT=NO
47:NODE_ENV_PRESENT=NO
48:AIWORKEROS_BASE_URL_PRESENT=YES
49:PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
50:PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
55:DATABASE_URL_PRESENT=YES
56:DATABASE_URL_URL_SHAPE={"name":"DATABASE_URL","present":true,"length":121,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-south-1.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
57:DATABASE_URL_DDL_PRESENT=YES
58:DATABASE_URL_DDL_URL_SHAPE={"name":"DATABASE_URL_DDL","present":true,"length":99,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"db.bkvycodiojbwcomnylqa.supabase.co","port":"5432","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
59:PERSONA_DATABASE_URL_PRESENT=YES
60:PERSONA_DATABASE_URL_URL_SHAPE={"name":"PERSONA_DATABASE_URL","present":true,"length":130,"protocol":"postgresql:","username_present":true,"password_present":true,"host":"aws-1-ap-northeast-2.pooler.supabase.com","port":"6543","pathname":"/***MASKED_DB_NAME***","search_keys":["sslmode"],"contains_default_transaction_read_only":false,"contains_transaction_read_only":false,"contains_options":false,"contains_target_session_attrs":false,"contains_readonly_words":false,"parse_ok":true}
61:PERSONA_DATABASE_URL_DDL_PRESENT=NO
62:AIWORKEROS_DATABASE_URL_PRESENT=NO
63:AIWORKEROS_RUNTIME_DATABASE_URL_PRESENT=NO
64:AIWORKEROS_DATABASE_URL_DDL_PRESENT=NO
65:PGDATABASE_PRESENT=NO
66:PGHOST_PRESENT=NO
67:PGPORT_PRESENT=NO
68:PGUSER_PRESENT=NO
69:PGPASSWORD_PRESENT=NO
70:PGOPTIONS_PRESENT=NO
71:NODE_ENV_PRESENT=NO
72:AIWORKEROS_BASE_URL_PRESENT=YES
73:PERSONA_AIWORKEROS_BASE_URL_PRESENT=YES
74:PERSONA_AIWORKEROS_AUTH_TOKEN_PRESENT=YES
77:FINAL_STATUS=ENV_AND_URL_SHAPE_AUDIT_DONE
```

## Server DB URL source

```
40:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
43:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
60:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
63:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
81:  222: const databaseUrl = process.env.PERSONA_DATABASE_URL;
84:  225:   console.error("ERROR: PERSONA_DATABASE_URL is not set");
438:  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
458:  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
502: 1100:         db: "PERSONA_DATABASE_URL",
539:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
540:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
560:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
561:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
581:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
582:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
601:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
602:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
622:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
623:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
642:   89:   const databaseUrl = process.env.PERSONA_DATABASE_URL;
643:   90:   if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");
726:SERVER_PROCESS_ENV_NAMES_BEGIN
730:PERSONA_DATABASE_URL
731:SERVER_PROCESS_ENV_NAMES_END
738:PERSONA_DATABASE_URL
740:SERVER_USES_PERSONA_DATABASE_URL=YES
741:SERVER_USES_DATABASE_URL=YES
742:SERVER_USES_AIWORKEROS_DATABASE_URL=NO
743:SERVER_USES_PGOPTIONS_OR_OPTIONS=NO
744:DIAGNOSIS=SERVER_HAS_PERSONA_DATABASE_URL_PATH
```

## Decision guide

- If SESSION default is off, but server process env URL/PGOPTIONS contains read-only setting: restart/fix server env.
- If SESSION default is on even in fresh psql without SET: PERSONA_DATABASE_URL itself is read-only-shaped or DB/user default is read-only.
- If server uses DATABASE_URL instead of PERSONA_DATABASE_URL, it may be using the wrong env var for this work.
- If no read-only setting is visible, inspect the server DB helper around the generated SQL execution path next.
