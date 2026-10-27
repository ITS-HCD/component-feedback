// ---------------------------------------------------------------------------
// Demo: log each nys-feedback event, and use a session cookie so each
// browser session can answer only once.
// ---------------------------------------------------------------------------

const COOKIE_NAME = 'nys-feedback';

const feedback = document.querySelector('#feedback');
const log = document.querySelector('#log');
const cookieStatus = document.querySelector('#cookie-status');

function addLogEntry(message) {
  const item = document.createElement('li');
  const time = document.createElement('span');
  time.className = 'log__time';
  time.textContent = `${new Date().toLocaleTimeString()} `;
  item.append(time, message);
  // Newest first, so the latest event is always in view.
  log.prepend(item);
}

function readCookie() {
  const match = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

// The preview runs in a cross-site iframe, so the cookie needs SameSite=None,
// Secure, and Partitioned. It has no Expires or Max-Age, so the browser drops
// it when the session ends.
function writeCookie(value, maxAge = '') {
  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'SameSite=None',
    'Secure',
    'Partitioned',
    maxAge,
  ]
    .filter(Boolean)
    .join('; ');
}

function showCookie() {
  const value = readCookie();
  cookieStatus.textContent = value ? `${COOKIE_NAME}=${value}` : 'none';
}

feedback.addEventListener('nys-feedback', (event) => {
  const {value, label} = event.detail;
  addLogEntry(`event fired: ${label.toLowerCase()}`);
  writeCookie(value);
  if (readCookie()) {
    addLogEntry(`cookie set: ${COOKIE_NAME}=${value}`);
  } else {
    addLogEntry('cookie blocked: this browser rejects cookies in the preview');
  }
  showCookie();
});

document.querySelector('#clear-cookie').addEventListener('nys-click', () => {
  writeCookie('', 'Max-Age=0');
  feedback.reset();
  addLogEntry('cookie cleared: you can answer again');
  showCookie();
});

document.querySelector('#replay-entrance').addEventListener('nys-click', () => {
  feedback.animateIn();
  addLogEntry('entrance replayed: the component animates in after 2 seconds');
});

document.querySelector('#clear-log').addEventListener('nys-click', () => {
  log.replaceChildren();
});

// Someone who already answered this session sees the thank-you message.
const saved = readCookie();
if (saved) {
  feedback.value = saved;
  feedback.submitted = true;
  addLogEntry(`cookie found: ${COOKIE_NAME}=${saved}, so the buttons stay hidden`);
}
showCookie();
