import { EditorProps } from "../interface";
import { AsupInternalEditor } from "./AsupInternalEditor";
import { getRawTextParts } from "./functions/getRawTextParts";
import { newReplacedText } from "./functions/newReplacedText";
import { joinIntoBlock, splitIntoLines } from "./functions/splitIntoLines";

export const aieV2EditorProps: EditorProps<string> = {
  Editor: AsupInternalEditor,
  getTextFromT: getRawTextParts,
  replaceTextInT: newReplacedText,
  blankT: "",
  joinTintoBlock: joinIntoBlock,
  splitTintoLines: splitIntoLines,
};
