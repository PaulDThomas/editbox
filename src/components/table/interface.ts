import { DraftComponent } from "draft-js";
import { AioExternalReplacements, AioReplacement } from "../aio";
import { AieStyleMap, AsupInternalEditorProps } from "../interface";

export interface AitCellData<T extends string | object> {
  aitid?: string; // Unique ID
  text: T;
  justifyText?: DraftComponent.Base.DraftTextAlignment | "decimal" | "default";
  comments: T;
  colWidth?: number;
  textIndents?: number; // Spaces/tabs at the start of the cell
  replacedText?: T; // Visible text after any list replacements
  spaceAfterRepeat?: boolean; // If a blank row is required after this repeat
}

export interface AitHeaderCellData<T extends string | object> extends AitCellData<T> {
  colSpan?: number;
  rowSpan?: number;
  repeatColSpan?: number; // ColSpan after any list replacements
  repeatRowSpan?: number; // RowSpan after any list replacements
  spaceAfterSpan?: number; // Number of rowSpaceAfters being crossed
}

export interface AitRowData<T extends string | object> {
  aitid?: string; // Unique ID
  rowRepeat?: string; // Repeat ID
  cells: AitCellData<T>[];
  spaceAfter?: boolean; // Indicator if there is space after a row
}

export interface AitHeaderRowData<T extends string | object> extends AitRowData<T> {
  cells: AitHeaderCellData<T>[];
}

export interface AitRowGroupData<T extends string | object> {
  aitid?: string; // Unique ID
  name?: string; // Optional name for a row group type
  rows: AitRowData<T>[];
  comments?: T;
  spaceAfter?: boolean; // Indicator if there is space after the last row in the group
  replacements?: AioReplacement<T>[]; // Replacement lists to use for repeats
}

export interface AitHeaderGroupData<T extends string | object> extends AitRowGroupData<T> {
  rows: AitHeaderRowData<T>[];
}

export interface AitTableData<T extends string | object> {
  headerData?: AitHeaderGroupData<T> | false;
  bodyData?: AitRowGroupData<T>[];
  comments?: T;
  rowHeaderColumns?: number; // Number of label type columns before data is presented
  noRepeatProcessing?: boolean; // Indicator is repeat lists should be processed
  decimalAlignPercent?: number; // Decimal alignment percent
}

export interface AitCoord {
  row: number;
  column: number;
}

export interface AitLocation extends AitCoord {
  tableSection: AitRowType;
  rowGroup: number;
  rowRepeat?: string;
  colRepeat?: string;
}

export interface AitColumnRepeat {
  columnIndex: number;
  colRepeat?: string;
}

export enum AitCellType {
  header = "header",
  rowHeader = "rowHeader",
  body = "body",
}

export enum AitRowType {
  header = "header",
  body = "body",
}

export interface AitOptionList<T extends string | object> {
  /* Table options and setters */
  noRepeatProcessing?: boolean;
  externalLists?: AioExternalReplacements<T>[];
  showCellBorders?: boolean;
  groupTemplateNames?: string[];
  commentStyles?: AieStyleMap;
  cellStyles?: AieStyleMap;
  columnRepeats?: AitColumnRepeat[] | null;
  colWidthMod: number;
  decimalAlignPercent: number;
  defaultCellWidth: number;

  /* Table options with setters */
  editable: boolean;
  headerRows?: number;
  setHeaderRows?: (ret: number) => void;
  rowHeaderColumns?: number;
  setRowHeaderColumns?: (ret: number) => void;
  windowZIndex: number;
  setWindowZIndex?: (ret: number) => void;
  setDecimalAlignPercent?: (ret: number) => void;

  /* Editor options */
  blank: T;
  Editor?: (props: AsupInternalEditorProps<T>) => JSX.Element;
  getTextFromT?: (text: T) => string[];
  replaceTextInT?: (s: T, oldPhrase: string, newPhrase: T) => T;
  joinTintoBlock?: (lines: T[]) => T;
  splitTintoLines?: (text: T) => T[];
}
