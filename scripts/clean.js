// clean.js
import { rm } from 'fs/promises';

async function clean() {
  try {
    await rm('dist', { recursive: true, force: true });
    console.log('dist klasörü silindi.');
  } catch (err) {
    console.error('Silme hatası:', err);
  }
}

clean();
