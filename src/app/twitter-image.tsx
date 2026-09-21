import { brandOG, OG_SIZE } from "@/lib/og";

export const alt = "Git, from the inside out — a visual guide to every git command";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return brandOG();
}