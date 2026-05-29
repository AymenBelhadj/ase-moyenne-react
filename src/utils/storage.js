const COOKIE_PREFIX = 'ase_moyenne_v1_';
const COOKIE_COUNT = `${COOKIE_PREFIX}count`;
const LOCAL_KEY = 'ase-moyenne-react-v1';
const COOKIE_DAYS = 365;
const CHUNK_SIZE = 3200;

function setCookie(name, value, days = COOKIE_DAYS) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const found = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function clearCookieChunks() {
  const count = Number(getCookie(COOKIE_COUNT) || 0);
  for (let i = 0; i < count + 5; i += 1) deleteCookie(`${COOKIE_PREFIX}${i}`);
  deleteCookie(COOKIE_COUNT);
}

export function saveAppState(state) {
  const payload = JSON.stringify({ ...state, savedAt: new Date().toISOString() });

  try {
    localStorage.setItem(LOCAL_KEY, payload);
  } catch (error) {
    console.warn('LocalStorage indisponible, sauvegarde cookies uniquement.', error);
  }

  try {
    clearCookieChunks();
    const chunks = payload.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || [];
    chunks.forEach((chunk, index) => setCookie(`${COOKIE_PREFIX}${index}`, chunk));
    setCookie(COOKIE_COUNT, String(chunks.length));
    return { ok: true, method: chunks.length > 1 ? `cookies (${chunks.length} blocs) + localStorage` : 'cookie + localStorage' };
  } catch (error) {
    console.warn('Impossible de sauvegarder dans les cookies.', error);
    return { ok: false, method: 'localStorage', error };
  }
}

export function loadAppState() {
  try {
    const cookieCount = Number(getCookie(COOKIE_COUNT) || 0);
    if (cookieCount > 0) {
      let payload = '';
      for (let i = 0; i < cookieCount; i += 1) payload += getCookie(`${COOKIE_PREFIX}${i}`) || '';
      if (payload) return JSON.parse(payload);
    }
  } catch (error) {
    console.warn('Lecture cookies impossible, tentative localStorage.', error);
  }

  try {
    const local = localStorage.getItem(LOCAL_KEY);
    return local ? JSON.parse(local) : null;
  } catch (error) {
    console.warn('Lecture localStorage impossible.', error);
    return null;
  }
}

export function clearAppState() {
  clearCookieChunks();
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch (error) {
    console.warn('Suppression localStorage impossible.', error);
  }
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
