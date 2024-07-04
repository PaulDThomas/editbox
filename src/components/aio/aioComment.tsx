import * as React from "react";
import { AsupInternalEditor } from "../aie";
import { AioLabel } from "./aioLabel";
import { TableSettingsContext } from "../table/TableSettingsContext";
import { AieStyleMap } from "../interface";

interface AioCommentProps<T extends string | object> {
  id: string;
  label?: string;
  value?: T;
  setValue?: (value: T) => void;
  commentStyles?: AieStyleMap;
}

export const AioComment = <T extends string | object>({
  id,
  label,
  value,
  setValue,
  commentStyles,
}: AioCommentProps<T>): JSX.Element => {
  // Context
  const tableSettings = React.useContext(TableSettingsContext);
  const Editor = tableSettings.Editor ?? AsupInternalEditor;
  return (
    <>
      <AioLabel
        id={`${id}-label`}
        label={label}
      />
      <div className={"aio-comment-holder"}>
        <Editor
          id={`${id}-editor`}
          showStyleButtons={typeof commentStyles === "object"}
          value={value}
          editable={typeof setValue === "function"}
          setValue={typeof setValue === "function" ? (ret) => setValue(ret as T) : undefined}
          styleMap={commentStyles}
        />
      </div>
    </>
  );
};

AioComment.displayName = "AioComment";
