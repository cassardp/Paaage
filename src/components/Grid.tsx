import { GRID_COLS, GRID_ROWS, CELL_SIZE } from '../lib/defaultConfig';

// Pas de gap - la grille est continue, les marges sont gérées par les positions des blocs
export function getGridDimensions() {
  const gridWidth = GRID_COLS * CELL_SIZE;
  const gridHeight = GRID_ROWS * CELL_SIZE;
  return { gridWidth, gridHeight };
}

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
