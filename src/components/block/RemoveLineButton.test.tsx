import { fireEvent, render, screen } from "@testing-library/react";
import * as bcp from "./BlockContentProvider";
import { defaultBlockState, IBlockState, REMOVE_LINE } from "./blockReducer";
import { AibLineType } from "./interface";
import { RemoveLineButton } from "./RemoveLineButton";

describe("RemoveLineButton", () => {
  test("No state render", async () => {
    const aifid = "line-id";
    jest.spyOn(bcp, "useBlockContext").mockReturnValue({ state: null, dispatch: null });
    render(<RemoveLineButton aifid={aifid} />);
    expect(screen.queryByLabelText("Remove line")).not.toBeInTheDocument();
  });

  test("Context render and click when min lines", async () => {
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
      disabled: false,
      returnData: mockReturn,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(<RemoveLineButton aifid={aifid} />);

    const btn = screen.queryByLabelText("Remove line") as HTMLButtonElement;
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
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(<RemoveLineButton aifid={aifid} />);

    const btn = screen.queryByLabelText("Remove line") as HTMLButtonElement;
    expect(btn).toBeInTheDocument();
    fireEvent(btn, new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(dispatch).toHaveBeenCalledWith({ type: REMOVE_LINE, aifid });
  });
});
