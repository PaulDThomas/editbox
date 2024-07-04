import React, { Dispatch, SetStateAction } from "react";
import { AioExternalSingle } from "../aio";
import { AieStyleMap, EditorProps } from "../interface";
import { AibBlock } from "./AibBlock";
import { BlockContextProvider } from "./BlockContentProvider";
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
        returnData: (ret) => {
          setLines && setLines(ret);
        },
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
      <AibBlock />
    </BlockContextProvider>
  );
};

AsupInternalBlock.displayName = "AsupInternalBlock";
