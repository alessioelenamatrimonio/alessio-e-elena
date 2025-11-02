/* ============================
   Configura qui i parametri
   ============================ */

// 1) Data dell'evento (per countdown e label):
// Formato ISO: "YYYY-MM-DDTHH:mm:ss±TZ" (es. 2026-06-21T16:00:00+02:00)
const WEDDING_DATE = "2026-06-21T16:00:00+02:00";  // <-- CAMBIA QUI
const DATE_LABEL_TEXT = "21 giugno 2026 — ore 16:00";

// 2) Cloudinary (per Upload):
// Crea un account Cloudinary, imposta un "Upload preset" UNSIGNED e inserisci i valori:
const CLOUDINARY_CLOUD_NAME = "INSERISCI_CLOUD_NAME";   // es. "mio-cloud"
const CLOUDINARY_UPLOAD_PRESET = "INSERISCI_UPLOAD_PRESET"; // es. "wedding_unsigned"

// Opzioni di upload
const MAX_FILE_MB = 15;
const ALLOWED_FORMATS = ["jpg","jpeg","png","heic","webp"];

// 3) Coordinate decimali (già derivate da 42°20'13.9"N 12°24'11.6"E)
const LAT = 42.337194;
const LON = 12.403222;

/* ============================
   Script
   ============================ */

// Navbar mobile toggle
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// Anno footer
document.getElementById("year").textContent = new Date().getFullYear();

// Data label
document.getElementById("dateLabel").textContent = DATE_LABEL_TEXT;

// Link dinamici a mappe (già presenti anche nell'HTML)
const gmapsLink = document.getElementById("gmapsLink");
if (gmapsLink) gmapsLink.href = `https://maps.google.com/?q=${LAT},${LON}`;
const appleLink = document.getElementById("appleLink");
if (appleLink) appleLink.href = `maps://?ll=${LAT},${LON}`;

// Copia coordinate
const copyBtn = document.getElementById("copyCoords");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(`${LAT.toFixed(6)}, ${LON.toFixed(6)}`);
      copyBtn.textContent = "Coordinate copiate ✓";
      setTimeout(() => (copyBtn.textContent = "Copia coordinate"), 1800);
    } catch {
      alert("Copiatura non supportata: copiale manualmente.");
    }
  });
}

// Countdown
(function initCountdown(){
  const target = new Date(WEDDING_DATE).getTime();
  if (isNaN(target)) return; // se la data non è impostata

  const dd = document.getElementById("dd");
  const hh = document.getElementById("hh");
  const mm = document.getElementById("mm");
  const ss = document.getElementById("ss");

  const tick = () => {
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    dd.textContent = d;
    hh.textContent = h.toString().padStart(2,"0");
    mm.textContent = m.toString().padStart(2,"0");
    ss.textContent = s.toString().padStart(2,"0");
  };

  tick();
  setInterval(tick, 1000);
})();

// Cloudinary Upload Widget
const statusBox = document.getElementById("uploadStatus");
const uploadBtn = document.getElementById("uploadBtn");

function openUploadWidget(){
  if (!window.cloudinary) {
    statusBox.textContent = "Upload non disponibile: riprova tra poco.";
    return;
  }
  window.cloudinary.openUploadWidget(
    {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      sources: ["local","url","camera"],
      multiple: true,
      maxFileSize: MAX_FILE_MB * 1024 * 1024,
      clientAllowedFormats: ALLOWED_FORMATS,
      folder: "wedding-photos",
      showAdvancedOptions: false,
      cropping: false,
      resourceType: "image", // solo foto
      styles: {
        palette: { window: "#ffffff", sourceBg: "#ffffff", windowBorder: "#7b6c57", tabIcon: "#7b6c57", menuIcons: "#7b6c57", textDark: "#333", textLight: "#fff", link: "#7b6c57", action: "#7b6c57", inactiveTabIcon: "#9e9e9e", error: "#dd4b39", inProgress: "#7b6c57", complete: "#5cb85c", sourceBg: "#f5f5f5" }
      }
    },
    (err, res) => {
      if (err) {
        statusBox.textContent = "Caricamento non riuscito. Riprova.";
        return;
      }
      if (res && res.event === "success") {
        statusBox.textContent = "Grazie! Foto caricata ✔";
        // Se vuoi, aggiungi in galleria l'anteprima:
        const gallery = document.getElementById("gallery");
        const img = document.createElement("img");
        // Usa trasformazioni Cloudinary per consegna ottimizzata:
        const delivered = res.info.secure_url
          .replace("/upload/", "/upload/w_800,f_auto,q_auto/");
        img.src = delivered;
        img.alt = "Foto caricata dagli invitati";
        img.loading = "lazy";
        gallery?.prepend(img);
      }
    }
  );
}
if (uploadBtn) uploadBtn.addEventListener("click", openUploadWidget);

