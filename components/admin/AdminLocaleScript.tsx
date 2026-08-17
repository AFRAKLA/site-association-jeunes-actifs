// Script d'amorçage anti-flash pour la langue/direction de l'ADMIN — même
// principe que ThemeScript (lecture localStorage synchrone avant la
// première peinture), clé dédiée "admin-locale", totalement indépendante
// de la locale publique et du contenu éditorial. Contenu 100% statique,
// rendu comme enfant texte d'un <script> (jamais dangerouslySetInnerHTML),
// même justification CSP que ThemeScript (script-src déjà 'unsafe-inline'
// pour l'hydratation RSC — aucune permission supplémentaire élargie ici).
const ADMIN_LOCALE_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('admin-locale');var l=(s==='fr'||s==='en'||s==='ar')?s:'fr';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}catch(e){}})();`;

export default function AdminLocaleScript() {
  return <script>{ADMIN_LOCALE_INIT_SCRIPT}</script>;
}
