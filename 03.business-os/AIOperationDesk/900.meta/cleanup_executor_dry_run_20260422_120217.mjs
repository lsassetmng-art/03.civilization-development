import { runCleanupExecutor } from "../070.jobs/aiod_cleanup_executor.js";

const result = await runCleanupExecutor();
console.log(JSON.stringify(result, null, 2));
