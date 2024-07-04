import { useCallback, useEffect, useState } from "react";
import { fromHtml, newExternalSingle, toHtml } from "../functions";
import { AioIconButton } from "./aioIconButton";
import { AioExternalSingle } from "./interface";
import { AioLabel } from "./aioLabel";
import { AioString } from "./aioString";
import { AieStyleMap, AsupInternalEditorProps } from "../interface";

/**
 * Properties for AioReplacements
 * @param value AioReplacement list
 * @param setValue update function
 */
interface AioSingleReplacementProps<T extends string | object> {
  id: string;
  label?: string;
  replacements?: AioExternalSingle<T>[];
  setReplacements?: (ret: AioExternalSingle<T>[]) => void;
  Editor?: (props: AsupInternalEditorProps<T>) => JSX.Element;
  blankT?: T;
  styleMap?: AieStyleMap;
}

/**
 * Option item for replacements
 * @param props replacement object
 * @returns JSX
 */
export const AioSingleReplacements = <T extends string | object>({
  id,
  label,
  replacements,
  setReplacements,
  blankT = "" as T,
  styleMap,
  Editor = (props: AsupInternalEditorProps<T>) => {
    const [value, setValue] = useState<string>();
    useEffect(() => {
      if (typeof props.value === "string") setValue(props.value);
    }, [props.value]);
    if (typeof props.value !== "string")
      throw new Error("If newText is not a string, a custom function is required");
    return (
      <>
        {typeof props.setValue !== "function" ? (
          <span id={props.id}>{props.value}</span>
        ) : (
          <input
            id={props.id}
            className={"aio-input"}
            value={value ?? ""}
            type="text"
            onChange={(e) => {
              setValue(e.currentTarget.value);
            }}
            onBlur={() => {
              if (props.setValue !== undefined) {
                props.setValue(props.value as T);
              }
            }}
          />
        )}
      </>
    );
  },
}: AioSingleReplacementProps<T>): JSX.Element => {
  /* Send everything back */
  const returnData = useCallback(
    (ret: AioExternalSingle<T>, i: number) => {
      if (typeof setReplacements !== "function") return;
      const newReplacements = [...(replacements ?? [])];
      newReplacements[i] = ret;
      setReplacements(newReplacements);
    },
    [replacements, setReplacements],
  );

  /** Update individual replacement */
  const updateReplacement = useCallback(
    (ret: { oldText?: string; newText?: T }, i: number) => {
      if (
        typeof setReplacements !== "function" ||
        replacements === undefined ||
        replacements.length < i - 1
      )
        return;
      const newReplacement: AioExternalSingle<T> = {
        airid: replacements[i].airid,
        oldText: ret.oldText ?? replacements[i].oldText,
        newText: ret.newText ?? replacements[i].newText,
      };
      returnData(newReplacement, i);
    },
    [replacements, returnData, setReplacements],
  );

  const addReplacement = useCallback(
    (i: number) => {
      if (typeof setReplacements !== "function") return;
      const newReplacements = [...(replacements ?? [])];
      newReplacements.splice(i, 0, newExternalSingle(blankT));
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
        {typeof setReplacements === "function" && (
          <AioIconButton
            id={`${id}-add`}
            iconName={"aiox-addDown"}
            onClick={() => addReplacement(0)}
            tipText={"Add text"}
          />
        )}
        {(replacements ?? []).map((repl, i) => {
          return (
            <div key={`${i}-${repl.airid}`}>
              <AioString
                id={`${id}-from`}
                label="From"
                value={fromHtml(repl.oldText ?? "")}
                setValue={(ret) => updateReplacement({ oldText: toHtml(ret) as string }, i)}
              />
              <AioLabel
                id={`${id}-to-label`}
                label="to"
              />
              <div
                className={"aio-input-holder"}
                style={{
                  minWidth: "150px",
                  backgroundColor: "white",
                  maxHeight: "19px",
                  border: "1px solid black",
                  borderRadius: "4px",
                  padding: "2px 4px",
                }}
              >
                <Editor
                  id={`${id}-to`}
                  editable={typeof setReplacements === "function"}
                  value={fromHtml(repl.newText ?? blankT)}
                  setValue={(ret) => updateReplacement({ newText: toHtml(ret) as T }, i)}
                  styleMap={styleMap}
                />
              </div>

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
                      tipText={"Remove text"}
                    />
                  )}
                  <AioIconButton
                    id={`${id}-add`}
                    iconName={"aiox-addDown"}
                    onClick={() => addReplacement(i + 1)}
                    tipText={"Add text"}
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

AioSingleReplacements.displayName = "AioSingleReplacements";
