import React, { Dispatch, SetStateAction } from "react";
import { AieStyleMap } from "../aie";
import { EditorProps } from "../aie/editorProps";
import { AioExternalSingle } from "../aio";
import { AibLineDisplay } from "./AibLineDisplay";
import { BlockContextProvider } from "./BlockContentProvider";
import styles from "./aib.module.css";
import { AibBlockLine, AibLineType } from "./interface";

interface AsupInternalBlockProps<T> {
  id: string;
  lines: AibBlockLine<T>[];
  setLines?: Dispatch<SetStateAction<AibBlockLine<T>[]>>;
  disabled?: boolean;
  minLines?: number;
  maxLines?: number;
  externalSingles?: AioExternalSingle<T>[];
  styleMap?: AieStyleMap;
  defaultType?: AibLineType;
  canChangeType?: boolean;
  lineStyle?: React.CSSProperties;
  editorProps: EditorProps<T>;
}
export const AsupInternalBlock = ({
  id,
  lines,
  setLines,
  disabled = false,
  minLines = 1,
  maxLines = 10,
  externalSingles = [],
  styleMap = {},
  defaultType = AibLineType.centerOnly,
  canChangeType = false,
  lineStyle,
  editorProps,
}: AsupInternalBlockProps<unknown>): JSX.Element => {
  return (
    <BlockContextProvider
      initialState={{
        id,
        lines,
        minLines,
        maxLines,
        externalSingles,
        lineStyle,
        styleMap,
        defaultType,
        canChangeType,
        editorProps,
        disabled,
        returnData: setLines ?? (() => {}),
      }}
    >
      <div
        id={id}
        className={styles.aibBlock}
      >
        {lines.map((l: AibBlockLine<unknown>, li: number) => {
          return (
            <AibLineDisplay
              key={`${li}-${l.aifid}`}
              aifid={l.aifid}
            />
          );
        })}
      </div>
    </BlockContextProvider>
  );
};

AsupInternalBlock.displayName = "AsupInternalBlock";
