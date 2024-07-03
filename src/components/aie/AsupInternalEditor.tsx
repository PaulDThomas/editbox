import {
  convertToRaw,
  DraftHandleValue,
  DraftStyleMap,
  Editor,
  EditorState,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./aie.css";
import { AieStyleButtonRow } from "./AieStyleButtonRow";
import { EditorV2 } from "./EditorV2";
import { AieStyleExcludeMap, AieStyleMap } from "./functions/aieInterface";
import { loadFromHTML } from "./functions/loadFromHTML";
import { saveToHTML } from "./functions/saveToHTML";
import { styleMapToDraft } from "./functions/styleMapToDraft";
import { styleMapToExclude } from "./functions/styleMapToExclude";

/** Interface for the AsupInternalEditor component */
export interface AsupInternalEditorProps<T> {
  id: string;
  value?: T;
  setValue?: (ret: T) => void;
  style?: React.CSSProperties;
  styleMap?: AieStyleMap;
  textAlignment?: Draft.DraftComponent.Base.DraftTextAlignment | "decimal" | "default";
  decimalAlignPercent?: number;
  showStyleButtons?: boolean;
  editable?: boolean;
  className?: string;
  resize?: boolean;
  [key: string]: unknown;
}

export const AsupInternalEditor = <T,>({
  id,
  value,
  setValue,
  style,
  styleMap,
  textAlignment,
  showStyleButtons,
  editable,
  decimalAlignPercent,
}: AsupInternalEditorProps<T>) => {
  /** Current editor state */
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editorV2Text, setEditorV2Text] = useState("");
  useEffect(() => {
    if (typeof value === "string") setEditorV2Text(value);
  }, [value]);
  /** Current button state */
  const [buttonState, setButtonState] = useState("hidden");

  // Add default style map
  const currentStyleMap = useRef<DraftStyleMap>(styleMapToDraft(styleMap));
  const styleMapExclude = useRef<AieStyleExcludeMap>(styleMapToExclude(styleMap));

  // Show or hide style buttons
  const onFocus = useCallback(() => {
    if (showStyleButtons) {
      setButtonState("");
    }
  }, [showStyleButtons]);

  // Only send data base onBlur of editor
  const onBlur = useCallback(() => {
    setButtonState("hidden");
    if (typeof setValue === "function" && typeof value === "string") {
      if (textAlignment !== "decimal") {
        setValue(
          saveToHTML(convertToRaw(editorState.getCurrentContent()), currentStyleMap.current) as T,
        );
      } else {
        setValue(editorV2Text as T);
      }
    }
  }, [editorState, editorV2Text, setValue, textAlignment, value]);

  // Initial Text loading/update
  useEffect(() => {
    // Update the content
    setEditorState(
      EditorState.createWithContent(
        loadFromHTML(typeof value === "string" ? value : JSON.stringify(value), editable),
      ),
    );
  }, [editable, value]);

  /**
   * Apply style to current selection on button press
   * @param style Name of the style to apply
   */
  const aieApplyStyle = (style: string) => {
    // Get current selection
    const selection = editorState.getSelection();
    // Get current content
    let nextContentState = editorState.getCurrentContent();
    const currentStyles = editorState.getCurrentInlineStyle();
    // Remove all excluded styles from selection
    for (const s of styleMapExclude.current[style]) {
      nextContentState = Modifier.removeInlineStyle(nextContentState, selection, s);
    }
    // Add or remove target style
    if (currentStyles.has(style)) {
      nextContentState = Modifier.removeInlineStyle(nextContentState, selection, style);
    } else {
      nextContentState = Modifier.applyInlineStyle(nextContentState, selection, style);
    }
    let nextEditorState = EditorState.createWithContent(nextContentState);
    // Put selection back
    nextEditorState = EditorState.acceptSelection(nextEditorState, selection);
    // Update editor
    setEditorState(nextEditorState);
  };

  const handlePastedText = useCallback(
    (text: string): DraftHandleValue => {
      const sel = editorState.getSelection();
      let newContent: Draft.DraftModel.ImmutableData.ContentState;
      if (sel.getAnchorOffset() === sel.getFocusOffset() && sel.getAnchorKey === sel.getFocusKey) {
        newContent = Modifier.insertText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          text.trim(),
        );
      } else {
        newContent = Modifier.replaceText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          text.trim(),
        );
      }
      setEditorState(EditorState.push(editorState, newContent, "insert-characters"));
      return "handled";
    },
    [editorState],
  );

  // Render the component
  return (
    <div
      className="aie-outer"
      style={{
        ...style,
      }}
    >
      <div
        id={`${id}-holder`}
        className="aie-holder"
        onBlur={onBlur}
        onFocus={onFocus}
      >
        {textAlignment === "decimal" ? (
          <EditorV2
            id={`${id}-v2editor`}
            text={editorV2Text}
            setText={
              editable !== false || typeof setValue !== "function" ? setEditorV2Text : undefined
            }
            customStyleMap={styleMap}
            textAlignment={textAlignment}
            decimalAlignPercent={decimalAlignPercent}
          />
        ) : (
          <Editor
            customStyleMap={currentStyleMap.current}
            editorState={editorState}
            onChange={setEditorState}
            textAlignment={textAlignment !== "default" ? textAlignment : undefined}
            readOnly={editable === false || typeof setValue !== "function"}
            handlePastedText={handlePastedText}
          />
        )}
      </div>

      {textAlignment !== "decimal" &&
        !(editable === false || typeof setValue !== "function") &&
        buttonState !== "hidden" && (
          <div
            className={`aie-button-position ${
              textAlignment !== undefined ? textAlignment : "left"
            }`}
          >
            <div className="aie-button-holder">
              <AieStyleButtonRow
                id={`${id}-stylebuttons`}
                styleList={Object.keys(currentStyleMap.current)}
                currentStyle={editorState.getCurrentInlineStyle()}
                applyStyleFunction={aieApplyStyle}
                disabled={editorState.getSelection().isCollapsed()}
              />
            </div>
          </div>
        )}
    </div>
  );
};
