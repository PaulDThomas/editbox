import { ContextMenuHandler } from "@asup/context-menu";
import { useState } from "react";
import { AddLineButton } from "./AddLineButton";
import styles from "./aib.module.css";
import { AibOptionsWindow } from "./AibOptionsWindow";
import { useBlockContext } from "./BlockContentProvider";
import { CellEditor } from "./CellEditor";
import { AibLineType } from "./interface";
import { RemoveLineButton } from "./RemoveLineButton";

export interface AibLineDisplayProps {
  aifid: string;
}

export const AibLineDisplay = <T extends string | object>({
  aifid,
}: AibLineDisplayProps): JSX.Element => {
  const { state } = useBlockContext<T>();
  const ix = state?.lines.findIndex((l) => l.aifid === aifid) ?? -1;
  const thisLine = ix !== -1 ? state?.lines[ix] : undefined;
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const disabled = state?.disabled || !state?.returnData || !thisLine?.canEdit;
  const displayType = thisLine?.lineType ?? state?.defaultType ?? AibLineType.leftOnly;

  const divClassName = [
    styles.aibLineItem,
    disabled ? styles.aibReadOnly : undefined,
    [AibLineType.leftOnly, AibLineType.centerOnly].includes(displayType)
      ? styles.one
      : [AibLineType.leftAndRight].includes(displayType)
        ? styles.two
        : styles.three,
  ].join(" ");

  return !state ? (
    <></>
  ) : (
    <div
      id={`${state.id}-${ix}`}
      className={[styles.aibLine, disabled ? styles.aibReadOnly : ""].join(" ")}
    >
      <div className={styles.aibLineButtons} />
      <AibOptionsWindow
        aifid={aifid}
        showWindow={showOptions}
        onClose={() => setShowOptions(false)}
      />
      <ContextMenuHandler
        style={{ width: "Calc(100% - 2px)", height: "Calc(100% - 2px)" }}
        menuItems={[{ label: "Show line options", action: () => setShowOptions(true) }]}
      >
        <div
          className={styles.aibLineItemHolder}
          style={{ ...state.lineStyle }}
        >
          {[
            AibLineType.leftOnly,
            AibLineType.leftAndRight,
            AibLineType.leftCenterAndRight,
          ].includes(displayType) && (
            <div className={divClassName}>
              <CellEditor
                aifid={aifid}
                position="left"
              />
            </div>
          )}
          {[AibLineType.centerOnly, AibLineType.leftCenterAndRight].includes(displayType) && (
            <div
              className={divClassName}
              style={{ flexGrow: 1 }}
            >
              <CellEditor
                aifid={aifid}
                position="center"
              />
            </div>
          )}
          {[AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(displayType) && (
            <div className={divClassName}>
              <CellEditor
                aifid={aifid}
                position="right"
              />
            </div>
          )}
        </div>
      </ContextMenuHandler>

      <div className={styles.aibLineButtons}>
        {!disabled && (
          <>
            <AddLineButton aifid={aifid} />
            <RemoveLineButton aifid={aifid} />
          </>
        )}
      </div>
    </div>
  );
};

AibLineDisplay.displayName = "AibLineDisplay";
