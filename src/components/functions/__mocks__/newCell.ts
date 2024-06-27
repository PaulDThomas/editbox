import { AitCellData, AitHeaderCellData } from "../../table/interface";

let mockUUID = 4000;

/**
 * Create a blank new cell
 * @param type Type of cell to create
 * @returns data for a new blank cell
 */
export const newCell = <T extends string | object>(cellWidth: number, blank: T): AitCellData<T> => {
  const cell: AitCellData<T> = {
    aitid: `mockUUID-${++mockUUID}`,
    text: blank as T,
    comments: blank as T,
    colWidth: cellWidth,
  };
  return cell;
};

/**
 * Create a blank new header cell
 * @param type Type of cell to create
 * @returns data for a new blank cell
 */
export const newHeaderCell = <T extends string | object>(
  cellWidth: number,
  blank: T,
): AitHeaderCellData<T> => {
  const cell: AitHeaderCellData<T> = {
    aitid: `mockUUID-${++mockUUID}`,
    text: blank as T,
    rowSpan: 1,
    colSpan: 1,
    colWidth: cellWidth,
    comments: blank as T,
  };
  return cell;
};