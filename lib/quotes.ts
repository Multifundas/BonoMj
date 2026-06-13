/**
 * Frases motivacionales para la plataforma.
 * Puras y sin dependencias para usarse en server y client.
 */

export const QUOTES: string[] = [
  "Cada hora cuenta. Tú vas construyendo tu meta. 💪",
  "El esfuerzo de hoy es la recompensa de mañana. ✨",
  "Pequeños pasos, grandes resultados. 🌸",
  "Tu dedicación se nota y vale oro. 💖",
  "Confía en tu ritmo, vas increíble. 🚀",
  "Disciplina hoy, libertad mañana. 🌷",
  "Lo estás logrando, una hora a la vez. ⏳",
  "Tu trabajo tiene valor y se refleja aquí. 💛",
  "Sigue brillando, lo mereces todo. 🌟",
  "Constancia es tu superpoder. 🦋",
  "Hoy es un gran día para acercarte a tu bono. 🎯",
  "Eres más fuerte de lo que crees. 💕",
  "Cada corte registrado es una victoria. 🏆",
  "Tu futuro yo te lo va a agradecer. 🌈",
  "Avanza con calma, pero no te detengas. 🌼",
];

/** Frase del día: determinística según la fecha (estable server/client). */
export function quoteOfTheDay(date: Date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return QUOTES[((dayIndex % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
