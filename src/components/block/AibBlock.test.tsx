import { render, screen } from "@testing-library/react";
import { testEditorProps } from "../../../__dummy__/TestEditor";
import { AibBlock } from "./AibBlock";
import * as bcp from "./BlockContentProvider";
import { defaultBlockState, IBlockState } from "./blockReducer";
import { AibLineType } from "./interface";

describe("AibLineDisplay", () => {
  test("no render when no state", async () => {
    jest.spyOn(bcp, "useBlockContext").mockReturnValue({ state: null, dispatch: null });

    render(<AibBlock />);
    expect(screen.queryByLabelText("Add line")).not.toBeInTheDocument();
  });

  test("Render line", async () => {
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
      editorProps: testEditorProps,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    const { container } = render(<AibBlock />);

    const lineHolders = container.querySelectorAll("div.aibLineItemHolder");
    expect(lineHolders).toHaveLength(1);
  });
});
