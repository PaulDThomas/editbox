import { AieStyleMap } from "../../interface";
import { AieStyleExcludeMap } from "./aieInterface";

/**
 * Returns style maps that are excluded from the given map
 * @param styleMap Current style map
 * @returns list of excluded maps
 */
export const styleMapToExclude = (styleMap?: AieStyleMap): AieStyleExcludeMap => {
  const e: AieStyleExcludeMap = {};
  if (styleMap !== undefined)
    for (const s of Object.keys(styleMap)) e[s] = styleMap[s].aieExclude ?? [];
  return e;
};
