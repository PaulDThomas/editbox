import React, { useCallback, useMemo, useState } from "react";
import structuredClone from '@ungap/structured-clone';
import { v4 as uuidv4 } from "uuid";
import { AioOptionGroup } from "components/aio/aioInterface";
import { AitRowGroupData, AitRowData, AitOptionList, AitLocation, AitCellType, AitCellData } from "./aitInterface";
import { AitRow } from "./aitRow";
import { newCell, objEqual } from "./processes";

interface AitHeaderProps {
  aitid: string,
  rows: AitRowData[],
  options: AioOptionGroup,
  setHeaderData: (ret: AitRowGroupData) => void,
  higherOptions: AitOptionList,
}

export const AitHeader = ({ aitid, rows, options, setHeaderData, higherOptions }: AitHeaderProps): JSX.Element => {
  const [lastSend, setLastSend] = useState<AitRowGroupData>(structuredClone({ aitid: aitid, rows: rows, options: options }));

  const location: AitLocation = useMemo(() => {
    return {
      tableSection: higherOptions.tableSection,
      rowGroup: higherOptions.rowGroup,
      row: -1,
      column: -1,
      repeat: "",
    }
  }, [higherOptions]);

  // General function to return complied object
  const returnData = useCallback((headerUpdate: { rows?: AitRowData[], options?: AioOptionGroup }) => {
    if (typeof (setHeaderData) !== "function") return;
    let r = {
      aitid: aitid,
      rows: headerUpdate.rows ?? rows,
      options: headerUpdate.options ?? options,
    };
    let [chkObj] = objEqual(r, lastSend, `HEADERCHECK:${Object.values(location).join(',')}-`);
    if (!chkObj) {
      setHeaderData!(r);
      setLastSend(structuredClone(r));
    }
  }, [aitid, rows, options, lastSend, location, setHeaderData]);

  // Update row
  const updateRow = useCallback((ret, ri) => {
    // Create new object to send back
    let newRows = [...rows];
    newRows[ri] = ret;
    returnData({ rows: newRows });
  }, [rows, returnData]);

  const addRow = useCallback((ri) => {
    let newRows = [...rows];
    let newRow: AitRowData = {
      aitid: uuidv4(),
      options: [],
      cells: [],
    };
    let cols = rows[0].cells
      .map(c => (c.colSpan ?? 1))
      .reduce((sum, a) => sum + a, 0);
    for (let i = 0; i < cols; i++) newRow.cells.push(newCell(AitCellType.header));
    newRows.splice(ri + 1, 0, newRow);
    returnData({ rows: newRows });
  }, [returnData, rows])

  const removeRow = useCallback((ri) => {
    let newRows = [...rows];
    newRows.splice(ri, 1);
    returnData({ rows: newRows });
  }, [returnData, rows])


  // Manipulate cell spans
  const addColSpan = useCallback((loc: AitLocation) => {
    // Get things to change
    let newRows = [...rows];
    let targetCell:AitCellData = newRows[loc.row].cells[loc.column];
    let hideCell:AitCellData = newRows[loc.row].cells[loc.column+targetCell.colSpan];
    // Check change is ok
    if (targetCell === undefined || hideCell === undefined) return;
    if (targetCell.rowSpan !== 1) return;
    if (hideCell.rowSpan !== 1) return;
    if (loc.column + targetCell.colSpan === higherOptions.rowHeaderColumns) return;
    if (loc.column + targetCell.colSpan >= newRows[loc.row].cells.length) return;
    if (hideCell.colSpan !== 1) return;
    // Update target cell
    targetCell.colSpan++;
    targetCell.colWidth = (targetCell.colWidth ?? 60) + (hideCell.colWidth ?? 60);
    // Hide next cell
    hideCell.colSpan=0;
    newRows[loc.row].cells[loc.column + targetCell.colSpan - 1].colSpan = 0;
    // Done
    returnData({ rows: newRows });
  }, [higherOptions.rowHeaderColumns, returnData, rows]);

  const removeColSpan = useCallback((loc: AitLocation) => {
    // Get things to change
    let newRows = [...rows];
    let targetCell:AitCellData = newRows[loc.row].cells[loc.column];
    let hideCell:AitCellData = newRows[loc.row].cells[loc.column+targetCell.colSpan -1];
    // Update target cell
    targetCell.colSpan--;
    targetCell.colWidth = (targetCell.colWidth ?? 60) - (hideCell.colWidth ?? 60);
    // Show next cell
    hideCell.colSpan = 1;
    // Done
    returnData({ rows: newRows });
  }, [returnData, rows]);

  const addRowSpan = useCallback((loc: AitLocation) => {
    // Get things to change
    let newRows = [...rows];
    let targetCell:AitCellData = newRows[loc.row].cells[loc.column];
    let hideCell:AitCellData = newRows[loc.row+targetCell.rowSpan]?.cells[loc.column];
    // Check change is ok
    if (targetCell === undefined || hideCell === undefined) return;
    if (targetCell.colSpan !== 1) return;
    if (hideCell.colSpan !== 1) return;
    if (loc.column + targetCell.colSpan === higherOptions.rowHeaderColumns) return;
    if (loc.column + targetCell.colSpan >= newRows[loc.row].cells.length) return;
    // Update target cell
    targetCell.rowSpan++;
    // Hide next cell
    hideCell.rowSpan=0;
    // Done
    returnData({ rows: newRows });
  }, [higherOptions.rowHeaderColumns, returnData, rows]);

  const removeRowSpan = useCallback((loc: AitLocation) => {
    console.log(`Removing to rowspan for cell ${JSON.stringify(loc)}`);
    // Get things to change
    let newRows = [...rows];
    let targetCell:AitCellData = newRows[loc.row].cells[loc.column];
    // Check before getting hidden cell
    if (!newRows[loc.row+targetCell.rowSpan-1]?.cells.length) return;
    let hideCell:AitCellData = newRows[loc.row+1].cells[loc.column];
    // Update target cell
    targetCell.rowSpan--;
    // Show hidden cell
    hideCell.rowSpan = 1;
    // Done
    returnData({ rows: newRows });
    }, [returnData, rows]);

  return (
    <>
      {
        rows.map((row: AitRowData, ri: number): JSX.Element => {

          let rowHigherOptions: AitOptionList = {
            ...higherOptions,
            headerRows: rows.length,
            row: ri,
          } as AitOptionList;
          if (row.aitid === undefined) row.aitid = uuidv4();
          if (!row.options) row.options = [];

          return (
            <AitRow
              key={row.aitid}
              aitid={row.aitid}
              cells={row.cells}
              options={row.options}
              setRowData={(ret) => updateRow(ret, ri)}
              higherOptions={rowHigherOptions}
              spaceAfter={false}
              rowGroupOptions={options}
              setRowGroupOptions={(ret) => returnData({ options: ret })}
              rowGroupWindowTitle={"Header options"}
              addRow={addRow}
              removeRow={ri > 0 ? removeRow : undefined}
              addColSpan={addColSpan}
              removeColSpan={removeColSpan}
              addRowSpan={addRowSpan}
              removeRowSpan={removeRowSpan}
            />
          );
        }
        )
      }
    </>
  );
}