// 把 MediaPipe 的运行时文件从 node_modules 复制到 app/vendor/hands,
// 这样打包出来的桌面版和 GitHub Pages 都不依赖 CDN,断网也能跑。
import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'node_modules', '@mediapipe', 'hands');
const dst = path.join(root, 'app', 'vendor', 'hands');

if (!existsSync(src)) {
  console.log('[vendor] 还没安装 @mediapipe/hands,跳过(页面会自动回退到 CDN)');
  process.exit(0);
}

const SKIP = new Set(['package.json', 'README.md', 'index.d.ts', 'LICENSE']);
await mkdir(dst, { recursive: true });

let n = 0, bytes = 0;
for (const f of await readdir(src)) {
  if (SKIP.has(f)) continue;
  await cp(path.join(src, f), path.join(dst, f));
  bytes += (await stat(path.join(src, f))).size;
  n++;
}
console.log(`[vendor] 已复制 ${n} 个文件 (${(bytes / 1048576).toFixed(1)} MB) → app/vendor/hands`);
