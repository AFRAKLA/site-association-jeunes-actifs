// Script d'amorçage anti-flash — pose data-theme sur <html> de façon
// synchrone, avant la première peinture, en lisant la préférence stockée
// (localStorage) et en résolvant "system" via matchMedia. Contenu 100%
// statique (aucune donnée dynamique/utilisateur interpolée) : rendu comme
// enfant texte d'un <script>, jamais via dangerouslySetInnerHTML. Le CSP du
// projet autorise déjà script-src 'unsafe-inline' (next.config.ts, requis
// par l'hydratation RSC elle-même) — ce script n'élargit donc aucune
// permission de sécurité, il réutilise une autorisation déjà en place.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var p=(s==='light'||s==='dark'||s==='system')?s:'system';var r=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;

export default function ThemeScript() {
  return <script>{THEME_INIT_SCRIPT}</script>;
}
