import { renderOgImage } from "@/lib/ogImage";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — Ingénieur IA & architecture logicielle`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderOgImage();
}
