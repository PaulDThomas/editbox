import React, { useState, useEffect, useMemo, useCallback } from "react";
import structuredClone from '@ungap/structured-clone';
import { AsupInternalEditor } from 'components/aie/AsupInternalEditor';
import { AioExpander } from "components/aio/aioExpander";
import { AioOptionDisplay } from "components/aio/aioOptionDisplay";
import { AioOptionGroup } from "components/aio/aioInterface";
import { AsupInternalWindow } from "components/aiw/AsupInternalWindow";
// import { AioString } from "../aio/aioString";
import { objEqual } from "./processes";
import { AitCellData, AitLocation, AitCellType, AitOptionLocation, AitOptionList, AitCellOptionNames } from "./aitInterface";
import { AioString } from "components/aio/aioString";


interface AitCellProps {
  aitid: string,
  text: string,
  replacedText?: string,
  rowSpan: number,
  colSpan: number,
  colWidth?: string,
  options: AioOptionGroup,
  columnIndex: number,
  setCellData: (ret: AitCellData) => void,
  readOnly: boolean,
  higherOptions: AitOptionList,
  rowGroupOptions?: AioOptionGroup,
  setRowGroupOptions?: (ret: AioOptionGroup, location: AitLocation) => void,
  rowGroupWindowTitle?: string
  addRowGroup?: (rgi: number) => void,
  removeRowGroup?: (rgi: number) => void,
  rowOptions?: AioOptionGroup,
  setRowOptions?: (ret: AioOptionGroup, location: AitLocation) => void,
  addRow?: (ret: number) => void,
  removeRow?: (ret: number) => void,
  addColSpan?: (loc: AitLocation) => void,
  removeColSpan?: (loc: AitLocation) => void,
  addRowSpan?: (loc: AitLocation) => void,
  removeRowSpan?: (loc: AitLocation) => void,
};

/*
 * Table cell in AsupInternalTable
 */
export const AitCell = ({
  aitid,
  text,
  replacedText,
  rowSpan,
  colSpan,
  colWidth,
  options,
  columnIndex,
  setCellData,
  readOnly,
  higherOptions,
  rowGroupOptions,
  setRowGroupOptions,
  rowGroupWindowTitle,
  addRowGroup,
  removeRowGroup,
  rowOptions,
  setRowOptions,
  addRow,
  removeRow,
  addColSpan,
  removeColSpan,
  addRowSpan,
  removeRowSpan,
}: AitCellProps) => {

  // Data holder
  const [displayText, setDisplayText] = useState(replacedText ?? text);
  /* Need to update if these change */
  useEffect(() => setDisplayText(replacedText ?? text), [replacedText, text]);

  const [buttonState, setButtonState] = useState("hidden");
  const [lastSend, setLastSend] = useState<AitCellData>(structuredClone({
    aitid: aitid,
    text: text,
    replacedText: replacedText,
    rowSpan: rowSpan,
    colSpan: colSpan,
    colWidth: colWidth,
    options: options
  }));
  const [showRowGroupOptions, setShowRowGroupOptions] = useState(false);
  const [showRowOptions, setShowRowOptions] = useState(false);
  const [showCellOptions, setShowCellOptions] = useState(false);

  // Static options/variables
  const currentReadOnly = useMemo(() => {
    return readOnly
      || typeof (setCellData) !== "function"
      || (options?.find(o => o.optionName === AitCellOptionNames.readOnly)?.value ?? false)
      || displayText === replacedText
  }, [displayText, options, readOnly, replacedText, setCellData]);

  const cellType = useMemo(() => {
    let cellType =
      options?.find(o => o.optionName === AitCellOptionNames.cellType)?.value
      ??
      (higherOptions.tableSection === AitCellType.body && columnIndex < higherOptions.rowHeaderColumns
        ?
        AitCellType.rowHeader
        :
        higherOptions.tableSection);
    return cellType;
  }, [options, columnIndex, higherOptions.rowHeaderColumns, higherOptions.tableSection]);

  const location: AitLocation = useMemo(() => {
    return {
      tableSection: higherOptions.tableSection,
      rowGroup: higherOptions.rowGroup,
      row: higherOptions.row,
      column: columnIndex,
      repeat: (higherOptions.repeatNumber ?? []).join(",")
    }
  }, [columnIndex, higherOptions.repeatNumber, higherOptions.row, higherOptions.rowGroup, higherOptions.tableSection]);

  // Update cell style when options change
  const cellStyle = useMemo<React.CSSProperties>(() => {
    return {
      width: colWidth ?? (cellType === AitCellType.header ? "120px" : undefined),
      borderLeft: higherOptions.showCellBorders ? "1px dashed burlywood" : "",
      borderRight: higherOptions.showCellBorders ? "1px dashed burlywood" : "",
      borderBottom: higherOptions.showCellBorders ? "1px dashed burlywood" : "",
      borderTop: higherOptions.showCellBorders && location.row === 0 && location.rowGroup > 0
        ? "2px solid burlywood"
        : higherOptions.showCellBorders
          ? "1px dashed burlywood"
          : "",
    }
  }, [cellType, colWidth, higherOptions.showCellBorders, location.row, location.rowGroup]);

  /** Callback for update to any cell data */
  const returnData = useCallback((cellUpdate: {
    text?: string,
    options?: AioOptionGroup,
    colWidth?: string
  }) => {
    if (currentReadOnly) return;
    const r: AitCellData = {
      aitid: aitid,
      text: cellUpdate.text ?? text,
      replacedText: replacedText,
      rowSpan: rowSpan,
      colSpan: colSpan,
      colWidth: cellUpdate.colWidth ?? colWidth,
      options: cellUpdate.options ?? options,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let [chkObj, diffs] = objEqual(r, lastSend, `CELLCHECK:${Object.values(location).join(',')}-`);
    if (!chkObj) {
      console.log(`Diffs:${diffs}`);
      setCellData(r);
      setLastSend(structuredClone(r));
    }
  }, [aitid, colSpan, colWidth, currentReadOnly, lastSend, location, options, replacedText, rowSpan, setCellData, text]);

  // Show hide/buttons that trigger windows
  const aitShowButtons = () => { setButtonState(""); };
  const aitHideButtons = () => { setButtonState("hidden"); };

  // Show windows
  const onShowOptionClick = (optionType: AitOptionLocation) => {
    switch (optionType) {
      case (AitOptionLocation.rowGroup): setShowRowGroupOptions(true); break;
      case (AitOptionLocation.row): setShowRowOptions(true); break;
      case (AitOptionLocation.cell): setShowCellOptions(true); break;
      default: break;
    }
  }
  // Hide windows
  const onCloseOption = (optionType: AitOptionLocation) => {
    switch (optionType) {
      case (AitOptionLocation.rowGroup): setShowRowGroupOptions(false); break;
      case (AitOptionLocation.row): setShowRowOptions(false); break;
      case (AitOptionLocation.cell): setShowCellOptions(false); break;
      default: break;
    }
  }

  // Do not render if there is no rowSpan or colSpan
  if (colSpan === 0 || rowSpan === 0) return <></>;

  // Render element
  return (
    <td
      className={["ait-cell",
        (cellType === AitCellType.header ? "ait-header-cell" : cellType === AitCellType.rowHeader ? "ait-row-header-cell" : "ait-body-cell"),
        (currentReadOnly ? "ait-readonly-cell" : ""),
      ].join(" ")}
      colSpan={colSpan ?? 1}
      rowSpan={rowSpan ?? 1}
      style={cellStyle}
      data-location-table-section={higherOptions.tableSection}
      data-location-row-group={higherOptions.rowGroup}
      data-location-row={higherOptions.row}
      data-location-cell={higherOptions.column}
    >
      <div className="ait-aie-holder"
        onMouseOver={aitShowButtons}
        onMouseLeave={aitHideButtons}
      >

        {/* Option buttons  */}
        <>
          {readOnly === false &&
            <>
              {(rowGroupOptions)
                ?
                (<>
                  {typeof (addRowGroup) === "function" &&
                    <div className="ait-tip">
                      <div
                        className={`ait-options-button ait-options-button-add-row-group`}
                        onClick={(e) => { addRowGroup(location.rowGroup) }}
                      >
                        <span className="ait-tiptext ait-tip-top">Add&nbsp;row&nbsp;group</span>
                      </div>
                    </div>
                  }
                  {typeof (removeRowGroup) === "function" &&
                    <div className="ait-tip">
                      <div
                        className={`ait-options-button ait-options-button-remove-row-group`}
                        onClick={(e) => { removeRowGroup(location.rowGroup) }}
                      >
                        <span className="ait-tiptext ait-tip-top">Remove&nbsp;row&nbsp;group</span>
                      </div>
                    </div>
                  }
                  <div className="ait-tip">
                    <div
                      className={`ait-options-button ait-options-button-row-group`}
                      onClick={(e) => { onShowOptionClick(AitOptionLocation.rowGroup) }}
                    >
                      <span className="ait-tiptext ait-tip-top">Row&nbsp;group&nbsp;options</span>
                    </div>
                  </div>
                </>)
                :
                null
              }
              {(rowOptions)
                ?
                <>
                  <div className="ait-tip ait-tip-rhs">
                    <div
                      className={`ait-options-button ait-options-button-row`}
                      onClick={(e) => { onShowOptionClick(AitOptionLocation.row) }}
                    >
                      <span className="ait-tiptext ait-tip-top">Row&nbsp;options</span>
                    </div>
                  </div>
                  {typeof addRow === "function" &&
                    <div className="ait-tip ait-tip-rhs">
                      <div
                        className={`ait-options-button ait-options-button-add-row`}
                        onClick={(e) => { addRow(location.row) }}
                      >
                        <span className="ait-tiptext ait-tip-top">Add&nbsp;row</span>
                      </div>
                    </div>
                  }
                  {typeof removeRow === "function" &&
                    <div className="ait-tip ait-tip-rhs">
                      <div
                        className={`ait-options-button ait-options-button-remove-row`}
                        onClick={(e) => { removeRow(location.row) }}
                      >
                        <span className="ait-tiptext ait-tip-top">Remove&nbsp;row</span>
                      </div>
                    </div>
                  }
                </>
                :
                null
              }
            </>
          }
          <div className="ait-tip ait-tip-rhs">
            <div
              className={`ait-options-button ait-options-button-cell ${buttonState === "hidden" ? "hidden" : ""}`}
              onClick={(e) => { onShowOptionClick(AitOptionLocation.cell) }}
            >
              <span className="ait-tiptext ait-tip-top">Cell&nbsp;options</span>
            </div>
          </div>
        </>

        <AsupInternalEditor
          addStyle={{ width: "100%", height: "100%", border: "none" }}
          textAlignment={(cellType === AitCellType.rowHeader ? "left" : "center")}
          showStyleButtons={false}
          value={displayText}
          setValue={(ret) => { setDisplayText(ret); returnData({ text: ret }); }}
          editable={!currentReadOnly}
          highlightChanges={true}
        />
      </div>

      {/* Option windows */}
      <div>
        {readOnly === false &&
          <>
            {showRowGroupOptions &&
              <AsupInternalWindow key="RowGroup" Title={(rowGroupWindowTitle ?? "Row group options")} Visible={showRowGroupOptions} onClose={() => { onCloseOption(AitOptionLocation.rowGroup); }}>
                <AioOptionDisplay
                  options={rowGroupOptions}
                  setOptions={(ret) => {
                    if (!rowGroupOptions) return;
                    let rgl = { tableSection: higherOptions.tableSection, rowGroup: higherOptions.rowGroup, row: -1, column: -1 } as AitLocation;
                    setRowGroupOptions!(ret, rgl);
                  }}
                />
              </AsupInternalWindow>
            }

            {showRowOptions &&
              <AsupInternalWindow key="Row" Title={"Row options"} Visible={showRowOptions} onClose={() => { onCloseOption(AitOptionLocation.row); }}>
                <AioOptionDisplay
                  options={rowOptions}
                  setOptions={(ret) => {
                    if (!rowOptions) return;
                    let rl = { tableSection: higherOptions.tableSection, rowGroup: higherOptions.rowGroup, row: higherOptions.row, column: -1 } as AitLocation;
                    setRowOptions!(ret, rl);
                  }}
                />
              </AsupInternalWindow>
            }
          </>
        }
        {/* Cell options window */}
        {showCellOptions &&
          <AsupInternalWindow key="Cell" Title={"Cell options"} Visible={showCellOptions} onClose={() => { onCloseOption(AitOptionLocation.cell); }}>
            <div className="aiw-body-row">
              <div className={"aio-label"}>Cell location: </div>
              <div className={"aio-value"}><AioExpander inputObject={location} /></div>
            </div>
            <div className="aiw-body-row">
              <div className={"aio-label"}>Unprocessed text: </div>
              <div className={"aio-ro-value"}>{text}</div>
            </div>
            {(typeof addRowSpan === "function") ?
              <>
                <div className="aiw-body-row">
                  <div className={"aio-label"}>Row span: </div>
                  <div className={"aio-ro-value"}>{rowSpan ?? 1}</div>
                  <div className={"aiox-button-holder"} style={{ padding: "2px" }}>
                    <div className="aiox-button aiox-plus" onClick={() => addRowSpan(location)} />
                    {(typeof removeRowSpan === "function") && <div className="aiox-button aiox-minus" onClick={() => removeRowSpan(location)} />}
                  </div>
                </div>
              </>
              :
              <></>
            }
            {(typeof addColSpan === "function")
              ?
              <>
                <div className="aiw-body-row">
                  <div className={"aio-label"}>Column span: </div>
                  <div className={"aio-ro-value"}>{rowSpan ?? 1}</div>
                  <div className={"aiox-button-holder"} style={{ padding: "2px" }}>
                    <div className="aiox-button aiox-plus" onClick={() => addColSpan(location)} />
                    {(typeof removeColSpan === "function") && <div className="aiox-button aiox-minus" onClick={() => removeColSpan(location)} />}
                  </div>
                </div>
              </>
              :
              <></>
            }
            {(cellType === AitCellType.header)
              ?
              <>
                <div className="aiw-body-row">
                  <AioString
                    label="Colmn span"
                    value={colWidth ?? "120px"}
                    setValue={(ret) => returnData({
                      colWidth: ret
                    })}
                  />
                </div>
              </>
              :
              <></>
            }
          </AsupInternalWindow>
        }
      </div>
    </td>
  );
}