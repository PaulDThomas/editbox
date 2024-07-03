import { AsupInternalEditor, AsupInternalEditorProps } from "./AsupInternalEditor";
import { getRawTextParts } from "./functions/getRawTextParts";
import { newReplacedText } from "./functions/newReplacedText";
import { joinIntoBlock, splitIntoLines } from "./functions/splitIntoLines";

export interface EditorProps<T> {
  Editor: (props: AsupInternalEditorProps<T>) => JSX.Element;
  getTextFromT: (text: T) => string[];
  replaceTextInT: (s: T, oldPhrase: string, newPhrase: T) => T;
  blankT: T;
  joinTintoBlock: (lines: T[]) => T;
  splitTintoLines: (text: T) => T[];
}

export const aieV2EditorProps: EditorProps<string> = {
  Editor: AsupInternalEditor,
  getTextFromT: getRawTextParts,
  replaceTextInT: newReplacedText,
  blankT: "",
  joinTintoBlock: joinIntoBlock,
  splitTintoLines: splitIntoLines,
};
