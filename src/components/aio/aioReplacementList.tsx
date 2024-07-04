import { useCallback, useEffect, useState } from "react";
import { joinIntoBlock, splitIntoLines } from "../aie/functions/splitIntoLines";
import { newReplacement } from "../functions";
import { AieStyleMap, AsupInternalEditorProps } from "../interface";
import { AioIconButton } from "./aioIconButton";
import { AioLabel } from "./aioLabel";
import { AioReplacementDisplay } from "./aioReplacementDisplay";
import { AioExternalReplacements, AioReplacement } from "./interface";

/**
 * Properties for AioReplacements
 * @param value AioReplacement list
 * @param setValue update function
 */
interface AioReplacementListProps<T extends string | object> {
  id: string;
  label?: string;
  replacements?: AioReplacement<T>[];
  setReplacements?: (ret: AioReplacement<T>[]) => void;
  dontAskSpace?: boolean;
  dontAskTrail?: boolean;
  externalLists?: AioExternalReplacements<T>[];
  Editor?: (props: AsupInternalEditorProps<T>) => JSX.Element;
  blankT?: T;
  styleMap?: AieStyleMap;
  joinTintoBlock?: (lines: T[]) => T;
  splitTintoLines?: (text: T) => T[];
}

/**
 * Option item for replacements
 * @param props replacement object
 * @returns JSX
 */
export const AioReplacementList = <T extends string | object>({
  id,
  label,
  replacements,
  setReplacements,
  dontAskSpace,
  dontAskTrail,
  externalLists,
  styleMap,
  joinTintoBlock = joinIntoBlock,
  splitTintoLines = splitIntoLines,
  blankT = "" as T,
  Editor = (props: AsupInternalEditorProps<T>) => {
    const [text, setText] = useState<string>();
    useEffect(() => {
      if (typeof props.value === "string") setText(props.value);
    }, [props.value]);
    if (typeof props.value !== "string")
      throw new Error("If newText is not a string, a custom function is required");
    return (
      <textarea
        id={props.id}
        className={"aio-input"}
        disabled={!props.setValue}
        rows={4}
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        onBlur={() => props.setValue && props.setValue(text as T)}
        style={{ width: "170px", minWidth: "170px" }}
      />
    );
  },
}: AioReplacementListProps<T>): JSX.Element => {
  /** Update individual replacement and send it back */
  const updateReplacement = useCallback(
    (ret: AioReplacement<T>, i: number) => {
      if (typeof setReplacements !== "function") return;
      const newValue = [...(replacements ?? [])];
      newValue[i] = ret;
      setReplacements(newValue);
    },
    [replacements, setReplacements],
  );

  const addReplacement = useCallback(
    (i: number) => {
      if (typeof setReplacements !== "function") return;
      const newReplacements = [...(replacements ?? [])];
      newReplacements.splice(i, 0, newReplacement(blankT));
      setReplacements(newReplacements);
    },
    [blankT, replacements, setReplacements],
  );

  const removeReplacement = useCallback(
    (i: number) => {
      if (typeof setReplacements !== "function") return;
      const newReplacements = [...(replacements ?? [])];
      newReplacements.splice(i, 1);
      setReplacements(newReplacements);
    },
    [replacements, setReplacements],
  );

  return (
    <>
      <AioLabel
        id={`${id}-label`}
        label={label}
      />
      <div>
        {!label && (
          <>
            <span>then...</span>{" "}
          </>
        )}
        {typeof setReplacements === "function" && (
          <div
            id={`${id}-addreplacement`}
            className={"aiox-button aiox-addDown"}
            onClick={() => addReplacement(0)}
          />
        )}
        {(replacements ?? []).map((repl, i) => {
          return (
            <div key={`${i}-${repl.airid}`}>
              {i > 0 && <div> and...</div>}
              <AioReplacementDisplay
                id={`${id}-replacementdisplay-${i}`}
                airid={repl.airid}
                oldText={repl.oldText}
                newTexts={repl.newTexts}
                includeTrailing={repl.includeTrailing}
                externalName={repl.externalName}
                setReplacement={
                  typeof setReplacements === "function"
                    ? (ret) => updateReplacement(ret, i)
                    : undefined
                }
                dontAskSpace={dontAskSpace}
                dontAskTrail={dontAskTrail}
                externalLists={externalLists}
                Editor={Editor}
                styleMap={styleMap}
                blankT={blankT}
                joinTintoBlock={joinTintoBlock}
                splitTintoLines={splitTintoLines}
              />
              {typeof setReplacements === "function" && (
                <div
                  className="aiox-button-holder"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignContent: "center",
                    marginBottom: "2px",
                  }}
                >
                  {replacements && replacements.length >= 1 && (
                    <AioIconButton
                      id={`${id}-remove`}
                      iconName={"aiox-removeUp"}
                      onClick={() => removeReplacement(i)}
                      tipText={"Remove old text"}
                    />
                  )}
                  <AioIconButton
                    id={`${id}-add`}
                    iconName={"aiox-addDown"}
                    onClick={() => addReplacement(i + 1)}
                    tipText={"Add old text"}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

AioReplacementList.displayName = "AioReplacementList";
