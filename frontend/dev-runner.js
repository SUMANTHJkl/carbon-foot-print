import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to check if a port is responding
function isPortInUse(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Wait until port is open or timeout expires
async function waitForPort(port, host = '127.0.0.1', timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isPortInUse(port, host)) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

let backendProc = null;
let viteProc = null;
let isShuttingDown = false;

function killProcess(proc) {
  if (!proc || !proc.pid || proc.killed) return;
  try {
    if (process.platform === 'win32') {
      spawn(`taskkill /pid ${proc.pid} /f /t`, {
        stdio: 'ignore',
        shell: true,
      });
    } else {
      proc.kill('SIGTERM');
    }
  } catch {
    // Process already exited
  }
}

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\x1b[33m[CoalCarbon]\x1b[0m Stopping backend and frontend dev servers...');
  killProcess(backendProc);
  killProcess(viteProc);
  setTimeout(() => process.exit(0), 400);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
process.on('exit', () => {
  killProcess(backendProc);
  killProcess(viteProc);
});

async function start() {
  console.log('\x1b[36m====================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m CoalCarbon India - Full Stack Development Server \x1b[0m');
  console.log('\x1b[36m====================================================\x1b[0m');

  const backendAlreadyRunning = await isPortInUse(8000);

  if (backendAlreadyRunning) {
    console.log('\x1b[32m✔ [Backend]\x1b[0m Python FastAPI backend is already running on http://127.0.0.1:8000');
  } else {
    console.log('\x1b[34m➜ [Backend]\x1b[0m Starting Python FastAPI backend on http://127.0.0.1:8000 ...');
    
    // Spawn backend with rootDir as working directory so 'backend.app.main' is found
    backendProc = spawn('python -m uvicorn backend.app.main:app --port 8000 --reload', {
      cwd: rootDir,
      env: { ...process.env, PYTHONPATH: rootDir },
      stdio: 'inherit',
      shell: true,
    });

    backendProc.on('error', (err) => {
      console.error('\x1b[31m✘ [Backend Error]\x1b[0m Could not start python backend:', err.message);
      console.error('\x1b[33mHint:\x1b[0m Ensure Python and dependencies are installed (`pip install -r requirements.txt`).');
    });

    backendProc.on('exit', (code) => {
      if (!isShuttingDown && code !== null && code !== 0) {
        console.error(`\x1b[31m✘ [Backend Exited]\x1b[0m Process exited with code ${code}`);
      }
    });

    // Wait for FastAPI backend to be ready on port 8000 before starting Vite
    const ready = await waitForPort(8000, '127.0.0.1', 12000);
    if (ready) {
      console.log('\x1b[32m✔ [Backend]\x1b[0m FastAPI backend is live at http://127.0.0.1:8000');
    } else {
      console.warn('\x1b[33m⚠ [Backend]\x1b[0m Backend took longer than expected to start, proceeding to frontend...');
    }
  }

  console.log('\x1b[35m➜ [Frontend]\x1b[0m Starting Vite development server (React + TypeScript)...');

  viteProc = spawn('npm run dev:frontend', {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });

  viteProc.on('error', (err) => {
    console.error('\x1b[31m✘ [Frontend Error]\x1b[0m Failed to launch Vite:', err.message);
  });

  viteProc.on('exit', (code) => {
    if (!isShuttingDown) {
      cleanup();
    }
  });
}

start();
