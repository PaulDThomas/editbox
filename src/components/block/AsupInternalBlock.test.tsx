import { ContextWindowStack } from "@asup/context-menu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { testEditorProps } from "../../../__dummy__/TestEditor";
import { AsupInternalBlock } from "./AsupInternalBlock";
import { AibBlockLine, AibLineType } from "./interface";

describe("AsupInternalBlock tests", () => {
  test("Basic render", async () => {
    const id = "line-id";
    const lines: AibBlockLine<string>[] = [
      {
        aifid: "1",
        lineType: AibLineType.leftAndRight,
        left: "First line",
        center: null,
        right: "Right text",
        canEdit: true,
        canRemove: true,
        canMove: true,
        addBelow: true,
        canChangeType: false,
      },
      {
        aifid: "2",
        lineType: AibLineType.centerOnly,
        left: null,
        center: "Second line",
        right: null,
        canEdit: true,
        canRemove: true,
        canMove: true,
        addBelow: true,
        canChangeType: false,
      },
    ];
    const setLines = jest.fn();
    const minLines = 1;
    const maxLines = 5;
    const user = userEvent.setup({ delay: null });

    await act(async () => {
      render(
        <ContextWindowStack>
          <div data-testid="container">
            <AsupInternalBlock
              id={id}
              lines={lines}
              setLines={setLines}
              minLines={minLines}
              maxLines={maxLines}
              editorProps={testEditorProps}
            />
          </div>
        </ContextWindowStack>,
      );
    });
    expect(screen.getByTestId("container")).toMatchSnapshot();

    // Add a line
    const addButton0 = screen.queryAllByLabelText("Add line")[0];
    expect(addButton0).toBeInTheDocument();
    await user.click(addButton0);

    expect(setLines).toHaveBeenLastCalledWith([
      lines[0],
      {
        aifid: "1001",
        lineType: AibLineType.centerOnly,
        left: null,
        center: "",
        right: null,
        canEdit: true,
        canMove: true,
        canRemove: true,
        addBelow: true,
        canChangeType: false,
      },
      lines[1],
    ]);
  });
});
