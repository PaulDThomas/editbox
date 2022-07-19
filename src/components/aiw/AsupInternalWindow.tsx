import { TableSettingsContext } from "components/ait/aitContext";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import "./aiw.css";

interface AsupInternalWindowProps {
  Title: string,
  Visible: boolean,
  onClose: () => void,
  style?: React.CSSProperties,
  children?: | React.ReactChild | React.ReactChild[],
}

export const AsupInternalWindow = (props: AsupInternalWindowProps): JSX.Element => {

  const tableSettings = useContext(TableSettingsContext);
  const [zIndex, setZIndex] = useState<number | null>(null);
  const [showWindow, setShowWindow] = useState(props.Visible);

  // Position
  const [x, setX] = useState<number>();
  const [y, setY] = useState<number>();

  const chkTop = useCallback((force: boolean) => {
    if (zIndex === null || (force && zIndex < tableSettings.windowZIndex)) {
      let nextIndex = tableSettings.windowZIndex + 1;
      setZIndex(nextIndex);
      if (typeof tableSettings.setWindowZIndex === "function") tableSettings.setWindowZIndex(nextIndex);
    }
  }, [tableSettings, zIndex]);
  useEffect(() => chkTop(false), [chkTop]);

  // Update visibility
  useEffect(() => { setShowWindow(props.Visible); }, [props.Visible]);

  return (
    <>
      <Rnd
        style={{
          visibility: (showWindow ? "visible" : "hidden"),
          display: "flex",
          zIndex: zIndex ?? 1,
          ...props.style,
          position: "fixed",
        }}
        position={x !== undefined && y !== undefined ? { x, y } : undefined}
        onDragStop={(e, d) => {
          if (e instanceof MouseEvent) {
            setX(e.pageX >= 0 ? d.x : d.x - e.pageX);
            setY(e.pageY >= 0 ? d.y : d.y - e.pageY);
          }
        }}
        minHeight={(props.style && props.style.minHeight) ?? "150px"}
        minWidth={(props.style && props.style.minWidth) ?? "400px"}
        maxHeight={(props.style && props.style?.maxHeight) ?? "1000px"}
        maxWidth={(props.style && props.style?.maxWidth) ?? "1000px"}
        className={"aiw-holder"}
        dragHandleClassName="aiw-title"
      >
        <div className="aiw-inner" onClick={() => chkTop(true)}>
          <div className={"aiw-title"}>
            <div className={"aiw-title-text"}>{props.Title}</div>
            <div className={"aiw-title-close"} onClick={(e) => {
              setShowWindow(false);
              if (typeof (props.onClose) === "function") { props.onClose(); }
            }}>x</div>
          </div>
          <div className={"aiw-body"}>
            {props.children}
          </div>
        </div>
      </Rnd>
    </>
  );
}
