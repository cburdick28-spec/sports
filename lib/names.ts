import { Rng, pick } from "./rng";

// Fictional names only: no real players, no licensing headaches.
const FIRST = [
  "Marco", "Diego", "Kai", "Luca", "Mateo", "Jax", "Niko", "Rafa", "Theo", "Ivan",
  "Zane", "Omar", "Leo", "Sven", "Tariq", "Dante", "Felix", "Hugo", "Ravi", "Soren",
  "Mika", "Callum", "Tomas", "Andre", "Yuri", "Bruno", "Elias", "Kofi", "Remy", "Axel",
];

const LAST = [
  "Vega", "Stone", "Okafor", "Lindqvist", "Moreau", "Castillo", "Brandt", "Novak",
  "Ferreira", "Kowalski", "Tanaka", "Reyes", "Holm", "Duarte", "Sato", "Ricci",
  "Mbeki", "Volkov", "Navarro", "Quinn", "Delgado", "Falk", "Ibarra", "Kruger",
  "Morales", "Petrov", "Silva", "Weber", "Yamada", "Zeller",
];

export function randomName(rng: Rng): string {
  return `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
}
