import fs from 'fs/promises';

export default async function save(file, data) {
  try {
    // Check directory exists and write
    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
    };
  } catch (err) {
    console.warn('Failed to write cache file:', err.message);
    return err.message;
  }
}
