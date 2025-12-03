import { CELL_SIZE } from '../lib/defaultConfig';

// Convertir position pixel → position grille
export function pixelToGrid(px: number): number {
  return Math.round(px / CELL_SIZE);
}

// Convertir position grille → position pixel
export function gridToPixel(grid: number): number {
  return grid * CELL_SIZE;
}

// Calculer la taille en pixels
export function gridSizeToPixel(size: number): number {
  return size * CELL_SIZE;
}
