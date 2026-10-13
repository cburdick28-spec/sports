import { SportConfig } from "../types";
import { football } from "./football";
import { basketball } from "./basketball";
import { hockey } from "./hockey";

// Adding a sport = add a config file and list it here. The engine and UI are generic.
export const SPORTS: SportConfig[] = [football, basketball, hockey];

export function getSport(id: string): SportConfig | undefined {
  return SPORTS.find((s) => s.id === id);
}
