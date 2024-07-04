import { useCallback, useEffect, useMemo, useState } from "react";
import { fromHtml, newReplacementValues, toHtml } from "../functions";
import { AieStyleMap, AsupInternalEditorProps } from "../interface";
import { AioDropSelect } from "./aioDropSelect";
import { AioIconButton } from "./aioIconButton";
import { AioReplacementValuesDisplay } from "./aioReplacementValuesDisplay";
import { AioExternalReplacements, AioReplacement, AioReplacementValues } from "./interface";

interface AioReplacmentDisplayProps<T extends string | object> {
  id: string;
  airid?: string;
  oldText?: string;
  newTexts: AioReplacementValues<T>[];
  includeTrailing?: boolean;
  externalName?: string;
  setReplacement?: (ret: AioReplacement<T>) => void;
  externalLists?: AioExternalReplacements<T>[];
  dontAskSpace?: boolean;
  dontAskTrail?: boolean;
  noText?: boolean;
  Editor: (props: AsupInternalEditorProps<T>) => JSX.Element;
  blankT: T;
  styleMap?: AieStyleMap;
  joinTintoBlock: (lines: T[]) => T;
  splitTintoLines: (text: T) => T[];
}

/**
 * Render an individuial AioReplacement
 * @param props value/setValue pair
 */
export const AioReplacementDisplay = <T extends string | object>({
  id,
  airid,
  oldText,
  newTexts,
  includeTrailing,
  externalName,
  setReplacement,
  externalLists,
  dontAskSpace,
  dontAskTrail,
  noText: noOldText,
  styleMap,
  joinTintoBlock,
  splitTintoLines,
  blankT,
  Editor,
}: AioReplacmentDisplayProps<T>): JSX.Element => {
  const [displayText, setDisplayText] = useState<string>(fromHtml(oldText ?? ""));
  useEffect(() => {
    setDisplayText(fromHtml(oldText ?? ""));
  }, [oldText]);

  const availableListNames = useMemo<string[]>(() => {
    const a: string[] = ["with..."];
    const exl: string[] = [];
    externalLists?.map((rep) => {
      if (rep.givenName !== undefined) {
        exl.push(rep.givenName);
      }
      return true;
    });
    a.push(...exl.sort((a, b) => a.localeCompare(b)));
    return a;
  }, [externalLists]);

  /** Send back updates */
  const returnData = useCallback(
    (newReplacement: {
      airid?: string;
      oldText?: string;
      newTexts?: AioReplacementValues<T>[];
      spaceAfter?: boolean;
      includeTrailing?: boolean;
      externalName?: string;
    }) => {
      if (typeof setReplacement !== "function") return;
      // Create new object
      const r: AioReplacement<T> = {
        airid: newReplacement.airid ?? airid ?? crypto.randomUUID(),
        oldText: newReplacement.oldText ?? oldText ?? "",
        newTexts: newReplacement.newTexts ?? newTexts,
        includeTrailing: newReplacement.includeTrailing ?? includeTrailing,
        externalName: newReplacement.externalName ?? externalName,
      };
      // Remove default
      if (r.externalName === "with...") delete r.externalName;

      // Update existing object
      setReplacement(r);
    },
    [setReplacement, airid, oldText, newTexts, includeTrailing, externalName],
  );

  const addNewText = useCallback(
    (i: number) => {
      if (typeof setReplacement !== "function") return;
      const nts = [...newTexts];
      nts.splice(i, 0, newReplacementValues(blankT));
      returnData({ newTexts: nts });
    },
    [blankT, newTexts, returnData, setReplacement],
  );

  const removeNewText = useCallback(
    (i: number) => {
      if (typeof setReplacement !== "function") return;
      const nts = [...newTexts];
      nts.splice(i, 1);
      returnData({ newTexts: nts });
    },
    [newTexts, returnData, setReplacement],
  );

  /**
   * Update the list
   * @param string value that will be split by new line into repeats
   */
  return (
    <div
      id={id}
      className="aiord-main"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        border: "1px dotted burlywood",
        padding: "2px",
        borderRadius: "4px,",
        margin: "2px",
      }}
    >
      {!noOldText && (
        <div>
          {typeof setReplacement !== "function" ? (
            <span className="aio-replaceText">
              {oldText !== "" ? fromHtml(oldText ?? "") : <em>Nothing</em>}
            </span>
          ) : (
            <input
              id={`${id}-input`}
              className="aio-input"
              type="text"
              value={displayText}
              onChange={(e) => setDisplayText(e.currentTarget.value)}
              onBlur={(e) => {
                returnData({ oldText: toHtml(e.currentTarget.value) });
              }}
              style={{ minWidth: 0, width: "170px" }}
            />
          )}
          {!dontAskTrail && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <label>
                <small>Include trailing rows</small>
              </label>
              <input
                id={`${id}-includetrailing`}
                disabled={typeof setReplacement !== "function"}
                style={{ margin: "6px" }}
                type="checkbox"
                checked={includeTrailing}
                onChange={(e) => returnData({ includeTrailing: e.currentTarget.checked })}
              />
            </div>
          )}
        </div>
      )}
      {typeof setReplacement === "function" &&
        externalLists !== undefined &&
        externalLists.length > 0 && (
          <div>
            <AioDropSelect
              id={`${id}-dropselect`}
              value={externalName ?? "with..."}
              availableValues={availableListNames}
              setValue={(ret) => {
                returnData({ externalName: ret });
              }}
            />
          </div>
        )}
      <div>
        {externalLists?.some((e) => e.givenName === externalName) ? (
          <>
            {externalLists
              ?.find((e) => e.givenName === externalName)
              ?.newTexts.map((e, i) => (
                <AioReplacementValuesDisplay
                  id={`${id}-subdisplay`}
                  key={i}
                  texts={e.texts}
                  subLists={e.subLists}
                  Editor={Editor}
                  blankT={blankT}
                  styleMap={styleMap}
                  joinTintoBlock={joinTintoBlock}
                  splitTintoLines={splitTintoLines}
                />
              ))}
          </>
        ) : (
          <>
            {newTexts.map((rv, i) => (
              <div key={`${i}-${rv.airid}`}>
                <AioReplacementValuesDisplay
                  id={`${id}-subdisplay`}
                  key={rv.airid}
                  airid={rv.airid}
                  texts={rv.texts}
                  spaceAfter={rv.spaceAfter}
                  subLists={rv.subLists}
                  externalLists={externalLists}
                  dontAskSpace={dontAskSpace}
                  dontAskTrail={typeof setReplacement === "function" ? dontAskTrail : true}
                  setReplacementValue={
                    typeof setReplacement === "function"
                      ? (ret) => {
                          const nts = [...newTexts];
                          nts.splice(i, 1, ret);
                          returnData({ newTexts: nts });
                        }
                      : undefined
                  }
                  Editor={Editor}
                  styleMap={styleMap}
                  blankT={blankT}
                  joinTintoBlock={joinTintoBlock}
                  splitTintoLines={splitTintoLines}
                />
                {typeof setReplacement === "function" && (
                  <div
                    className="aiox-button-holder"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignContent: "center",
                      marginLeft: "2.5rem",
                      marginTop: "2px",
                    }}
                  >
                    {newTexts && newTexts.length > 1 && (
                      <AioIconButton
                        id={`${id}-remove`}
                        iconName={"aiox-removeUp"}
                        onClick={() => removeNewText(i)}
                        tipText={"Remove new text"}
                      />
                    )}
                    <AioIconButton
                      id={`${id}-add`}
                      iconName={"aiox-addDown"}
                      onClick={() => addNewText(i + 1)}
                      tipText={"Add new text"}
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

AioReplacementDisplay.displayName = "AioReplacementDisplay";
