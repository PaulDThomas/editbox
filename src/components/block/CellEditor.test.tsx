import { fireEvent, render, screen } from "@testing-library/react";
import { testEditorProps } from "../../../__dummy__/TestEditor";
import * as bcp from "./BlockContentProvider";
import { defaultBlockState, IBlockState } from "./blockReducer";
import { CellEditor } from "./CellEditor";
import { AibLineType } from "./interface";

describe("AibOriginalText", () => {
  test("no render when no state", async () => {
    const aifid = "line-id";
    jest.spyOn(bcp, "useBlockContext").mockReturnValue({ state: null, dispatch: null });

    render(
      <CellEditor
        aifid={aifid}
        position={"left"}
      />,
    );
    expect(screen.queryByDisplayValue("left")).not.toBeInTheDocument();
  });

  test("renders the component with provided props & return", async () => {
    const aifid = "line-id";
    const mockReturn = jest.fn();
    const state: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid,
          left: "old left",
          center: null,
          right: "right",
          lineType: AibLineType.leftAndRight,
          canEdit: false,
          canRemove: true,
          canMove: false,
          addBelow: false,
          canChangeType: false,
        },
      ],
      disabled: false,
      externalSingles: [{ airid: "repl", oldText: "old", newText: "replaced" }],
      returnData: mockReturn,
      editorProps: testEditorProps,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(
      <CellEditor
        aifid={aifid}
        position={"left"}
      />,
    );

    const input = screen.queryByDisplayValue("replaced left") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "new left" } });
    fireEvent.blur(input);
    expect(dispatch).toHaveBeenCalledWith({
      type: "UPDATE_CELL",
      aifid: "line-id",
      position: "left",
      cellContent: "new left",
    });
  });
});
