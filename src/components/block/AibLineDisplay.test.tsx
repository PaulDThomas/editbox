import { ContextWindowStack } from "@asup/context-menu";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { testEditorProps } from "../../../__dummy__/TestEditor";
import { AibLineDisplay } from "./AibLineDisplay";
import * as bcp from "./BlockContentProvider";
import { defaultBlockState, IBlockState } from "./blockReducer";
import { AibLineType } from "./interface";

describe("AibLineDisplay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  const user = userEvent.setup({ delay: null });

  test("no render when no state", async () => {
    const aifid = "line-id";
    jest.spyOn(bcp, "useBlockContext").mockReturnValue({ state: null, dispatch: null });

    render(<AibLineDisplay aifid={aifid} />);
    expect(screen.queryByLabelText("Add line")).not.toBeInTheDocument();
  });

  test("Read only render", async () => {
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

    const { container } = render(
      <ContextWindowStack>
        <AibLineDisplay aifid={aifid} />
      </ContextWindowStack>,
    );

    const lineHolder = container.querySelector("div.aibLineItemHolder") as HTMLDivElement;
    expect(lineHolder).toBeInTheDocument();
    expect(lineHolder.children).toHaveLength(2);
    expect(lineHolder.children[0]).toHaveClass("aibLineItem");
    expect(lineHolder.children[0]).toHaveClass("aibReadOnly");
    expect(lineHolder.children[0]).toHaveClass("two");
    const leftInput = screen.queryByDisplayValue("left") as HTMLInputElement;
    expect(leftInput).toBeInTheDocument();
    expect(leftInput).toBeDisabled();
    expect(lineHolder.children[1]).toHaveClass("aibLineItem");
    expect(lineHolder.children[1]).toHaveClass("aibReadOnly");
    expect(lineHolder.children[1]).toHaveClass("two");
    const rightInput = screen.queryByDisplayValue("right") as HTMLInputElement;
    expect(rightInput).toBeInTheDocument();
    expect(rightInput).toBeDisabled();

    expect(screen.queryByLabelText(/Center/)).not.toBeInTheDocument();
  });

  test("Basic render and show/hide window", async () => {
    const aifid = "line-id";
    const mockReturn = jest.fn();
    const state: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid,
          left: "left",
          center: "center",
          right: "right",
          lineType: AibLineType.leftCenterAndRight,
          canEdit: true,
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

    const { container } = render(
      <ContextWindowStack>
        <AibLineDisplay aifid={aifid} />
      </ContextWindowStack>,
    );

    const lineHolder = container.querySelector("div.aibLineItemHolder") as HTMLDivElement;
    await act(async () => {
      fireEvent.mouseEnter(lineHolder);
      fireEvent.contextMenu(lineHolder);
      jest.runAllTimers();
    });
    const optionsMenu = screen.queryByText("Show line options") as HTMLSpanElement;
    expect(optionsMenu).toBeInTheDocument();
    await act(async () => await user.click(optionsMenu));
    await act(async () => jest.runAllTimers());
    expect(optionsMenu).not.toBeInTheDocument();
    const optionsWindowTitle = screen.queryByText(/Line options/);
    expect(optionsWindowTitle).toBeInTheDocument();
    const optionsWindowClose = screen.queryByLabelText(/Close window/) as Element;
    expect(optionsWindowClose).toBeInTheDocument();

    await act(async () => await user.click(optionsWindowClose));
    await act(async () => jest.runAllTimers());
    expect(optionsWindowTitle).not.toBeInTheDocument();
  });
});
