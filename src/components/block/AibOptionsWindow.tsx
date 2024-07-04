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
          value={thisLine?.lineType ?? state.defaultType}
          setValue={
            !state.disabled && state.returnData && state.canChangeType
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
      <OriginalTextEditor
        aifid={aifid}
        position="left"
      />
      <OriginalTextEditor
        aifid={aifid}
        position="center"
      />
      <OriginalTextEditor
        aifid={aifid}
        position="right"
      />
    </ContextWindow>
  );
};

AibOptionsWindow.DisplayName = "AibOptionsWindow";
