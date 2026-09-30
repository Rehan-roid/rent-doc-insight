/**
 * Presentation data for the dashboard key-term cards: accent themes, icon
 * choices and the ordering that keeps the six headline terms in the grid.
 */
import {
  Calendar,
  CircleAlert,
  FileCheck2,
  House,
  Lock,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import type { KeyTerm } from "@/types/analysis";

export type TermTheme = {
  card: string;
  icon: string;
  blob: string;
  value: string;
};

const blueTheme: TermTheme = {
  card: "border-[#D9E8FB] bg-gradient-to-br from-[#F5F9FF] via-[#EEF5FF] to-[#E1EFFF]",
  icon: "bg-[#D8E8FE] text-[#2563EB]",
  blob: "bg-[#C7E0FD]",
  value: "text-brand-navy",
};

export const termThemes: TermTheme[] = [
  blueTheme,
  {
    card: "border-[#D3F0E2] bg-gradient-to-br from-[#F4FCF8] via-[#EBFAF3] to-[#DCF6E9]",
    icon: "bg-[#CBF2DF] text-[#0E9F6E]",
    blob: "bg-[#BFEEDA]",
    value: "text-brand-navy",
  },
  {
    card: "border-[#E2DCFB] bg-gradient-to-br from-[#F9F7FE] via-[#F3F0FE] to-[#E9E3FD]",
    icon: "bg-[#E0D9FC] text-[#6D5BE0]",
    blob: "bg-[#D8CEFB]",
    value: "text-brand-navy",
  },
  {
    card: "border-[#FBDCDC] bg-gradient-to-br from-[#FFF7F7] via-[#FEF0F0] to-[#FDE3E3]",
    icon: "bg-[#FBD7D7] text-[#E24C4C]",
    blob: "bg-[#F9CCCC]",
    value: "text-brand-navy",
  },
  {
    card: "border-[#FBE8C6] bg-gradient-to-br from-[#FFFCF5] via-[#FEF7EA] to-[#FDEFD7]",
    icon: "bg-[#FBE3B6] text-[#D98A0B]",
    blob: "bg-[#F9DFA9]",
    value: "text-brand-navy",
  },
  {
    card: "border-[#FAD9BC] bg-gradient-to-br from-[#FFF9F3] via-[#FFF2E7] to-[#FEE8D6]",
    icon: "bg-[#FBD2AB] text-[#E4700F]",
    blob: "bg-[#F9CFA6]",
    value: "text-brand-navy",
  },
  {
    card: "border-[#CFF0EE] bg-gradient-to-br from-[#F4FCFC] via-[#ECFAF9] to-[#DDF5F3]",
    icon: "bg-[#C6EFEC] text-[#0E8F89]",
    blob: "bg-[#BDECE8]",
    value: "text-brand-navy",
  },
  {
    card: "border-[#DAE4F6] bg-gradient-to-br from-[#F7FAFE] via-[#EFF4FC] to-[#E2EBF9]",
    icon: "bg-[#D9E4F8] text-[#3B5C92]",
    blob: "bg-[#CFDDF6]",
    value: "text-brand-navy",
  },
];

export function termThemeAt(index: number): TermTheme {
  return termThemes[index % termThemes.length] ?? blueTheme;
}

export function termIcon(id: string): ComponentType<{ className?: string; strokeWidth?: number }> {
  const key = id.toLowerCase();
  if (key.includes("refund") || key.includes("return")) return CircleAlert;
  if (key.includes("repair") || key.includes("maint")) return Wrench;
  if (key.includes("notice")) return Calendar;
  if (key.includes("lock")) return Lock;
  if (key.includes("deposit")) return ShieldCheck;
  if (key.includes("escalat") || key.includes("growth")) return TrendingUp;
  if (key.includes("rent")) return House;
  return FileCheck2;
}

/**
 * Orders key terms so the six headline terms appear first (in the reference
 * order) and anything extra follows the grid instead of displacing it.
 */
export function orderKeyTerms(terms: KeyTerm[]): { primary: KeyTerm[]; extra: KeyTerm[] } {
  const remaining = [...terms];
  const take = (match: (key: string) => boolean): KeyTerm | undefined => {
    const index = remaining.findIndex((term) => match(term.id.toLowerCase()));
    return index >= 0 ? remaining.splice(index, 1)[0] : undefined;
  };

  const primary: KeyTerm[] = [];
  const push = (term: KeyTerm | undefined) => {
    if (term) primary.push(term);
  };

  push(take((key) => key.includes("rent") && !key.includes("escalat")));
  push(take((key) => key.includes("deposit") && !key.includes("refund")));
  push(take((key) => key.includes("lock")));
  push(take((key) => key.includes("notice")));
  push(take((key) => key.includes("repair") || key.includes("maint")));

  let flag = take((key) => key.includes("refund") || key.includes("return"));
  if (!flag) {
    const index = remaining.findIndex((term) => term.status === "attention");
    flag = index >= 0 ? remaining.splice(index, 1)[0] : undefined;
  }
  push(flag);

  return { primary, extra: remaining };
}
