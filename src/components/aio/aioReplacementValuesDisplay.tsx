import { useCallback } from "react";
import { AioExternalReplacements, AioReplacement, AioReplacementValues } from "./interface";
import { AioReplacementList } from "./aioReplacementList";
import { AieStyleMap, AsupInternalEditorProps } from "../interface";

interface AioReplacementValuesDisplayProps<T extends string | object> {
  id: string;
  airid?: string;
  texts?: T[];
  spaceAfter?: boolean;
  subLists?: AioReplacement<T>[];
  setReplacementValue?: (ret: AioReplacementValues<T>) => void;
  dontAskSpace?: boolean;
  dontAskTrail?: boolean;
  externalLists?: AioExternalReplacements<T>[];
  Editor: (props: AsupInternalEditorProps<T>) => JSX.Element;
  blankT: T;
  styleMap?: AieStyleMap;
  joinTintoBlock: (lines: T[]) => T;
  splitTintoLines: (text: T) => T[];
}

export const AioReplacementValuesDisplay = <T extends string | object>({
  id,
  airid,
  texts,
  spaceAfter,
  subLists,
  setReplacementValue,
  dontAskSpace,
  dontAskTrail,
  externalLists,
  styleMap,
  joinTintoBlock,
  blankT,
  Editor,
  splitTintoLines,
}: AioReplacementValuesDisplayProps<T>): JSX.Element => {
  const returnData = useCallback(
    (newRV: {
      externalName?: string;
      texts?: T[];
      spaceAfter?: boolean;
      subLists?: AioReplacement<T>[];
    }) => {
      if (typeof setReplacementValue !== "function") return;
      const r: AioReplacementValues<T> = {
        airid: airid,
        spaceAfter: newRV.spaceAfter ?? spaceAfter,
        texts: newRV.texts ?? texts ?? [],
        subLists: newRV.subLists ?? subLists,
      };
      setReplacementValue(r);
    },
    [airid, setReplacementValue, spaceAfter, subLists, texts],
  );

  return (
    <div
      className="aiordv-main"
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          marginRight: "4px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "2px",
        }}
      >
        <Editor
          id={id}
          editable={setReplacementValue !== undefined}
          value={joinTintoBlock(texts ?? [blankT])}
          setValue={(ret) => returnData({ texts: splitTintoLines(ret) })}
          style={{
            width: "170px",
            minWidth: "170px",
            minHeight: "64px",
            marginTop: "4px",
            height: "Calc(100% - 16px)",
            padding: "4px",
            border: "1px solid black",
            borderRadius: "4px",
          }}
          styleMap={styleMap}
          resize
        />
        {!dontAskSpace && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <label>
              <small>Space after repeat</small>
            </label>
            <input
              id={`${id}-spaceafter`}
              style={{ margin: "6px" }}
              type="checkbox"
              checked={spaceAfter}
              disabled={!setReplacementValue}
              onChange={(e) => returnData({ spaceAfter: e.currentTarget.checked })}
            />
          </div>
        )}
      </div>
      {typeof setReplacementValue === "function" || (subLists?.length ?? 0) > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                flexGrow: 1,
                minWidth: "5px",
                width: "5px",
                borderBottom: "1px burlywood solid",
                borderBottomRightRadius: "4px",
              }}
            />
            <div
              style={{
                flexGrow: 1,
                minWidth: "5px",
                width: "5px",
                borderTop: "1px burlywood solid",
                borderTopRightRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              minWidth: "5px",
              width: "5px",
              marginTop: "6px",
              marginBottom: "6px",
              borderLeft: "1px burlywood solid",
              borderTop: "1px burlywood solid",
              borderBottom: "1px burlywood solid",
              borderTopLeftRadius: "4px",
              borderBottomLeftRadius: "4px",
            }}
          />
          <AioReplacementList
            id={`${id}-sublists`}
            replacements={subLists}
            setReplacements={
              typeof setReplacementValue === "function"
                ? (ret) => returnData({ subLists: ret })
                : undefined
            }
            dontAskSpace={typeof setReplacementValue === "function" ? dontAskSpace : true}
            dontAskTrail={dontAskTrail}
            externalLists={externalLists}
            Editor={Editor}
            blankT={blankT}
            styleMap={styleMap}
            joinTintoBlock={joinTintoBlock}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

AioReplacementValuesDisplay.displayName = "AioReplacementValuesDisplay";
