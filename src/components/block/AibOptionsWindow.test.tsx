import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AibOptionsWindow } from "./AibOptionsWindow";
import * as bcp from "./BlockContentProvider";
import { defaultBlockState, IBlockState } from "./blockReducer";
import { AibBlockLine, AibLineType } from "./interface";
import { testEditorProps } from "../../../__dummy__/TestEditor";
import { act } from "react";

describe("AibOptionsWindow tests", () => {
  const user = userEvent.setup();

  test("no render when no state", async () => {
    const aifid = "line-id";
    jest.spyOn(bcp, "useBlockContext").mockReturnValue({ state: null, dispatch: null });

    render(
      <AibOptionsWindow
        aifid={aifid}
        onClose={jest.fn()}
        showWindow={true}
      />,
    );
    expect(screen.queryByLabelText(/Line type/)).not.toBeInTheDocument();
  });

  test("Readonly render", async () => {
    const aifid = "line-id";
    const mockReturn = jest.fn();
    const onClose = jest.fn();
    const mockLine: AibBlockLine<string> = {
      aifid,
      left: null,
      center: "center",
      right: null,
      lineType: AibLineType.centerOnly,
      canEdit: false,
      canRemove: false,
      canMove: true,
      addBelow: false,
      canChangeType: false,
    };
    const state: IBlockState<string> = {
      ...defaultBlockState,
      lines: [mockLine],
      disabled: true,
      returnData: mockReturn,
      editorProps: testEditorProps,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(
      <AibOptionsWindow
        aifid={aifid}
        onClose={onClose}
        showWindow={true}
      />,
    );

    const displayLabel = screen.queryByText(/Line type/) as HTMLSpanElement;
    expect(displayLabel).toBeInTheDocument();
    const displaySelect = screen.queryByText(/Center only/) as HTMLSpanElement;
    expect(displaySelect).toBeInTheDocument();
    const leftInput = screen.queryByLabelText(/Left/) as HTMLInputElement;
    expect(leftInput).not.toBeInTheDocument();
    const centerInput = screen.queryByLabelText(/Center/) as HTMLInputElement;
    expect(centerInput).toBeInTheDocument();
    expect(centerInput).toHaveValue("center");
    expect(centerInput).toBeDisabled();
    const rightInput = screen.queryByLabelText(/Right/) as HTMLInputElement;
    expect(rightInput).not.toBeInTheDocument();

    expect(dispatch).not.toHaveBeenCalled();
    expect(mockReturn).not.toHaveBeenCalled();
  });

  test("Basic render and update", async () => {
    const aifid = "line-id";
    const mockReturn = jest.fn();
    const onClose = jest.fn();
    const mockLine: AibBlockLine<string> = {
      aifid,
      left: "left",
      center: null,
      right: "right",
      lineType: AibLineType.leftAndRight,
      canEdit: true,
      canRemove: true,
      canMove: true,
      addBelow: false,
      canChangeType: true,
    };
    const state: IBlockState<string> = {
      ...defaultBlockState,
      lines: [mockLine],
      disabled: false,
      returnData: mockReturn,
      editorProps: testEditorProps,
    };
    const dispatch = jest.fn();
    jest
      .spyOn(bcp, "useBlockContext")
      .mockReturnValue({ state: state as IBlockState<unknown>, dispatch });

    render(
      <AibOptionsWindow
        aifid={aifid}
        onClose={onClose}
        showWindow={true}
      />,
    );

    const displaySelect = screen.queryByLabelText(/Line type/) as HTMLSelectElement;
    expect(displaySelect).toBeInTheDocument();
    expect(displaySelect).toHaveValue("Left and Right");
    const leftInput = screen.queryByLabelText(/Left/) as HTMLInputElement;
    expect(leftInput).toBeInTheDocument();
    expect(leftInput).toHaveValue("left");
    const centerInput = screen.queryByLabelText(/Center/) as HTMLInputElement;
    expect(centerInput).not.toBeInTheDocument();
    const rightInput = screen.queryByLabelText(/Right/) as HTMLInputElement;
    expect(rightInput).toBeInTheDocument();
    expect(rightInput).toHaveValue("right");

    expect(dispatch).not.toHaveBeenCalled();
    expect(mockReturn).not.toHaveBeenCalled();

    await act(async () => {
      await user.selectOptions(displaySelect, "Center only");
    });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "UPDATE_LINE",
      aifid,
      line: { ...mockLine, lineType: AibLineType.centerOnly },
    });
  });
});
