import { IEditorV3, joinV3intoBlock, splitV3intoLines } from "@asup/editor-v3";
import { EditorV3Wrapper } from "./EditorV3Wrapper";
import { getTextFromEditorV3 } from "./getTextFromEditorV3";
import { replaceTextInEditorV3 } from "./replaceTextInEditorV3";
import { stringToV3 } from "./stringToV3";
import { EditorProps } from "../../../src/main";

export const v3EditorProps: EditorProps<IEditorV3> = {
  Editor: EditorV3Wrapper,
  getTextFromT: getTextFromEditorV3,
  replaceTextInT: replaceTextInEditorV3,
  blankT: stringToV3(""),
  joinTintoBlock: joinV3intoBlock,
  splitTintoLines: splitV3intoLines,
};
