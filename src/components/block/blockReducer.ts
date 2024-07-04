import { Dispatch, SetStateAction } from "react";
import { aieV2EditorProps } from "../aie/aiev2EditorProps";
import { AioExternalSingle } from "../aio/interface";
import { AieStyleMap, EditorProps } from "../interface";
import { AibBlockLine, AibLineType } from "./interface";
import { newBlockLine } from "./newBlockLine";

export interface IBlockState<T> {
  id: string;
  lines: AibBlockLine<T>[];
  minLines: number;
  maxLines: number;
  externalSingles: AioExternalSingle<T>[];
  lineStyle?: React.CSSProperties;
  styleMap: AieStyleMap;
  defaultType: AibLineType;
  canChangeType: boolean;
  editorProps: EditorProps<T>;
  disabled: boolean;
  returnData?: Dispatch<SetStateAction<AibBlockLine<T>[]>>;
}

export const defaultBlockState: IBlockState<string> = {
  id: "default-block-id",
  lines: [],
  minLines: 1,
  maxLines: 10,
  externalSingles: [],
  styleMap: {},
  defaultType: AibLineType.leftOnly,
  canChangeType: false,
  editorProps: aieV2EditorProps,
  disabled: true,
  returnData: () => {},
};

export const ADD_LINE = "ADD_LINE";
export const SET_LINES = "SET_LINES";
export const REMOVE_LINE = "REMOVE_LINE";
export const UPDATE_CELL = "UPDATE_CELL";
export const UPDATE_LINE = "UPDATE_LINE";

export type Operation = "ADD_LINE" | "REMOVE_LINE" | "SET_LINES" | "UPDATE_CELL" | "UPDATE_LINE";

export interface IBlockAction<T> {
  type: Operation;
  aifid?: string;
  position?: "left" | "center" | "right";
  cellContent?: T;
  line?: AibBlockLine<T>;
  lines?: AibBlockLine<T>[];
}

export const blockReducer = <T>(state: IBlockState<T>, action: IBlockAction<T>): IBlockState<T> => {
  // Do nothing is disabeld
  if (state.disabled) return state;
  // Find line index if appropriate
  const ix = action.aifid ? state.lines.findIndex((l) => l.aifid === action.aifid) : -1;
  // Check action type
  switch (action.type) {
    case ADD_LINE: {
      if (ix === -1) return state;
      const newLines = [...state.lines];
      const newLine = newBlockLine(state.defaultType, state.editorProps.blankT);
      newLines.splice(ix, 0, newLine);
      return { ...state, lines: newLines };
    }
    case REMOVE_LINE: {
      if (ix === -1) return state;
      const newLines = [...state.lines];
      newLines.splice(ix, 1);
      return { ...state, lines: newLines };
    }
    case SET_LINES: {
      return { ...state, lines: action.lines ?? [] };
    }
    case UPDATE_CELL: {
      if (ix === -1 || !action.position || !action.cellContent) return state;
      const newLines = [...state.lines];
      newLines[ix][action.position] = action.cellContent;
      return state;
    }
    case UPDATE_LINE: {
      if (action.aifid && action.line) {
        const ix = state.lines.findIndex((l) => l.aifid === action.aifid);
        if (ix === -1) return state;
        const newLines = [...state.lines];
        newLines[ix] = action.line;
        return { ...state, lines: newLines };
      }
      return state;
    }
    default:
      return state;
  }
};
