import { AioIconButton } from "../aio/aioIconButton";
import { useBlockContext } from "./BlockContentProvider";
import { REMOVE_LINE } from "./blockReducer";

interface RemoveLineButtonProps {
  aifid: string;
}

export const RemoveLineButton = ({ aifid }: RemoveLineButtonProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state.lines.findIndex((l) => l.aifid === aifid);

  return (
    <AioIconButton
      id={`${state.id}-${ix}-remove-line`}
      onClick={() => !state.disabled && state.returnData && dispatch({ type: REMOVE_LINE, aifid })}
      iconName={"aiox-minus"}
      tipText="Remove line"
    />
  );
};

RemoveLineButton.DisplayName = "RemoveLineButton";
