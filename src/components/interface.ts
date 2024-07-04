import { EditorV3Style } from "@asup/editor-v3";

export interface AieStyleMap {
  [styleName: string]: { css: EditorV3Style; aieExclude?: string[] };
}
export interface AsupInternalEditorProps<T> {
  id: string;
  value?: T;
  setValue?: (ret: T) => void;
  style?: React.CSSProperties;
  styleMap?: AieStyleMap;
  textAlignment?: Draft.DraftComponent.Base.DraftTextAlignment | "decimal" | "default";
  decimalAlignPercent?: number;
  showStyleButtons?: boolean;
  editable?: boolean;
  className?: string;
  resize?: boolean;
  [key: string]: unknown;
}

export interface EditorProps<T> {
  Editor: (props: AsupInternalEditorProps<T>) => JSX.Element;
  getTextFromT: (text: T) => string[];
  replaceTextInT: (s: T, oldPhrase: string, newPhrase: T) => T;
  blankT: T;
  joinTintoBlock: (lines: T[]) => T;
  splitTintoLines: (text: T) => T[];
}
