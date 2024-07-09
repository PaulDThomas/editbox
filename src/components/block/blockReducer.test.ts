import { EditorProps } from "../interface";
import {
  ADD_LINE,
  blockReducer,
  IBlockAction,
  IBlockState,
  REMOVE_LINE,
  SET_STATE,
  UPDATE_CELL,
  UPDATE_LINE,
} from "./blockReducer";
import { AibBlockLine, AibLineType } from "./interface";

const uninitialisedEditorProps: EditorProps<string> = {
  Editor: function (): JSX.Element {
    throw new Error("Function not implemented.");
  },
  getTextFromT: function (): string[] {
    throw new Error("Function not implemented.");
  },
  replaceTextInT: function (): string {
    throw new Error("Function not implemented.");
  },
  blankT: "",
  joinTintoBlock: function (): string {
    throw new Error("Function not implemented.");
  },
  splitTintoLines: function (): string[] {
    throw new Error("Function not implemented.");
  },
};

describe("blockReducer", () => {
  let initialState: IBlockState<string>;
  let initialLine: AibBlockLine<string>;

  beforeEach(() => {
    initialLine = {
      aifid: "line-id",
      left: "Left content",
      center: "Center content",
      right: "Right content",
      lineType: AibLineType.leftCenterAndRight,
      canEdit: true,
      canRemove: true,
      canMove: true,
      addBelow: true,
      canChangeType: true,
    };

    initialState = {
      id: "default-block-id",
      lines: [
        { ...initialLine, aifid: "line-1" },
        { ...initialLine, aifid: "line-2" },
      ],
      minLines: 1,
      maxLines: 10,
      externalSingles: [],
      styleMap: {},
      defaultType: AibLineType.leftOnly,
      canChangeType: false,
      editorProps: uninitialisedEditorProps,
      disabled: false,
      returnData: () => {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should not add a line", () => {
    initialState.maxLines = 2;
    const action: IBlockAction<string> = {
      type: ADD_LINE,
      aifid: "line-id",
      line: initialLine,
    };
    const newState = blockReducer(initialState, action);
    expect(newState.lines).toHaveLength(2);
  });

  test("should add a line", () => {
    const action: IBlockAction<string> = {
      type: ADD_LINE,
      aifid: "line-2",
      line: initialLine,
    };
    const newState = blockReducer(initialState, action);
    expect(newState.lines).toHaveLength(3);
    expect(newState.lines[2]).toEqual(action.line);
  });

  test("should return initialState when ADD_LINE line not provided", () => {
    const action: IBlockAction<string> = {
      type: ADD_LINE,
      aifid: "line-2",
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should not remove a line", () => {
    initialState.minLines = 2;
    const action: IBlockAction<string> = {
      type: REMOVE_LINE,
      aifid: "line-1",
    };
    const newState = blockReducer(initialState, action);
    expect(newState.lines).toHaveLength(2);
  });

  test("should return initialState when ADD_LINE aifid not found", () => {
    const action: IBlockAction<string> = {
      type: ADD_LINE,
      line: initialLine,
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should remove a line", () => {
    const action: IBlockAction<string> = {
      type: REMOVE_LINE,
      aifid: "line-1",
    };
    const newState = blockReducer(initialState, action);
    expect(newState.lines).toHaveLength(1);
    expect(newState.lines[0].aifid).toBe("line-2");
  });

  test("should return initialState when REMOVE_LINE aifid not found", () => {
    const action: IBlockAction<string> = {
      type: REMOVE_LINE,
      aifid: "line-3",
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should set the state", () => {
    const newState: IBlockState<string> = {
      id: "new-block-id",
      lines: [initialLine],
      minLines: 2,
      maxLines: 5,
      externalSingles: [],
      styleMap: {},
      defaultType: AibLineType.centerOnly,
      canChangeType: true,
      editorProps: uninitialisedEditorProps,
      disabled: true,
      returnData: () => {},
    };

    const action: IBlockAction<string> = {
      type: SET_STATE,
      state: newState,
    };
    const updatedState = blockReducer(initialState, action);
    expect(updatedState).toEqual(newState);
  });

  test("should not set the state when disabled", () => {
    initialState.disabled = true;
    const newState: IBlockState<string> = {
      id: "new-block-id",
      lines: [initialLine],
      minLines: 2,
      maxLines: 5,
      externalSingles: [],
      styleMap: {},
      defaultType: AibLineType.centerOnly,
      canChangeType: true,
      editorProps: uninitialisedEditorProps,
      disabled: true,
      returnData: () => {},
    };

    const action: IBlockAction<string> = {
      type: SET_STATE,
      state: newState,
    };
    const updatedState = blockReducer(initialState, action);
    expect(updatedState).toEqual(initialState);
  });

  test("should return initialState when SET_STATE state not provided", () => {
    const action: IBlockAction<string> = {
      type: SET_STATE,
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should update a cell", () => {
    const newCellContent = "British centre cell";
    const action: IBlockAction<string> = {
      type: UPDATE_CELL,
      aifid: "line-1",
      position: "center",
      cellContent: newCellContent,
    };
    const newState = blockReducer(initialState, action);
    expect(newState.lines[0].center).toBe(newCellContent);
  });

  test("should return initialState when UPDATE_CELL aifid not found", () => {
    const action: IBlockAction<string> = {
      type: UPDATE_CELL,
      position: "center",
      cellContent: "new cell content",
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should return initialState when UPDATE_CELL content not found", () => {
    const action: IBlockAction<string> = {
      type: UPDATE_CELL,
      position: "center",
      aifid: "line-1",
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should return initialState when UPDATE_CELL position not provided", () => {
    const action: IBlockAction<string> = {
      type: UPDATE_CELL,
      aifid: "line-1",
      cellContent: "new cell content",
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });

  test("should update a line", () => {
    const newLine: AibBlockLine<string> = {
      aifid: "line-id",
      lineType: AibLineType.centerOnly,
      left: null,
      center: "British centre cell",
      right: null,
      canEdit: true,
      canRemove: true,
      canMove: true,
      addBelow: true,
      canChangeType: true,
    };
    const action: IBlockAction<string> = {
      type: UPDATE_LINE,
      aifid: "line-2",
      line: newLine,
    };
    const newState = blockReducer(initialState, action);
    expect(newState.lines[1]).toEqual(newLine);
  });

  test("should return initialState when UPDATE_LINE aifid not found", () => {
    const action: IBlockAction<string> = {
      type: UPDATE_LINE,
      line: initialLine,
    };
    expect(blockReducer(initialState, action)).toEqual(initialState);
  });
});
