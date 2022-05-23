import { v4 as uuidv4 } from 'uuid';
import { newCell } from "./newCell";
import { AitCellData, AitRowGroupData } from "../ait";
import { newRow } from './newRow';

/**
 * Add newRowGroupTemplate to existing body
 * @param l - Length of row 
 * @param newRowGroupTemplate 
 * @returns New row group
 */
export const newRowGroup = (l?: number, newRowGroupTemplate?: AitRowGroupData): AitRowGroupData => {
  return {
    aitid: uuidv4(),
    replacements: newRowGroupTemplate?.replacements ?? [],
    rows: newRowGroupTemplate?.rows.map(row => {
      let newCells: AitCellData[] = [];
      for (let ci = 0; ci < (l ?? 1); ci++) {
        newCells.push(
          row.cells[ci] !== undefined
            ? { ...row.cells[ci], aitid: uuidv4() }
            : newCell()
        );
      }
      return {
        aitid: uuidv4(),
        cells: newCells,
      };
    }) ?? [newRow()],
    spaceAfter: true,
  };
};