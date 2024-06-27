import { cloneDeep } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { AieStyleMap } from "../aie";
import { AsupInternalEditorProps } from "../aie/AsupInternalEditor";
import { AioExternalSingle, AioIconButton } from "../aio";
import { AibOptionsWindow } from "./AibOptionsWindow";
import styles from "./aib.module.css";
import { AibBlockLine, AibLineType } from "./interface";

export interface AibLineDisplayProps<T extends string | object> {
  id: string;
  aifid?: string;
  displayType: AibLineType;
  left?: T | null;
  center?: T | null;
  right?: T | null;
  externalSingles?: AioExternalSingle<T>[];
  addBelow?: boolean;
  canEdit?: boolean;
  canRemove?: boolean;
  canMove?: boolean;
  canChangeType?: boolean;
  setLine?: (ret: AibBlockLine<T>) => void;
  addLine?: () => void;
  removeLine?: () => void;
  style?: React.CSSProperties;
  styleMap?: AieStyleMap;
  Editor: (props: AsupInternalEditorProps<T>) => JSX.Element;
  blankT: T;
  replaceTextInT: (s: T, oldPhrase: string, newPhrase: T) => T;
}

export const AibLineDisplay = <T extends string | object>({
  id,
  aifid,
  displayType,
  left,
  center,
  right,
  externalSingles,
  addBelow,
  canEdit,
  canRemove,
  canMove,
  canChangeType = false,
  setLine,
  addLine,
  removeLine,
  style,
  styleMap,
  Editor,
  blankT,
  replaceTextInT,
}: AibLineDisplayProps<T>): JSX.Element => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const returnData = useCallback(
    (lineUpdate: {
      left?: T | null;
      center?: T | null;
      right?: T | null;
      displayType?: AibLineType;
    }) => {
      if (setLine) {
        const newLine: AibBlockLine<T> = {
          aifid: aifid,
          lineType: lineUpdate.displayType ?? displayType,
          left: lineUpdate.left ? lineUpdate.left : left ?? null,
          center: lineUpdate.center ? lineUpdate.center : center ?? null,
          right: lineUpdate.right ? lineUpdate.right : right ?? null,
          addBelow: addBelow,
          canEdit: canEdit,
          canRemove: canRemove,
          canMove: canMove,
          canChangeType: canChangeType,
        };
        if (
          [AibLineType.leftAndRight, AibLineType.leftCenterAndRight, AibLineType.leftOnly].includes(
            newLine.lineType,
          ) &&
          !newLine.left
        )
          newLine.left = blankT;
        if (
          [AibLineType.centerOnly, AibLineType.leftCenterAndRight].includes(newLine.lineType) &&
          !newLine.center
        )
          newLine.center = blankT;
        if (
          [AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(newLine.lineType) &&
          !newLine.right
        )
          newLine.right = blankT;
        setLine(newLine);
      }
    },
    [
      addBelow,
      aifid,
      blankT,
      canChangeType,
      canEdit,
      canMove,
      canRemove,
      center,
      displayType,
      left,
      right,
      setLine,
    ],
  );

  // Update for replacements
  const processReplacement = useCallback(
    (input?: T | null): T | null | undefined => {
      if (input === undefined || input === null) return input;
      // Process external replacements
      let ret = cloneDeep(input);
      externalSingles?.forEach((repl) => {
        if (repl.oldText !== undefined && repl.oldText !== "" && repl.newText !== undefined)
          ret = replaceTextInT(ret, repl.oldText, repl.newText);
      });
      return ret;
    },
    [externalSingles, replaceTextInT],
  );

  // Set up post replacement view
  const displayLeft = useMemo(() => processReplacement(left), [left, processReplacement]);
  const displayCenter = useMemo(() => processReplacement(center), [center, processReplacement]);
  const displayRight = useMemo(() => processReplacement(right), [right, processReplacement]);

  return (
    <div
      id={id}
      className={[
        styles.aibLine,
        canEdit === false || typeof setLine !== "function" ? styles.aibReadOnly : "",
      ]
        .filter((c) => c !== "")
        .join(" ")}
    >
      {showOptions && (
        <AibOptionsWindow
          id={`${id}-options-window`}
          displayType={displayType}
          onClose={() => setShowOptions(false)}
          left={left}
          center={center}
          right={right}
          returnData={typeof setLine === "function" ? returnData : undefined}
          canChangeType={canChangeType}
          styleMap={styleMap}
          canEdit={canEdit}
          Editor={Editor}
        />
      )}

      <div className={styles.aibLineButtons} />
      <div
        className={styles.aibLineItemHolder}
        style={{ ...style }}
      >
        {[AibLineType.leftOnly, AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(
          displayType,
        ) && (
          <div
            className={[styles.aibLineItem, displayLeft !== left ? styles.aibReadOnly : ""]
              .filter((c) => c !== "")
              .join(" ")}
            style={{
              width:
                displayType === AibLineType.leftOnly
                  ? "100%"
                  : displayType === AibLineType.leftAndRight
                    ? "50%"
                    : "33%",
            }}
          >
            <Editor
              id={`${id}-left-text`}
              value={displayLeft ?? ("" as T)}
              editable={canEdit}
              setValue={
                typeof setLine === "function" && displayLeft === left
                  ? (ret) => returnData({ left: ret })
                  : undefined
              }
              style={{
                border: "1px dashed grey",
              }}
              showStyleButtons={true}
              styleMap={styleMap}
            />
          </div>
        )}
        {[AibLineType.centerOnly, AibLineType.leftCenterAndRight].includes(displayType) && (
          <div
            className={[styles.aibLineItem, displayCenter !== center ? styles.aibReadOnly : ""]
              .filter((c) => c !== "")
              .join(" ")}
            style={{ flexGrow: 1 }}
          >
            <Editor
              id={`${id}-center-text`}
              value={displayCenter ?? ("" as T)}
              editable={canEdit}
              setValue={
                typeof setLine === "function" && displayCenter === center
                  ? (ret) => returnData({ center: ret })
                  : undefined
              }
              style={{
                border: "1px dashed grey",
              }}
              textAlignment={"center"}
              showStyleButtons={true}
              styleMap={styleMap}
            />
          </div>
        )}
        {[AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(displayType) && (
          <div
            className={[styles.aibLineItem, displayRight !== right ? styles.aibReadOnly : ""]
              .filter((c) => c !== "")
              .join(" ")}
            style={{
              width: displayType === AibLineType.leftAndRight ? "50%" : "33%",
            }}
          >
            <Editor
              id={`${id}-right-text`}
              value={displayRight ?? ("" as T)}
              editable={canEdit}
              setValue={
                typeof setLine === "function" && displayRight === right
                  ? (ret) => returnData({ right: ret })
                  : undefined
              }
              style={{
                border: "1px dashed grey",
              }}
              textAlignment={"right"}
              showStyleButtons={styleMap !== undefined}
              styleMap={styleMap}
            />
          </div>
        )}
      </div>

      <div className={styles.aibLineButtons}>
        <AioIconButton
          id={`${id}-show-options`}
          onClick={() => setShowOptions(!showOptions)}
          iconName={"aio-button-row-options"}
          tipText="Options"
        />
        {typeof addLine === "function" ? (
          <AioIconButton
            id={`${id}-add-line`}
            onClick={addLine}
            iconName={"aiox-plus"}
            tipText="Add line"
          />
        ) : (
          <div style={{ width: "18px" }} />
        )}
        {typeof removeLine === "function" && (
          <AioIconButton
            id={`${id}-remove-line`}
            onClick={removeLine}
            iconName={"aiox-minus"}
            tipText="Remove line"
          />
        )}
      </div>
    </div>
  );
};

AibLineDisplay.displayName = "AibLineDisplay";