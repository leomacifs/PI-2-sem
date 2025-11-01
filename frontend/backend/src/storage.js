import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

export async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  const files = [
    { name: 'alunos.json', initial: { alunos: [] } },
    { name: 'livros.json', initial: { livros: [] } },
    { name: 'emprestimos.json', initial: { historico: [] } }
  ];
  for (const f of files) {
    const full = path.join(dataDir, f.name);
    try {
      await fs.access(full);
    } catch {
      await fs.writeFile(full, JSON.stringify(f.initial, null, 2), 'utf-8');
    }
  }
}

export async function readJson(fileName) {
  const full = path.join(dataDir, fileName);
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw || '{}');
}

export async function writeJson(fileName, data) {
  const full = path.join(dataDir, fileName);
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(full, content, 'utf-8');
}


