import React, { useCallback, useContext, useMemo, useState } from "react";
import { AioBoolean, AioComment, AioIconButton, AioReplacement, AioReplacementList } from "../aio";
import { AsupInternalWindow } from "../aiw";
import { AitBorderRow } from "./aitBorderRow";
import { AitCell } from "./aitCell";
import { AitCellData, AitColumnRepeat, AitLocation, AitRowData, AitRowType } from "./aitInterface";
import { TableSettingsContext } from "./aitContext";

interface AitRowProps {
  id: string;
  aitid: string;
  cells: AitCellData[];
  setRowData?: (ret: AitRowData) => void;
  setColWidth?: (colNo: number, colWidth: number) => void;
  location: AitLocation;
  replacements?: AioReplacement[];
  setReplacements?: (ret: AioReplacement[], location: AitLocation) => void;
  rowGroupWindowTitle?: string;
  addRowGroup?: (rgi: number, templateName?: string) => void;
  removeRowGroup?: (rgi: number) => void;
  rowGroupComments: string;
  updateRowGroupComments?: (ret: string) => void;
  addRow?: (ri: number) => void;
  removeRow?: (ri: number) => void;
  spaceAfter?: boolean;
  rowGroupSpace?: boolean;
  setRowGroupSpace?: (ret: boolean) => void;
}

export const AitRow = ({
  id,
  aitid,
  cells,
  setRowData,
  setColWidth,
  location,
  replacements,
  setReplacements,
  rowGroupWindowTitle,
  addRowGroup,
  removeRowGroup,
  rowGroupComments,
  updateRowGroupComments,
  addRow,
  removeRow,
  spaceAfter,
  rowGroupSpace,
  setRowGroupSpace,
}: AitRowProps): JSX.Element => {
  const tableSettings = useContext(TableSettingsContext);
  const [showRowGroupOptions, setShowRowGroupOptions] = useState(false);
  const editable = useMemo(() => {
    return tableSettings.editable && typeof setRowData === "function";
  }, [setRowData, tableSettings.editable]);

  // General function to return complied object
  const returnData = useCallback(
    (rowUpdate: { cells?: AitCellData[] }) => {
      if (editable && setRowData) {
        const r: AitRowData = {
          aitid: aitid,
          cells: rowUpdate.cells ?? cells,
        };
        setRowData(r);
      }
    },
    [editable, setRowData, aitid, cells],
  );

  const updateCell = useCallback(
    (ret: AitCellData, ci: number) => {
      // Create new object to send back
      const newCells = [...cells];
      newCells[ci] = ret;
      returnData({ cells: newCells });
    },
    [cells, returnData],
  );

  return (
    <>
      <tr id={`${id}`}>
        {/* Row group options */}
        <td
          className="ait-cell"
          width="50px"
        >
          <div
            className="ait-aie-holder"
            style={{ display: "flex", justifyContent: "flex-end", flexDirection: "row" }}
          >
            {location.row === 0 && !location.rowRepeat ? (
              <>
                {editable && typeof removeRowGroup === "function" && (
                  <AioIconButton
                    id={`${id}-remove-rowgroup`}
                    tipText={"Remove row group"}
                    iconName={"aiox-minus"}
                    onClick={() => removeRowGroup(location.rowGroup)}
                  />
                )}
                {editable && typeof addRowGroup === "function" && (
                  <AioIconButton
                    id={`${id}-add-rowgroup`}
                    tipText={"Add row group"}
                    iconName={"aiox-plus"}
                    onClick={(ret) => {
                      addRowGroup(location.rowGroup, ret);
                    }}
                    menuItems={tableSettings.groupTemplateNames}
                  />
                )}
                <AioIconButton
                  id={`${id}-rowgroup-options`}
                  tipText="Row group options"
                  iconName="aio-button-row-group"
                  onClick={() => {
                    setShowRowGroupOptions(!showRowGroupOptions);
                  }}
                />
                {/* Row group options window */}
                {showRowGroupOptions && (
                  <AsupInternalWindow
                    id={`${id}-rowgroup-options-window`}
                    key="RowGroup"
                    title={rowGroupWindowTitle ?? "Row group options"}
                    visible={showRowGroupOptions}
                    onClose={() => {
                      setShowRowGroupOptions(false);
                    }}
                    style={{ maxHeight: "75vh" }}
                  >
                    <div className="aiw-body-row">
                      <AioComment
                        id={`${id}-rowgroup-comment`}
                        label={"Notes"}
                        value={rowGroupComments}
                        setValue={editable ? updateRowGroupComments : undefined}
                        commentStyles={tableSettings.commentStyles}
                      />
                    </div>
                    <>
                      {location.tableSection === AitRowType.body && (
                        <>
                          <div className="aiw-body-row">
                            <AioBoolean
                              id={`${id}-spaceafter-group`}
                              label="Space after group"
                              value={rowGroupSpace ?? false}
                              setValue={editable ? setRowGroupSpace : undefined}
                            />
                          </div>
                        </>
                      )}
                    </>
                    <div className="aiw-body-row">
                      <AioReplacementList
                        id={`${id}-rowgroup-replacements`}
                        label={"Replacements"}
                        replacements={replacements}
                        setReplacements={
                          editable && typeof setReplacements === "function"
                            ? (ret) => {
                                setReplacements(ret, location);
                              }
                            : undefined
                        }
                        externalLists={tableSettings.externalLists}
                        dontAskSpace={location.tableSection === AitRowType.header}
                        dontAskTrail={location.tableSection === AitRowType.header}
                      />
                    </div>
                  </AsupInternalWindow>
                )}
              </>
            ) : null}
          </div>
        </td>

        {/* All cells from row */}
        {cells.map((cell: AitCellData, ci: number): JSX.Element => {
          // Get cell from column repeat
          const cr: AitColumnRepeat | undefined =
            Array.isArray(tableSettings.columnRepeats) && tableSettings.columnRepeats.length > ci
              ? tableSettings.columnRepeats[ci]
              : undefined;
          const isColumnRepeat =
            cr !== undefined && cr.colRepeat !== undefined
              ? cr.colRepeat.match(/^[[\]0,]+$/) === null
              : false;

          // Render object
          return (
            <AitCell
              id={`${id}-cell-${ci}`}
              key={
                isColumnRepeat && cr ? `${cell.aitid}-${JSON.stringify(cr.colRepeat)}` : cell.aitid
              }
              aitid={cell.aitid ?? `cell-${ci}`}
              text={cell.text ?? `cell-${ci}`}
              justifyText={cell.justifyText}
              comments={cell.comments ?? ""}
              colWidth={cell.colWidth}
              displayColWidth={cell.colWidth}
              textIndents={cell.textIndents ?? 0}
              replacedText={cell.replacedText}
              location={{ ...location, column: cr?.columnIndex ?? -1, colRepeat: cr?.colRepeat }}
              setCellData={
                editable && !isColumnRepeat && typeof addRow === "function"
                  ? (ret) => updateCell(ret, ci)
                  : undefined
              }
              setColWidth={editable && setColWidth ? (ret) => setColWidth(ci, ret) : undefined}
              readOnly={!editable || isColumnRepeat || typeof addRow !== "function"}
            />
          );
        })}
        {/* Row buttons */}
        <td
          className="ait-cell"
          width="50px"
        >
          <div
            className="ait-aie-holder"
            style={{ display: "flex", justifyContent: "flex-start", flexDirection: "row" }}
          >
            {editable && addRow && (
              <AioIconButton
                id={`${id}-add-row`}
                tipText="Add row"
                iconName={"aiox-plus"}
                onClick={() => {
                  addRow(location.row);
                }}
              />
            )}
            {editable && removeRow && (
              <AioIconButton
                id={`${id}-remove-row`}
                tipText="Remove row"
                iconName={"aiox-minus"}
                onClick={() => {
                  removeRow(location.row);
                }}
              />
            )}
          </div>
        </td>
      </tr>
      {/* Additional row if required */}
      {(spaceAfter !== false || cells.some((c) => c.spaceAfterRepeat)) && (
        <AitBorderRow
          id={`${id}-spaceafter-row`}
          spaceAfter={true}
          noBorder={true}
        />
      )}
    </>
  );
};
