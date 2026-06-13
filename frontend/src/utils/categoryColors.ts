const CATEGORY_PALETTE = [
  '#FB2C36', // Red
  '#2B7FFF', // Blue
  '#00C950', // Green
  '#F0B100', // Yellow
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#FFE66D', // Light Yellow
  '#FF8C42', // Orange
  '#A8E6CF', // Mint
  '#DCEDC1', // Light Green
  '#FF80AB', // Pink
  '#7C4DFF', // Purple
  '#536DFE', // Indigo
  '#64DD17', // Lime
  '#00BCD4', // Cyan
  '#FFC107', // Amber
  '#8D6E63', // Brown
  '#78909C', // Blue Gray
];

const OTHERS_COLOR = '#99A1AF';

const colorCache = new Map<string, string>();

export function getCategoryColor(categoryName: string | null): string {
  if (!categoryName) {
    return OTHERS_COLOR;
  }

  const normalizedName = categoryName.toLowerCase().trim();
  
  if (normalizedName === 'others' || normalizedName === 'other') {
    return OTHERS_COLOR;
  }

  if (colorCache.has(normalizedName)) {
    return colorCache.get(normalizedName)!;
  }

  let hashCode = 5381;
  for (let i = 0; i < normalizedName.length; i++) {
    hashCode = ((hashCode << 5) + hashCode) + normalizedName.charCodeAt(i);
    hashCode |= 0;
  }

  const colorIndex = Math.abs(hashCode) % CATEGORY_PALETTE.length;
  const color = CATEGORY_PALETTE[colorIndex];
  
  colorCache.set(normalizedName, color);
  return color;
}

export function clearCategoryColorCache(): void {
  colorCache.clear();
}
