export type PinpointPuzzel = {
  onderwerp: string;
  aliassen: string[];
  woorden: [string, string, string, string, string];
};

// Woorden lopen van breed/dubbelzinnig (woord 1) naar steeds specifieker (woord 5).
// Het onderwerp is de gemeenschappelijke deler, geen letterlijk synoniem van de woorden.
const PUZZELS: PinpointPuzzel[] = [
  {
    onderwerp: "eSIM",
    aliassen: ["esim", "e-sim"],
    woorden: ["Chip", "Digitaal", "Geen simslot", "Overstappen", "QR-code activeren"],
  },
  {
    onderwerp: "Samsung Galaxy Z Fold",
    aliassen: ["galaxy z fold", "z fold", "samsung fold", "galaxy fold"],
    woorden: ["Scherm", "Vouwbaar", "Binnenscherm", "Samsung", "Wordt een tablet in je broekzak"],
  },
  {
    onderwerp: "5G",
    aliassen: ["5g", "vijfde generatie", "5g-netwerk"],
    woorden: ["Netwerk", "Generatie", "Snelheid", "Antennes", "Opvolger van 4G"],
  },
  {
    onderwerp: "Odido",
    aliassen: ["odido"],
    woorden: ["Provider", "Nederlands", "Rebranding", "2023", "Voorheen T-Mobile Nederland"],
  },
  {
    onderwerp: "Refurbished toestel",
    aliassen: ["refurbished", "refurbished toestel", "refurbished telefoon"],
    woorden: ["Tweedehands", "Gecontroleerd", "Duurzaam", "Grade A/B/C", "Voordeliger dan nieuw"],
  },
  {
    onderwerp: "IMEI-nummer",
    aliassen: ["imei", "imei-nummer", "imei nummer"],
    woorden: ["Nummer", "15 cijfers", "Uniek per toestel", "*#06#", "Identificeert je telefoon"],
  },
  {
    onderwerp: "AirPods",
    aliassen: ["airpods"],
    woorden: ["Oordopjes", "Draadloos", "Oplaadcase", "Apple", "Wit met stokjes"],
  },
  {
    onderwerp: "Screenprotector",
    aliassen: ["screenprotector", "screen protector"],
    woorden: ["Bescherming", "Glas of folie", "Krasvast", "Accessoire", "Zit op de voorkant van je scherm"],
  },
  {
    onderwerp: "Powerbank",
    aliassen: ["powerbank", "power bank"],
    woorden: ["Accessoire", "Onderweg", "mAh", "Kabel", "Los batterijpakket om op te laden"],
  },
  {
    onderwerp: "Simlockvrij toestel",
    aliassen: ["simlockvrij", "simlockvrij toestel", "sim-lockvrij"],
    woorden: ["Toestel", "Vrijheid", "Geen beperking", "Elke provider", "Los verkrijgbaar zonder abonnement"],
  },
  {
    onderwerp: "Batterijvervanging",
    aliassen: ["batterijvervanging", "accu vervangen", "batterij vervangen"],
    woorden: ["Reparatie", "Accu", "Slijtage", "Minder dan 80% capaciteit", "Toestel gaat sneller leeg"],
  },
  {
    onderwerp: "Galaxy Buds",
    aliassen: ["galaxy buds", "samsung buds"],
    woorden: ["Oordopjes", "Draadloos", "Oplaadcase", "Samsung", "Concurrent van AirPods"],
  },
  {
    onderwerp: "KPN",
    aliassen: ["kpn"],
    woorden: ["Provider", "Nederlands", "Glasvezel", "Groen logo", "Oudste telecombedrijf van Nederland"],
  },
  {
    onderwerp: "Vodafone",
    aliassen: ["vodafone"],
    woorden: ["Provider", "Internationaal", "Rood logo", "Fusie met Ziggo", "Merk met een spraakbel als logo"],
  },
  {
    onderwerp: "Face ID",
    aliassen: ["face id", "faceid"],
    woorden: ["Beveiliging", "Ontgrendelen", "Gezichtsherkenning", "iPhone", "Vervanger van de vingerafdruk-scanner"],
  },
  {
    onderwerp: "Inruilen",
    aliassen: ["inruilen", "trade-in", "trade in"],
    woorden: ["Korting", "Oud toestel", "Waardebepaling", "Inleveren", "Nieuw toestel goedkoper kopen"],
  },
  {
    onderwerp: "MagSafe",
    aliassen: ["magsafe"],
    woorden: ["Magnetisch", "Draadloos opladen", "Klikt vast", "Apple", "Ronde oplader op de achterkant van je iPhone"],
  },
];

export const MAX_POGINGEN = 5;

function normaliseer(tekst: string): string {
  return tekst
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function huidigeDatumKey(): string {
  const delen = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const jaar = delen.find(d => d.type === "year")!.value;
  const maand = delen.find(d => d.type === "month")!.value;
  const dag = delen.find(d => d.type === "day")!.value;
  return `${jaar}-${maand}-${dag}`;
}

export function puzzelVoorDatum(datumKey: string): PinpointPuzzel {
  const dagenSindsEpoch = Math.floor(new Date(`${datumKey}T00:00:00Z`).getTime() / 86_400_000);
  const index = ((dagenSindsEpoch % PUZZELS.length) + PUZZELS.length) % PUZZELS.length;
  return PUZZELS[index];
}

export function isGokJuist(puzzel: PinpointPuzzel, gok: string): boolean {
  const genormaliseerd = normaliseer(gok);
  if (!genormaliseerd) return false;
  return puzzel.aliassen.some(alias => normaliseer(alias) === genormaliseerd);
}
