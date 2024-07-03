import { useMemo, useState } from "react";
import { AioIconButton } from "../aio";
import styles from "./aib.module.css";
import { AibOptionsWindow } from "./AibOptionsWindow";
import { useBlockContext } from "./BlockContentProvider";
import { CellEditor } from "./CellEditor";
import { AibLineType } from "./interface";
import { RemoveLineButton } from "./RemoveLineButton";
import { AddLineButton } from "./AddLineButton";

export interface AibLineDisplayProps {
  aifid: string;
}

export const AibLineDisplay = <T extends string | object>({
  aifid,
}: AibLineDisplayProps): JSX.Element => {
  const { state } = useBlockContext<T>();
  const ix = state.lines.findIndex((l) => l.aifid === aifid);
  const thisLine = ix !== ix ? state.lines[ix] : undefined;
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const disabled = useMemo(
    () => state.disabled || !state.returnData,
    [state.disabled, state.returnData],
  );
  const displayType = useMemo(
    () => thisLine?.lineType ?? state.defaultType,
    [thisLine?.lineType, state.defaultType],
  );
  const divClassName = useMemo(
    () =>
      [
        styles.aibLineItem,
        disabled ? styles.aibReadOnly : undefined,
        [AibLineType.leftOnly, AibLineType.centerOnly].includes(displayType)
          ? styles.one
          : [AibLineType.leftAndRight].includes(displayType)
            ? styles.two
            : styles.three,
      ].join(" "),
    [disabled, displayType],
  );

  return (
    <div
      id={`${state.id}-${ix}`}
      className={[styles.aibLine, disabled ? styles.aibReadOnly : ""].join(" ")}
    >
      <AibOptionsWindow
        aifid={aifid}
        showWindow={showOptions}
        onClose={() => setShowOptions(false)}
      />

      <div className={styles.aibLineButtons} />

      <div
        className={styles.aibLineItemHolder}
        style={{ ...state.lineStyle }}
      >
        {[AibLineType.leftOnly, AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(
          displayType,
        ) && (
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

      <div className={styles.aibLineButtons}>
        <AioIconButton
          id={`${state.id}-${ix}-show-options`}
          onClick={() => setShowOptions(!showOptions)}
          iconName={"aio-button-row-options"}
          tipText="Options"
        />
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
