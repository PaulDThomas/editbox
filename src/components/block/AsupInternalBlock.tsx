import React, { Dispatch, SetStateAction } from "react";
import { AieStyleMap } from "../aie";
import { AioExternalSingle } from "../aio";
import { EditorProps } from "../interface";
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
export const AsupInternalBlock = <T,>({
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
}: AsupInternalBlockProps<T>): JSX.Element => {
  return (
    <BlockContextProvider<T>
      initialState={{
        id,
        lines,
        returnData: setLines ?? (() => {}),
        minLines,
        maxLines,
        externalSingles,
        lineStyle,
        styleMap,
        defaultType,
        canChangeType,
        editorProps,
        disabled,
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
