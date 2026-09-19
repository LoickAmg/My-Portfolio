import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Un package-lock.json existe plus haut dans l'arborescence
  // (C:\Users\Administrator), ce qui faisait hésiter Turbopack sur la
  // racine du projet (warning au démarrage de `next dev`). On la fixe
  // explicitement à ce dossier.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
