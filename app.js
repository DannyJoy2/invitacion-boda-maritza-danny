'use strict';
const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { hero.classList.add('connected'); observer.disconnect(); } }, {threshold:.2});
 observer.observe(hero);
} else hero.classList.add('connected');

// Reveal each section and its visual elements as they enter the viewport.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
 document.documentElement.classList.add('has-scroll-motion');
 const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
   if (entry.isIntersecting) {
    entry.target.classList.add('is-revealed');
    observer.unobserve(entry.target);
   }
  });
 }, {threshold:.12, rootMargin:'0px 0px -32px 0px'});
 document.querySelectorAll('.section, .photo-interlude, .closing, .event, .guest-card, .photo-slot').forEach((element, index) => {
  element.classList.add('scroll-reveal');
  if (element.matches('.event, .guest-card, .photo-slot')) {
   element.classList.add('scroll-reveal-item');
   element.style.setProperty('--reveal-order', index % 3);
  }
  revealObserver.observe(element);
 });
}

const weddingTime = new Date('2026-12-05T15:00:00-05:00').getTime();
function updateCountdown() {
 const remaining = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
 const values = [Math.floor(remaining/86400), Math.floor(remaining/3600)%24, Math.floor(remaining/60)%60, remaining%60];
 ['days','hours','minutes','seconds'].forEach((id,i) => { document.getElementById(id).textContent = String(values[i]).padStart(2,'0'); });
 if (!remaining) document.getElementById('countdown-note').textContent = '¡Llegó el día de nuestra boda! Gracias por acompañarnos.';
}
updateCountdown(); setInterval(updateCountdown,1000);

const musicButton = document.getElementById('music-toggle');
const weddingAudio = document.getElementById('wedding-audio');
const musicVolume = document.getElementById('music-volume');
const musicStatus = document.getElementById('music-status');
let explicitlyPaused = false;
weddingAudio.volume = .35;
weddingAudio.muted = true;
function reflectAudioState() {
 const active = !weddingAudio.paused && !weddingAudio.ended;
 const audible = active && !weddingAudio.muted;
 musicButton.setAttribute('aria-pressed', String(audible));
 musicButton.setAttribute('aria-label', active && weddingAudio.muted ? 'Activar sonido de la canción' : audible ? 'Pausar canción' : 'Reproducir canción');
 document.getElementById('music-label').textContent = active && weddingAudio.muted ? 'Activar sonido' : audible ? 'Pausar' : 'Reproducir';
 document.getElementById('music-icon').textContent = active && weddingAudio.muted ? '♪' : audible ? 'Ⅱ' : '▶';
 document.body.classList.toggle('music-playing', audible);
}
async function startMusic() {
 try {
  await weddingAudio.play();
  musicStatus.textContent = '';
 } catch (error) {
  if (error.name !== 'AbortError') musicStatus.textContent = error.name === 'NotAllowedError' ? 'Pulsa Reproducir para activar la música.' : 'No se pudo reproducir la canción. Inténtalo nuevamente.';
 }
 reflectAudioState();
}
function activateMusic() {
 weddingAudio.muted = false;
 if (weddingAudio.paused && !explicitlyPaused) startMusic();
 reflectAudioState();
}
function activateMusicOnInteraction(event) {
 if (weddingAudio.muted && !musicButton.contains(event.target)) activateMusic();
}
window.addEventListener('pointerdown', activateMusicOnInteraction);
window.addEventListener('keydown', activateMusicOnInteraction);
musicButton.addEventListener('click', () => {
 if (weddingAudio.muted) {
  activateMusic();
  return;
 }
 if (!weddingAudio.paused) {
  explicitlyPaused = true;
  weddingAudio.pause();
 } else {
  explicitlyPaused = false;
  startMusic();
 }
});
musicVolume.addEventListener('input', () => {
 weddingAudio.volume = Number(musicVolume.value) / 100;
 weddingAudio.muted = false;
 musicVolume.setAttribute('aria-valuetext', musicVolume.value + ' %');
});
['play','playing','pause','ended'].forEach(event => weddingAudio.addEventListener(event, reflectAudioState));
weddingAudio.addEventListener('error', () => { musicStatus.textContent = 'No se pudo cargar la canción. Recarga la página para intentarlo de nuevo.'; reflectAudioState(); });
startMusic();
document.querySelectorAll('.guest-rsvp-button, .hero-content .button').forEach(link => link.addEventListener('click', () => { if (weddingAudio.paused && !explicitlyPaused) startMusic(); }));
