import { fireEvent, render, screen } from "@testing-library/react";
import { AddLineButton } from "./AddLineButton";
import * as bcp from "./BlockContentProvider";
import { ADD_LINE, defaultBlockState, IBlockState } from "./blockReducer";
import { AibLineType } from "./interface";

describe("RemoveLineButton", () => {
  test("No state render", async () => {
    const aifid = "line-id";
    jest.spyOn(bcp, "useBlockContext").mockReturnValue({ state: null, dispatch: null });
    render(<AddLineButton aifid={aifid} />);
    expect(screen.queryByLabelText("Add line")).not.toBeInTheDocument();
  });

  test("Context render and click when max lines", async () => {
    const aifid = "line-id";
    const mockReturn = jest.fn();
    const state: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid,
          left: "left",
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
      maxLines: 1,
      disabled: false,
      returnData: mockReturn,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(<AddLineButton aifid={aifid} />);

    const btn = screen.queryByLabelText("Add line") as HTMLButtonElement;
    expect(btn).toBeInTheDocument();
    fireEvent(btn, new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("Context render and click to dispatch", async () => {
    const aifid = "1st-list";
    const mockReturn = jest.fn();
    const state: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid,
          left: "left",
          center: null,
          right: "right",
          lineType: AibLineType.leftAndRight,
          canEdit: false,
          canRemove: true,
          canMove: false,
          addBelow: false,
          canChangeType: false,
        },
        {
          aifid: "2nd-line",
          left: "left",
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
      returnData: mockReturn,
      defaultType: AibLineType.centerOnly,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(<AddLineButton aifid={aifid} />);

    const btn = screen.queryByLabelText("Add line") as HTMLButtonElement;
    expect(btn).toBeInTheDocument();
    fireEvent(btn, new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(dispatch).toHaveBeenCalledWith({
      type: ADD_LINE,
      aifid,
      line: {
        aifid: "1001",
        left: null,
        center: "",
        right: null,
        lineType: AibLineType.centerOnly,
        canEdit: true,
        canRemove: true,
        canMove: true,
        addBelow: true,
        canChangeType: false,
      },
    });
  });
});
