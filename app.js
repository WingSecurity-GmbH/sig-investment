/**
 * S.I.G Investment AG - Interactive Web Frontend
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLucideIcons();
  initMap();
  initMobileMenu();
  initContactForm();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ----------------------------------------------------
// Theme Management (Light / Dark Mode)
// ----------------------------------------------------
function initTheme() {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  const storedTheme = localStorage.getItem('sig-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('sig-theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dunkler Modus aktiviert' : 'Heller Modus aktiviert');
    });
  });
}

// ----------------------------------------------------
// Toast Notification
// ----------------------------------------------------
let toastTimeout;
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.remove('hide');
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
  }, duration);
}

// ----------------------------------------------------
// Copy to Clipboard
// ----------------------------------------------------
window.copyToClipboard = function(text, label) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(label + ' in die Zwischenablage kopiert!');
    }).catch(err => {
      fallbackCopyTextToClipboard(text, label);
    });
  } else {
    fallbackCopyTextToClipboard(text, label);
  }
};

function fallbackCopyTextToClipboard(text, label) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(label + ' in die Zwischenablage kopiert!');
  } catch (err) {
    showToast('Kopieren fehlgeschlagen: ' + err);
  }
  document.body.removeChild(textArea);
}

// ----------------------------------------------------
// Accordion Toggle for Official Purpose Text
// ----------------------------------------------------
window.toggleAccordion = function(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById(id + '-icon');
  if (!content) return;

  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    if (icon) icon.classList.add('rotate-180');
  } else {
    content.classList.add('hidden');
    if (icon) icon.classList.remove('rotate-180');
  }
};

// ----------------------------------------------------
// Interactive Map (Leaflet.js + OpenStreetMap)
// ----------------------------------------------------
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  const lat = 47.3165857;
  const lon = 7.9099417;

  try {
    const map = L.map('map', {
      scrollWheelZoom: false
    }).setView([lat, lon], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: #d90429;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="padding: 4px; font-family: inherit;">
        <strong style="display:block; font-size: 14px; margin-bottom: 4px; color: #0f172a;">S.I.G Investment AG</strong>
        <p style="margin: 0; font-size: 12px; color: #475569;">Birkenweg 8<br>4663 Aarburg</p>
        <div style="margin-top: 8px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=Birkenweg+8,+4663+Aarburg" target="_blank" style="font-size: 11px; font-weight: 600; color: #d90429; text-decoration: underline;">Route auf Google Maps planen &rarr;</a>
        </div>
      </div>
    `).openPopup();
  } catch (e) {
    console.error('Error initializing map:', e);
  }
}

// ----------------------------------------------------
// Download Structured JSON Data
// ----------------------------------------------------
window.downloadJsonData = function() {
  fetch('company-data.json')
    .then(response => {
      if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok');
      return response.json();
    })
    .then(data => triggerDownload(data))
    .catch(() => {
      const fallbackData = {
        name: 'S.I.G Investment AG',
        legalForm: 'Aktiengesellschaft (AG)',
        uid: 'CHE-372.795.481',
        chid: 'CH-400.3.456.628-1',
        seat: 'Aarburg (AG)',
        domicile: 'Birkenweg 8, 4663 Aarburg',
        capital: "CHF 100'000.00 (Liberiert: CHF 50'000.00)",
        management: 'Igor Sajic (Mitglied des Verwaltungsrates, Einzelunterschrift)',
        status: 'Aktiv / Eingetragen',
        officialLink: 'https://ag.chregister.ch/cr-portal/auszug/auszug.xhtml?uid=CHE-372.795.481'
      };
      triggerDownload(fallbackData);
    });
};

function triggerDownload(dataObj) {
  const jsonStr = JSON.stringify(dataObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SIG-Investment-AG-Handelsregisterdaten.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Handelsregister-Daten als JSON heruntergeladen!');
}

// ----------------------------------------------------
// Mobile Menu Navigation
// ----------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  const links = menu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

// ----------------------------------------------------
// Contact Form Feedback
// ----------------------------------------------------
function initContactForm() {
  const form = document.getElementById('quickContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName')?.value || '';
    showToast(`Vielen Dank, ${name || 'für Ihre Kontaktaufnahme'}! Ihre Nachricht wurde übermittelt.`);
    form.reset();
  });
}

window.triggerPrint = function() {
  window.print();
};