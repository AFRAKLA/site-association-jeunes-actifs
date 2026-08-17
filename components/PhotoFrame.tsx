import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Canopée Photo System — un seul point de vérité pour l'habillage des
 * vraies photographies (jamais logos/icônes/GrowthMark, voir chaque usage).
 * Trois variantes, avec un poids de présence volontairement croissant du bas
 * vers le haut de cette échelle (le hero de l'accueil, hors composant, est la
 * référence à 100% ; thumbnail ≈ 20%, editorial ≈ 45%, gallery ≈ 75%) :
 *
 * - "editorial" : À propos / Activités / Contact / Devenir membre — un vrai
 *   passe-partout (surface arrière légèrement décalée + cadre + liseré
 *   champagne + accent), pas juste un radius et une shadow posés sur la
 *   photo. Reste sobre : jamais le halo/médaillon/triple-couche du hero.
 * - "gallery"   : Galerie complète, "Nos derniers moments", photos
 *   supplémentaires d'un événement — le traitement le plus expressif :
 *   relief au survol (léger soulèvement + ombre plus profonde) + un fin
 *   liseré interne façon tirage photographique, pensé pour accueillir une
 *   PhotoCaption en surimpression.
 * - "thumbnail" : miniatures de liste (événements, admin) — cadre fin,
 *   discret, jamais une grosse carte.
 *
 * Le hero de l'accueil garde sa composition sur mesure (tirages empilés) et
 * n'utilise pas ce composant — délibéré, voir app/[locale]/page.tsx.
 * Les bandeaux plein-bord volontairement immersifs (bandeau "Photos du
 * terrain", bannière d'événement) n'en font pas partie non plus : leur
 * absence de cadre EST le parti pris éditorial.
 */

export type PhotoFrameVariant = "editorial" | "gallery" | "thumbnail";

/**
 * "editorial" uniquement — direction du léger décalage de la surface
 * arrière. Purement décoratif, donc exprimé en start/end (jamais left/right)
 * pour se retourner naturellement en RTL ; la photo elle-même n'est jamais
 * transformée. "start" convient à une photo positionnée à gauche en LTR
 * (permet, sur Activités, d'alterner le rythme avec "end" sans créer un
 * second système).
 */
export type BackplateOffset = "start" | "end";

const SIMPLE_VARIANT_CLASSES: Record<"gallery" | "thumbnail", string> = {
  gallery:
    "rounded-2xl shadow-[inset_0_0_0_1px_rgba(250,249,244,0.35),0_8px_20px_-14px_rgba(20,48,31,0.4)] ring-1 ring-champagne-soft/55 transition-[transform,box-shadow] duration-300 ease-out-strong motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[inset_0_0_0_1px_rgba(250,249,244,0.35),0_20px_38px_-16px_rgba(20,48,31,0.45)]",
  thumbnail: "rounded-xl ring-1 ring-champagne-soft/50",
};

const BACKPLATE_OFFSET_CLASSES: Record<BackplateOffset, string> = {
  start: "translate-x-2 translate-y-2.5 rtl:-translate-x-2",
  end: "-translate-x-2 translate-y-2.5 rtl:translate-x-2",
};

type PhotoFrameOwnProps<E extends ElementType> = {
  variant: PhotoFrameVariant;
  backplateOffset?: BackplateOffset;
  as?: E;
  className?: string;
  children: ReactNode;
};

type PhotoFrameProps<E extends ElementType> = PhotoFrameOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof PhotoFrameOwnProps<E>>;

export function PhotoFrame<E extends ElementType = "div">({
  variant,
  backplateOffset = "start",
  as,
  className = "",
  children,
  ...rest
}: PhotoFrameProps<E>) {
  const Component = (as ?? "div") as ElementType;

  if (variant === "editorial") {
    // Structure en 3 plans (surface arrière décalée → cadre passe-partout →
    // fenêtre photo) plutôt qu'un simple radius+shadow posés sur l'image :
    // `className` (typiquement un aspect-ratio, + un éventuel `lg:order-*`
    // d'alternance) reste sur le composant racine, qui pilote donc la taille
    // réelle ; le cadre et la surface arrière sont des `absolute inset-0`
    // calés dessus, ce qui évite tout écart d'arrondi entre plans. Pas de
    // `overflow-hidden` ici (contrairement à gallery/thumbnail) : la surface
    // arrière doit pouvoir déborder légèrement du cadre pour se voir.
    return (
      <Component className={`group relative ${className}`} {...rest}>
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 rounded-[1.75rem] bg-surface-muted ring-1 ring-champagne-soft/30 ${BACKPLATE_OFFSET_CLASSES[backplateOffset]}`}
        />
        <div className="absolute inset-0 rounded-[1.75rem] bg-surface p-2.5 shadow-[0_20px_50px_-24px_rgba(20,48,31,0.32)] ring-1 ring-champagne-soft/50 sm:p-3">
          <div className="relative h-full w-full overflow-hidden rounded-[1.125rem] bg-surface-muted">{children}</div>
          <span
            aria-hidden="true"
            className="absolute -bottom-1 end-5 h-2.5 w-2.5 rounded-full bg-champagne ring-2 ring-surface"
          />
        </div>
      </Component>
    );
  }

  return (
    <Component
      className={`group relative overflow-hidden bg-surface-muted ${SIMPLE_VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Légende permanente en surimpression (icône de catégorie + titre réel,
 * jamais de texte inventé) — utilisée avec variant="gallery". Panneau
 * frosté théma-aware (bg-background/90 + backdrop-blur), lisible sur
 * n'importe quelle photo sans assombrir l'image elle-même.
 */
export function PhotoCaption({
  as: As = "span",
  icon,
  title,
  subtitle,
}: {
  as?: "span" | "figcaption";
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <As className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2.5 rounded-xl bg-background/90 px-3 py-2.5 shadow-[0_8px_20px_-10px_rgba(20,48,31,0.35)] ring-1 ring-champagne-soft/30 backdrop-blur-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne-soft/30 ring-1 ring-champagne-soft/60">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium leading-snug text-ink">{title}</span>
        {subtitle && <span className="block text-[11px] text-muted-foreground">{subtitle}</span>}
      </span>
    </As>
  );
}
