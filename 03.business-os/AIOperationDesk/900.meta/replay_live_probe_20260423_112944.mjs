import { runReplayExecutor } from "../070.jobs/aiod_replay_executor.js";

const result = await runReplayExecutor();
console.log(JSON.stringify(result, null, 2));
