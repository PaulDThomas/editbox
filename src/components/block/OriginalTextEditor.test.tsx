import { render, screen } from "@testing-library/react";
import { TestEditor } from "../../../__dummy__/TestEditor";
import { AieStyleMap } from "../aie";
import { OriginalTextEditor } from "./OriginalTextEditor";

describe("AibOriginalText", () => {
  test("renders the component with provided props", () => {
    const id = "text-id";
    const label = "Unprocessed text:";
    const text = "Lorem ipsum";
    const setText = jest.fn();
    const styleMap: AieStyleMap = { shiny: { css: { color: "pink" }, aieExclude: [] } };
    const canEdit = true;

    render(
      <OriginalTextEditor
        id={id}
        label={label}
        text={text}
        setText={setText}
        styleMap={styleMap}
        canEdit={canEdit}
        Editor={TestEditor}
      />,
    );
    expect(screen.queryByText(label)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(text)).toBeInTheDocument();
  });
});
