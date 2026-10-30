import fs from 'node:fs';

fs.cpSync('frontend/dist', 'dist', { recursive: true });
fs.rmSync('public', { recursive: true, force: true });
fs.cpSync('frontend/dist', 'public', { recursive: true });
