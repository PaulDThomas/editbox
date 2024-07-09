import { AioIconButton } from "../aio/aioIconButton";
import { useBlockContext } from "./BlockContentProvider";
import { REMOVE_LINE } from "./blockReducer";

interface RemoveLineButtonProps {
  aifid: string;
}

export const RemoveLineButton = ({ aifid }: RemoveLineButtonProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state?.lines.findIndex((l) => l.aifid === aifid);

  return !state || state.disabled ? (
    <></>
  ) : state.lines.length <= state.minLines ? (
    <AioIconButton
      id={`${state.id}-${ix}-add-line`}
      iconName={"aiox-circle-red"}
      tipText="Remove line"
      style={{ color: "red" }}
    />
  ) : (
    <AioIconButton
      id={`${state.id}-${ix}-remove-line`}
      onClick={() => !state.disabled && state.returnData && dispatch({ type: REMOVE_LINE, aifid })}
      iconName={"aiox-minus"}
      tipText="Remove line"
      style={{ color: "red" }}
    />
  );
};

RemoveLineButton.DisplayName = "RemoveLineButton";
