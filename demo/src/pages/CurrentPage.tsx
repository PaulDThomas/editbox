import { useMemo, useState } from "react";
import { testEditorProps } from "../../../__dummy__/TestEditor";
import { EditorProps } from "../../../src/components/aie/editorProps";
import { AibLineType, AsupInternalBlock } from "../../../src/main";

export const CurrentPage = () => {
  const [left, setLeft] = useState<string>("");
  const pageBy = useMemo(
    () => ({
      aifid: "page-by",
      lineType: AibLineType.leftOnly,
      left: left,
      addBelow: false,
      canEdit: true,
      canChangeType: true,
      canRemove: false,
      canMove: false,
      center: null,
      right: null,
    }),
    [left],
  );

  return (
    <div
      style={{
        width: "calc(vw - 4rem - 2px)",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "white",
        border: "1px solid black",
        margin: "1rem",
      }}
    >
      <h2>Current</h2>
      <AsupInternalBlock
        id="pageby"
        lineStyle={{
          fontFamily: "Courier New",
          fontSize: "9pt",
          fontWeight: 500,
        }}
        lines={[pageBy]}
        setLines={(ret) => ret[0].left !== left && setLeft(ret[0].left ?? "")}
        externalSingles={[
          {
            airid: "one",
            oldText: "=",
            newText: "<=",
          },
        ]}
        styleMap={{
          Optional: {
            css: { color: "seagreen" },
            aieExclude: ["Notes", "Superscript", "O^", "N^"],
          },
          Notes: {
            css: { color: "royalblue" },
            aieExclude: ["Optional", "Superscript", "O^", "N^"],
          },
          Superscript: {
            css: { verticalAlign: "super", fontSize: "small" },
            aieExclude: ["Optional", "Notes", "O^", "N^"],
          },
          "O^": {
            css: { color: "seagreen", verticalAlign: "super", fontSize: "small" },
            aieExclude: ["Optional", "Notes", "Superscript", "N^"],
          },
          "N^": {
            css: { color: "royalblue", verticalAlign: "super", fontSize: "small" },
            aieExclude: ["Optional", "Notes", "Superscript", "O^"],
          },
        }}
        minLines={1}
        maxLines={1}
        editorProps={testEditorProps as EditorProps<string>}
      />
    </div>
  );
};
