import { AioIconButton } from "../aio/aioIconButton";
import { useBlockContext } from "./BlockContentProvider";
import { ADD_LINE } from "./blockReducer";
import { newBlockLine } from "./newBlockLine";

interface AddLineButtonProps {
  aifid: string;
}

export const AddLineButton = ({ aifid }: AddLineButtonProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state?.lines.findIndex((l) => l.aifid === aifid);

  return !state ? (
    <></>
  ) : state.disabled || state.lines.length >= state.maxLines ? (
    <AioIconButton
      id={`${state.id}-${ix}-add-line`}
      iconName={"aiox-circle"}
      tipText="Add line"
    />
  ) : (
    <AioIconButton
      id={`${state.id}-${ix}-add-line`}
      onClick={() => {
        const line = newBlockLine(state.defaultType, state.editorProps.blankT);
        line.canChangeType = state.canChangeType;
        dispatch({ type: ADD_LINE, aifid, line });
      }}
      iconName={"aiox-plus"}
      tipText="Add line"
    />
  );
};

AddLineButton.DisplayName = "AddLineButton";
