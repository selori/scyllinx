// clean.js
import { rm } from 'fs/promises';

async function clean(directory) {
  try {
    await rm(directory, { recursive: true, force: true });
    console.log(directory, ' klasörü silindi.');
  } catch (err) {
    console.error('Silme hatası:', err);
  }
}

clean('dist');
