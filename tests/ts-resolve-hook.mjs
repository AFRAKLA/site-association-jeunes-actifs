// Hook de résolution utilisé UNIQUEMENT par `node --test` (voir package.json,
// script "test"). Le code applicatif utilise des imports relatifs sans
// extension (convention Next.js / TypeScript "bundler"), ce que l'ESM natif
// de Node ne résout pas. Ce hook retente simplement avec ".ts" quand la
// résolution nominale échoue — aucune dépendance ajoutée au projet.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      try {
        return await nextResolve(`${specifier}.ts`, context);
      } catch {
        // on relance l'erreur d'origine, plus parlante
      }
    }
    throw err;
  }
}
