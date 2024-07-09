import { ContextWindow } from "@asup/context-menu";
import { AioSelect } from "../aio/aioSelect";
import { OriginalTextEditor } from "./OriginalTextEditor";
import { useBlockContext } from "./BlockContentProvider";
import { AibLineType } from "./interface";
import { UPDATE_LINE } from "./blockReducer";

interface AibOptionsWindowProps {
  aifid: string;
  onClose: () => void;
  showWindow: boolean;
}

export const AibOptionsWindow = ({
  aifid,
  onClose,
  showWindow,
}: AibOptionsWindowProps): JSX.Element => {
  const { state, dispatch } = useBlockContext();
  const ix = state?.lines.findIndex((l) => l.aifid === aifid) ?? -1;
  const thisLine = ix !== -1 ? state?.lines[ix] : undefined;

  return !state || !thisLine ? (
    <></>
  ) : (
    <ContextWindow
      id={`${state.id}-${ix}-options-window`}
      title="Line options"
      visible={showWindow}
      onClose={onClose}
    >
      <div className="aiw-body-row">
        <AioSelect
          id={`${state.id}-${ix}-linetype`}
          label="Line type"
          availableValues={["Left only", "Center only", "Left, Center and Right", "Left and Right"]}
          value={thisLine.lineType}
          setValue={
            !state.disabled && state.returnData && thisLine.canChangeType
              ? (ret) =>
                  dispatch({
                    type: UPDATE_LINE,
                    aifid,
                    line: { ...thisLine, lineType: ret as AibLineType },
                  })
              : undefined
          }
        />
      </div>
      {thisLine.lineType.toString().includes("Left") && (
        <OriginalTextEditor
          aifid={aifid}
          position="left"
        />
      )}
      {thisLine.lineType.toString().includes("Center") && (
        <OriginalTextEditor
          aifid={aifid}
          position="center"
        />
      )}{" "}
      {thisLine.lineType.toString().includes("Right") && (
        <OriginalTextEditor
          aifid={aifid}
          position="right"
        />
      )}
    </ContextWindow>
  );
};

AibOptionsWindow.DisplayName = "AibOptionsWindow";
