import { iColouredLine, iColourStyles, iStyleBlock, AieStyleExcludeMap } from "./aieInterface";
import { ColouredLine } from "./ColouredLine";
import { ColouredText } from "./ColouredText";
import { drawInnerHtml } from "./drawInnerHtml";
import { explodeLine } from "./explodeLine";
import { getCaretPosition } from "./getCaretPosition";
import { getHTMLfromV2Text } from "./getHTMLfromV2Text";
import { getHtmlString } from "./getHtmlString";
import { getV2TextStyle } from "./getV2TextStyle";
import { implodeLine } from "./implodeLine";

export type { iColourStyles, iStyleBlock, iColouredLine, AieStyleExcludeMap };
export {
  ColouredLine,
  ColouredText,
  explodeLine,
  implodeLine,
  getHtmlString,
  getV2TextStyle,
  getHTMLfromV2Text,
};
export { drawInnerHtml, getCaretPosition };
