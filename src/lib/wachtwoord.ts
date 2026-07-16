export const WACHTWOORD_EISEN = [
  "Minimaal 10 tekens",
  "Minstens 1 hoofdletter en 1 kleine letter",
  "Minstens 1 cijfer",
  "Minstens 1 speciaal teken (bijv. ! @ # $ %)",
];

export function valideerWachtwoord(wachtwoord: string): string | null {
  if (wachtwoord.length < 10) return "Wachtwoord moet minimaal 10 tekens lang zijn.";
  if (!/[a-z]/.test(wachtwoord)) return "Wachtwoord moet minstens 1 kleine letter bevatten.";
  if (!/[A-Z]/.test(wachtwoord)) return "Wachtwoord moet minstens 1 hoofdletter bevatten.";
  if (!/[0-9]/.test(wachtwoord)) return "Wachtwoord moet minstens 1 cijfer bevatten.";
  if (!/[^A-Za-z0-9]/.test(wachtwoord)) return "Wachtwoord moet minstens 1 speciaal teken bevatten.";
  return null;
}
