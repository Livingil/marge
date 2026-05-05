import {
  ALCHEMY_ITEMS,
  ALCHEMY_ITEMS_BY_ID,
  ALCHEMY_ITEM_TIERS
} from "./alchemy.data.js";
import type { ItemDetails } from "./game.types.js";

export const ITEM_CATALOG: ItemDetails[] = ALCHEMY_ITEMS.map((item) => ({
  id: item.id,
  icon: item.icon,
  name: item.name,
  description: item.description,
  tier: ALCHEMY_ITEM_TIERS[item.id] ?? 1
}));

export const getItemDetails = (itemId: string | null): ItemDetails | null => {
  if (!itemId) {
    return null;
  }

  const item = ALCHEMY_ITEMS_BY_ID[itemId];
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    icon: item.icon,
    name: item.name,
    description: item.description,
    tier: ALCHEMY_ITEM_TIERS[item.id] ?? 1
  };
};
