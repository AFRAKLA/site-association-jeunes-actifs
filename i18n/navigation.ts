import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link/redirect/usePathname/useRouter conscients de la locale — préfixent
// automatiquement /en et /ar, laissent le français sans préfixe.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
