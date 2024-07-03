import { useBlockContext } from "./BlockContentProvider";
import { UPDATE_CELL } from "./blockReducer";

interface OriginalTextEditorProps {
  aifid: string;
  position: "left" | "center" | "right";
}

export const OriginalTextEditor = ({ aifid, position }: OriginalTextEditorProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state.lines.findIndex((l) => l.aifid === aifid);
  const thisCell = ix !== -1 ? state.lines[ix][position] : undefined;
  const Editor = state.editorProps.Editor;

  const id = `${state.id}-${ix}-${position}-original-text`;
  const label = position.slice(0, 1).toUpperCase() + position.slice(1) + " text";

  return (
    <div className="aiw-body-row">
      <label
        className={"aio-label"}
        htmlFor={id}
      >
        {label}
      </label>
      <div className={"aio-input-holder"}>
        <Editor
          id={id}
          value={thisCell ?? state.editorProps.blankT}
          editable={!state.disabled && state.returnData !== undefined}
          setValue={(ret) =>
            dispatch({
              type: UPDATE_CELL,
              aifid,
              position,
              cellContent: ret,
            })
          }
          style={{
            border: "1px dashed grey",
          }}
          showStyleButtons={true}
          styleMap={state.styleMap}
        />
      </div>
    </div>
  );
};

OriginalTextEditor.DisplayName = "OriginalTextEditor";
