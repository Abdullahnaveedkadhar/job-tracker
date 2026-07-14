/** Curated UK-friendly product boards (Greenhouse board tokens / Lever company slugs). */
export type CompanyBoard =
  | { kind: "greenhouse"; token: string; label: string }
  | { kind: "lever"; company: string; label: string };

export const COMPANY_BOARDS: CompanyBoard[] = [
  { kind: "greenhouse", token: "monzo", label: "Monzo" },
  { kind: "greenhouse", token: "starlingbank", label: "Starling Bank" },
  { kind: "greenhouse", token: "deliveroo", label: "Deliveroo" },
  { kind: "greenhouse", token: "revolut", label: "Revolut" },
  { kind: "greenhouse", token: "Wise", label: "Wise" },
  { kind: "greenhouse", token: "ben", label: "Bumble / Badoo companies" },
  { kind: "greenhouse", token: "deepmind", label: "Google DeepMind" },
  { kind: "greenhouse", token: "graphcore", label: "Graphcore" },
  { kind: "greenhouse", token: "hashicorp", label: "HashiCorp" },
  { kind: "greenhouse", token: "intercom", label: "Intercom" },
  { kind: "greenhouse", token: "checkoutcom", label: "Checkout.com" },
  { kind: "lever", company: "scottlogic", label: "Scott Logic" },
  { kind: "lever", company: "softwire", label: "Softwire" },
  { kind: "lever", company: "thoughtworks", label: "Thoughtworks" },
  { kind: "lever", company: "bjss", label: "BJSS" },
  { kind: "lever", company: "skylark", label: "Skylark" },
];
