import { useBlockContext } from "./BlockContentProvider";
import { UPDATE_CELL } from "./blockReducer";

interface OriginalTextEditorProps {
  aifid: string;
  position: "left" | "center" | "right";
}

export const OriginalTextEditor = ({ aifid, position }: OriginalTextEditorProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state?.lines.findIndex((l) => l.aifid === aifid) ?? -1;
  const thisLine = ix !== -1 ? state?.lines[ix] : undefined;
  const thisCell = thisLine?.[position];
  const Editor = state?.editorProps.Editor;

  const id = `${state?.id}-${ix}-${position}-original-text`;
  const label = position.slice(0, 1).toUpperCase() + position.slice(1) + " text";

  return !state || !Editor ? (
    <></>
  ) : (
    <div className="aiw-body-row">
      <label
        className={"aio-label"}
        htmlFor={id}
      >
        {label}
      </label>
      <div
        className={"aio-input-holder"}
        style={{ border: "1px black solid", borderRadius: "4px", padding: "2px" }}
      >
        <Editor
          id={id}
          value={thisCell ?? state.editorProps.blankT}
          editable={!state.disabled && state.returnData !== undefined && thisLine?.canEdit}
          allowWindowView={false}
          allowMarkdown={false}
          setValue={(ret) =>
            dispatch({
              type: UPDATE_CELL,
              aifid,
              position,
              cellContent: ret,
            })
          }
          showStyleButtons={true}
          styleMap={state.styleMap}
        />
      </div>
    </div>
  );
};

OriginalTextEditor.DisplayName = "OriginalTextEditor";
