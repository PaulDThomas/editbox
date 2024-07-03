import { AioIconButton } from "../aio/aioIconButton";
import { useBlockContext } from "./BlockContentProvider";
import { ADD_LINE } from "./blockReducer";

interface AddLineButtonProps {
  aifid: string;
}

export const AddLineButton = ({ aifid }: AddLineButtonProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state.lines.findIndex((l) => l.aifid === aifid);

  return (
    <AioIconButton
      id={`${state.id}-${ix}-add-line`}
      onClick={() => !state.disabled && state.returnData && dispatch({ type: ADD_LINE, aifid })}
      iconName={"aiox-plus"}
      tipText="Add line"
    />
  );
};

AddLineButton.DisplayName = "AddLineButton";
