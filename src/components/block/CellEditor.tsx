import { cloneDeep, isEqual } from "lodash";
import { useMemo } from "react";
import { useBlockContext } from "./BlockContentProvider";
import { UPDATE_CELL } from "./blockReducer";

interface CellEditorProps {
  aifid: string;
  position: "left" | "center" | "right";
}

export const CellEditor = <T,>({ aifid, position }: CellEditorProps): JSX.Element => {
  const { state, dispatch } = useBlockContext<T>();
  const ix = state.lines.findIndex((l) => l.aifid === aifid);
  const thisCell = ix !== -1 ? state.lines[ix][position] : undefined;
  const Editor = state.editorProps.Editor;

  // Update for replacements
  const displayValue = useMemo(() => {
    if (thisCell === undefined || thisCell === null) return null;
    let ret: T = cloneDeep(thisCell);
    state.externalSingles?.forEach((repl) => {
      ret = state.editorProps.replaceTextInT(ret, repl.oldText, repl.newText);
    });
    return ret;
  }, [state.editorProps, state.externalSingles, thisCell]);

  return (
    <Editor
      id={`${state.id}-${ix}-${position}-text`}
      value={thisCell ?? state.editorProps.blankT}
      editable={
        !state.disabled && state.returnData !== undefined && isEqual(thisCell, displayValue)
      }
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
  );
};

CellEditor.DisplayName = "CellEditor";
