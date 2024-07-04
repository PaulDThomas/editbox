import { EditorV3Styles } from "@asup/editor-v3";
import { AieStyleMap } from "../../../src/main";

export const styleToV3 = (style: AieStyleMap) => {
  const customStyleMap: EditorV3Styles = {};
  Object.keys(style).forEach((key) => {
    customStyleMap[key] = style[key].css;
  });
  return customStyleMap;
};
