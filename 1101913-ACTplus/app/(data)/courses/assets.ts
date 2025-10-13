// app/(data)/courses/assets.ts
import type { Module } from "./modules";
import { modulesData } from "./modules";

export type Asset = {
  id: number;
  mid: number; // module id
  order: number;
  type: "image" | "pdf" | "markdown" | string;
  url: string;
};

export const generateAssets = (modules: Module[]) => {
  let assets: any[] = [];
  let id = 1;

  modules.forEach((m) => {
    assets.push({ id: id++, mid: m.id, order: 1, type: "image", url: "/upload/image/default.png" });
    assets.push({ id: id++, mid: m.id, order: 2, type: "pdf", url: "/upload/pdf/default.pdf" });
    assets.push({ id: id++, mid: m.id, order: 3, type: "markdown", url: "/upload/dotmd/default.md" });
  });

  return assets;
};

export const assetsData: Asset[] = generateAssets(modulesData);
