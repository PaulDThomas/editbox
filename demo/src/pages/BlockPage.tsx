import { IEditorV3 } from "@asup/editor-v3";
import { useRef, useState } from "react";
import {
  AibBlockLine,
  AibLineType,
  AioExternalSingle,
  AioSingleReplacements,
  AsupInternalBlock,
} from "../../../src/main";
import { v3EditorProps } from "../v3editor/v3EditorProps";
import { EditorV3Wrapper } from "../v3editor/EditorV3Wrapper";

export const BlockPage = () => {
  const ta = useRef<HTMLTextAreaElement | null>(null);
  // const [lines, setLines] = useState<AibBlockLine<string>[]>([
  //   { lineType: AibLineType.leftAndRight, left: "One line", canEdit: true },
  // ]);
  const [externalSingles, setExternalSingles] = useState<AioExternalSingle<IEditorV3>[]>([]);

  const [lines2, setLines2] = useState<AibBlockLine<IEditorV3>[]>([
    {
      aifid: "line-1",
      lineType: AibLineType.leftOnly,
      left: { lines: [{ textBlocks: [{ text: "1st line", style: "Blue" }] }] },
      center: null,
      right: null,
      canEdit: true,
      canMove: true,
      canRemove: true,
      canChangeType: true,
      addBelow: true,
    },
    {
      aifid: "line-2",
      lineType: AibLineType.leftOnly,
      left: {
        lines: [
          {
            textBlocks: [
              { text: "2nd locked line", style: "Green" },
              { text: "2nd locked line", style: "Green" },
              { text: "lots of locks", style: "Red" },
            ],
          },
        ],
      },
      center: null,
      right: null,
      canEdit: true,
      canMove: true,
      canRemove: true,
      canChangeType: true,
      addBelow: true,
    },
  ]);

  return (
    <>
      <div
        style={{
          width: "calc(vw - 4rem - 2px)",
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "white",
          border: "1px solid black",
          margin: "1rem",
        }}
      >
        <h5 style={{ width: "5rem" }}>Editor v3</h5>
        <AsupInternalBlock<IEditorV3>
          id="test-block-v3"
          lines={lines2}
          setLines={setLines2}
          minLines={1}
          maxLines={10}
          lineStyle={{ fontFamily: "Courier New", fontWeight: 800 }}
          styleMap={{
            Green: { css: { color: "green" }, aieExclude: ["Blue", "Red"] },
            Blue: { css: { color: "blue" }, aieExclude: ["Green", "Red"] },
            Red: { css: { color: "red" }, aieExclude: ["Green", "Blue"] },
          }}
          defaultType={AibLineType.leftOnly}
          externalSingles={externalSingles}
          editorProps={{
            ...v3EditorProps,
            Editor: (props) => (
              <EditorV3Wrapper
                {...props}
                customStyleMap={{
                  Green: { backgroundColor: "green", isLocked: true },
                  Blue: { color: "blue" },
                  Red: { color: "red", isLocked: true },
                }}
              />
            ),
          }}
        />
      </div>

      {/* <div
        style={{
          width: "calc(vw - 4rem - 2px)",
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "white",
          border: "1px solid black",
          margin: "1rem",
        }}
      >
        <h5 style={{ width: "5rem" }}>Titles</h5>
        <AsupInternalBlock
          id="test-block"
          lines={lines}
          setLines={setLines}
          minLines={3}
          maxLines={10}
          externalSingles={externalSingles}
          style={{ fontFamily: "Courier New", fontWeight: 800 }}
          styleMap={{
            Green: { css: { color: "green" }, aieExclude: ["Blue", "Red"] },
            Blue: { css: { color: "blue" }, aieExclude: ["Green", "Red"] },
            Red: { css: { color: "red" }, aieExclude: ["Green", "Blue"] },
          }}
          defaultType={AibLineType.centerOnly}
        />
      </div> */}

      {/* <div
        style={{
          width: "calc(vw - 4rem - 2px)",
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "white",
          border: "1px solid black",
          margin: "1rem",
        }}
      >
        <h5 style={{ width: "5rem" }}>Footnotes</h5>
        <AsupInternalBlock
          id="test-block"
          lines={lines}
          setLines={setLines}
          minLines={3}
          maxLines={10}
          externalSingles={externalSingles}
          style={{ fontFamily: "Courier New", fontWeight: 800 }}
          styleMap={{
            Green: { css: { color: "green" }, aieExclude: ["Blue", "Red"] },
            Blue: { css: { color: "blue" }, aieExclude: ["Green", "Red"] },
            Red: { css: { color: "red" }, aieExclude: ["Green", "Blue"] },
          }}
          defaultType={AibLineType.leftOnly}
        />
      </div> */}

      {/* <div
        style={{
          width: "calc(vw - 4rem - 2px)",
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "white",
          border: "1px solid black",
          margin: "1rem",
        }}
      >
        <h5 style={{ width: "5rem" }}>Freeform</h5>
        <AsupInternalBlock
          id="test-block"
          lines={lines}
          setLines={setLines}
          minLines={3}
          maxLines={10}
          externalSingles={externalSingles}
          style={{ fontFamily: "Courier New", fontWeight: 800 }}
          styleMap={{
            Green: { css: { color: "green" }, aieExclude: ["Blue", "Red"] },
            Blue: { css: { color: "blue" }, aieExclude: ["Green", "Red"] },
            Red: { css: { color: "red" }, aieExclude: ["Green", "Blue"] },
          }}
          defaultType={AibLineType.leftOnly}
          canChangeType={true}
        />
      </div> */}

      <div style={{ margin: "1rem" }}>
        <AioSingleReplacements
          id="test-singles"
          replacements={externalSingles}
          setReplacements={(ret) => setExternalSingles(ret)}
        />
      </div>

      <div
        style={{
          margin: "1rem",
          padding: "1rem",
          border: "solid black 3px",
          backgroundColor: "rgb(240, 240, 240)",
        }}
      >
        <button
          onClick={() => {
            try {
              if (!ta.current) return;
              if (ta.current.value === "") {
                ta.current.value = window.localStorage.getItem("blockContent") ?? "";
              }
              const j = JSON.parse(ta.current.value ?? "[]");
              setLines2(j);
              // const convert = j.map((l) => convertBlockLine(l));
              // setLines2(convert);
            } catch (e) {
              console.warn("JSON parse failed");
              console.dir(e);
            }
          }}
        >
          Load
        </button>
        <button
          onClick={() => {
            if (!ta.current) return;
            ta.current.value = JSON.stringify(lines2, null, 2);
            window.localStorage.setItem("blockContent", ta.current.value);
          }}
        >
          Save
        </button>
        <pre style={{ width: "100%" }}>
          <textarea
            ref={ta}
            style={{ width: "100%", height: "220px" }}
            rows={6}
          />
        </pre>
      </div>
    </>
  );
};
