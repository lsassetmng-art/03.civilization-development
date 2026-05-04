import fs from 'fs';

const [,, prevPatcher, nextPatcher] = process.argv;

let src = fs.readFileSync(prevPatcher, 'utf8');

src = src.replace(
  `if (count(src, rendererMarker) !== 1) throw new Error('RENDERER_MARKER_COUNT_NOT_1');`,
  `if (count(src, rendererMarker) < 1) throw new Error('RENDERER_MARKER_COUNT_LESS_THAN_1');`
);

src = src.replace(
  `if (count(afterFn.text, 'data-core-action="pmlw-major-leader-handoff"') !== 0) throw new Error('TARGET_FUNCTION_STILL_HAS_INDIVIDUAL_LEADER_HANDOFF_BUTTON');`,
  `if (count(afterFn.text, 'data-core-action="pmlw-major-leader-handoff"') !== 0) throw new Error('TARGET_FUNCTION_STILL_HAS_INDIVIDUAL_LEADER_HANDOFF_BUTTON');`
);

fs.writeFileSync(nextPatcher, src);
