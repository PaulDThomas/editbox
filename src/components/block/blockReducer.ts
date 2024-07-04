import { cloneDeep } from "lodash";
import { Dispatch, SetStateAction } from "react";
import { aieV2EditorProps } from "../aie/aiev2EditorProps";
import { AioExternalSingle } from "../aio/interface";
import { AieStyleMap, EditorProps } from "../interface";
import { AibBlockLine, AibLineType } from "./interface";

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
export const REMOVE_LINE = "REMOVE_LINE";
export const SET_STATE = "SET_STATE";
export const UPDATE_CELL = "UPDATE_CELL";
export const UPDATE_LINE = "UPDATE_LINE";

export type Operation = "ADD_LINE" | "REMOVE_LINE" | "SET_STATE" | "UPDATE_CELL" | "UPDATE_LINE";

export interface IBlockAction<T> {
  type: Operation;
  aifid?: string;
  position?: "left" | "center" | "right";
  cellContent?: T;
  line?: AibBlockLine<T>;
  state?: IBlockState<T>;
}

export const blockReducer = <T>(state: IBlockState<T>, action: IBlockAction<T>): IBlockState<T> => {
  // Do nothing is disabeld
  if (state.disabled) return state;
  // Create new state
  let newState = cloneDeep(state);
  const errCheck: string[] = [];
  // Find line index if appropriate
  const ix = action.aifid ? newState.lines.findIndex((l) => l.aifid === action.aifid) : -1;
  // Check action type
  switch (action.type) {
    case ADD_LINE: {
      if (ix === -1) {
        errCheck.push("ADD_LINE: aifid: ${action.aifid} not found in lines array");
        break;
      }
      if (!action.line) {
        errCheck.push("ADD_LINE: line not provided");
        break;
      }
      if (newState.lines.indexOf(action.line) === -1 && newState.lines.length < state.maxLines) {
        newState.lines.splice(ix + 1, 0, action.line);
      }
      break;
    }
    case REMOVE_LINE: {
      if (ix !== -1 && newState.lines.length > state.minLines) {
        newState.lines.splice(ix, 1);
      }
      break;
    }
    case SET_STATE: {
      if (!action.state) {
        errCheck.push("SET_STATE: state not provided");
      } else {
        newState = { ...action.state };
      }
      break;
    }
    case UPDATE_CELL: {
      if (ix === -1) {
        errCheck.push("UPDATE_CELL: aifid: ${action.aifid} not found in lines array");
        break;
      } else if (!action.position) {
        errCheck.push("UPDATE_CELL: position not provided");
        break;
      } else if (!action.cellContent) {
        errCheck.push("UPDATE_CELL: cellContent not provided");
        break;
      }
      newState.lines[ix][action.position] = action.cellContent;
      break;
    }
    case UPDATE_LINE: {
      if (ix === -1 || !action.line) return state;
      newState.lines[ix] = action.line;
      break;
    }
    default:
  }
  if (errCheck.length > 0) {
    console.warn(errCheck);
    return state;
  }
  state.returnData && state.returnData(newState.lines);
  return newState;
};
