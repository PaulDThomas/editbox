import { fireEvent, render, screen } from "@testing-library/react";
import { TestEditor, replaceTextInTestEditor } from "../../../__dummy__/TestEditor";
import { AsupInternalBlock } from "./AsupInternalBlock";
import { AibLineType } from "./interface";
import userEvent from "@testing-library/user-event";
import { act } from "react";

describe("AsupInternalBlock tests", () => {
  const user = userEvent.setup();
  test("Basic render and update", async () => {
    const id = "line-id";
    const lines = [
      {
        aifid: "1",
        lineType: AibLineType.leftAndRight,
        left: "First line",
        canEdit: true,
        addBelow: true,
      },
      {
        aifid: "2",
        lineType: AibLineType.centerOnly,
        center: "Second line",
        canEdit: true,
        canRemove: true,
      },
    ];
    const setLines = jest.fn();
    const minLines = 1;
    const maxLines = 5;

    const { container } = render(
      <div data-testid="test-block">
        <AsupInternalBlock
          id={id}
          lines={lines}
          setLines={setLines}
          minLines={minLines}
          maxLines={maxLines}
          editorProps={TestEditor}
          replaceTextInT={replaceTextInTestEditor}
          blankT={""}
        />
      </div>,
    );
    expect(container.querySelector("#line-id")).toBeInTheDocument();
    expect(container.querySelector("#line-id-line-0")).toBeInTheDocument();
    expect(container.querySelector("#line-id-line-1")).toBeInTheDocument();
    expect(container.querySelector("#line-id-line-2")).not.toBeInTheDocument();

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
        canChangeType: false,
        canEdit: true,
        canMove: true,
        canRemove: true,
      },
      lines[1],
    ]);

    // Remove a line
    const removeButton1 = screen.queryAllByLabelText("Remove line")[1];
    expect(removeButton1).toBeInTheDocument();
    await user.click(removeButton1);

    expect(setLines).toHaveBeenLastCalledWith([lines[0]]);

    // Update a line
    const rightInput0 = container.querySelectorAll("input")[1] as HTMLInputElement;
    expect(rightInput0).toBeInTheDocument();
    await act(async () => {
      await user.clear(rightInput0);
      await user.type(rightInput0, "Updated text");
      fireEvent.blur(rightInput0);
    });
    expect(setLines).toHaveBeenLastCalledWith([
      {
        aifid: "1",
        lineType: AibLineType.leftAndRight,
        left: "First line",
        center: null,
        right: "Updated text",
        addBelow: true,
        canChangeType: false,
        canEdit: true,
      },
      lines[1],
    ]);
  });
});
