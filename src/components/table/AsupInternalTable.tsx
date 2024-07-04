/* eslint-disable react-hooks/exhaustive-deps */
import { ContextWindow } from "@asup/context-menu";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AsupInternalEditor, getRawTextParts } from "../aie";
import { newReplacedText } from "../aie/functions/newReplacedText";
import { joinIntoBlock, splitIntoLines } from "../aie/functions/splitIntoLines";
import {
  AioBoolean,
  AioComment,
  AioExternalReplacements,
  AioExternalSingle,
  AioIconButton,
  AioNumber,
} from "../aio";
import {
  bodyPreProcess,
  headerPreProcess,
  newCell,
  newRow,
  newRowGroup,
  repeatHeaders,
  repeatRows,
} from "../functions";
import { newHeaderCell } from "../functions/newCell";
import { unProcessRowGroup } from "../functions/unProcessRowGroup";
import { AieStyleMap, AsupInternalEditorProps } from "../interface";
import { AitBorderRow } from "./AitBorderRow";
import { AitHeader } from "./AitHeader";
import { AitRowGroup } from "./AitRowGroup";
import { TableSettingsContext } from "./TableSettingsContext";
import "./ait.css";
import {
  AitColumnRepeat,
  AitHeaderGroupData,
  AitLocation,
  AitRowGroupData,
  AitRowType,
  AitTableData,
} from "./interface";

interface AsupInternalTableProps<T extends string | object> {
  id: string;
  tableData: AitTableData<T>;
  isEditable?: boolean;
  setTableData?: (ret: AitTableData<T>) => void;
  processedDataRef?: React.MutableRefObject<AitTableData<T> | undefined>;
  externalLists?: AioExternalReplacements<T>[];
  externalSingles?: AioExternalSingle<T>[];
  style?: React.CSSProperties;
  showCellBorders?: boolean;
  groupTemplates?: AitRowGroupData<T>[] | false;
  commentStyles?: AieStyleMap;
  cellStyles?: AieStyleMap;
  colWidthMod?: number;
  initialDecimalAlignPercent?: number;
  defaultCellWidth?: number;
  noTableOptions?: boolean;
  Editor?: (props: AsupInternalEditorProps<T>) => JSX.Element;
  getTextFromT?: (text: T) => string[];
  replaceTextInT?: (s: T, oldPhrase: string, newPhrase: T) => T;
  blankT?: T;
  joinTintoBlock?: (lines: T[]) => T;
  splitTintoLines?: (text: T) => T[];
}

/**
 * Table view for clinical table data
 * @param props
 * @returns
 */
export const AsupInternalTable = <T extends string | object>({
  id,
  tableData,
  isEditable = true,
  setTableData,
  processedDataRef,
  externalLists,
  externalSingles,
  style,
  showCellBorders,
  groupTemplates,
  commentStyles,
  cellStyles,
  colWidthMod = 2,
  initialDecimalAlignPercent = 60,
  defaultCellWidth = 60,
  noTableOptions = false,
  Editor = AsupInternalEditor,
  getTextFromT = getRawTextParts,
  replaceTextInT = newReplacedText,
  blankT = "" as T,
  joinTintoBlock = joinIntoBlock,
  splitTintoLines = splitIntoLines,
}: AsupInternalTableProps<T>) => {
  // Internal state
  const [showOptions, setShowOptions] = useState(false);
  const [columnRepeats, setColumnRepeats] = useState<AitColumnRepeat[] | null>(null);

  // Explode tableData
  const [headerData, setHeaderData] = useState<AitHeaderGroupData<T> | false>();
  const [bodyData, setBodyData] = useState<AitRowGroupData<T>[]>();
  const [comments, setComments] = useState<T>();
  const [rowHeaderColumns, setRowHeaderColumns] = useState<number>();
  const [noRepeatProcessing, setNoRepeatProcessing] = useState<boolean>();
  const [windowZIndex, setWindowZIndex] = useState<number>(10000);
  const [decimalAlignPercent, setDecimalAlignPercent] = useState<number>(
    initialDecimalAlignPercent,
  );

  // Editable property
  const editable = useMemo(() => {
    return isEditable && typeof setTableData === "function";
  }, [isEditable, setTableData]);

  // Pushdown data when it it updated externally
  useEffect(() => {
    // Set defaults for no processing
    const headerData = headerPreProcess(defaultCellWidth, blankT, tableData.headerData);
    let columnRepeats =
      tableData.bodyData === undefined
        ? null
        : Array.from(tableData.bodyData[0].rows[0].cells.keys()).map((n) => {
            return { columnIndex: n };
          });
    let processedHeaderData = headerData;

    // Process repeats if required
    if (processedHeaderData !== false && (processedHeaderData.rows.length ?? 0) > 0) {
      const headerDataUpdate = repeatHeaders(
        processedHeaderData.rows,
        processedHeaderData.replacements ?? [],
        defaultCellWidth,
        getTextFromT,
        replaceTextInT,
        blankT,
        tableData.noRepeatProcessing ?? false,
        tableData.rowHeaderColumns ?? 0,
        externalLists,
        externalSingles,
      );
      processedHeaderData = {
        aitid: processedHeaderData.aitid,
        name: processedHeaderData.name,
        rows: headerDataUpdate.rows,
        comments: processedHeaderData.comments,
        spaceAfter: processedHeaderData.spaceAfter,
        replacements: processedHeaderData.replacements,
      };
      columnRepeats = headerDataUpdate.columnRepeats;
    }
    setHeaderData(processedHeaderData);
    setColumnRepeats(columnRepeats);

    // Create processed body
    const bodyData = bodyPreProcess(defaultCellWidth, blankT, tableData.bodyData);
    const processedBodyData: AitRowGroupData<T>[] = bodyData.map((rg) => {
      return {
        ...rg,
        rows: repeatRows(
          rg.rows,
          defaultCellWidth,
          getTextFromT,
          replaceTextInT,
          blankT,
          rg.replacements,
          rg.spaceAfter,
          noRepeatProcessing,
          externalLists,
          externalSingles,
        ).map((r) => {
          return {
            ...r,
            cells: columnRepeats?.map((ci) => r.cells[ci.columnIndex]) ?? r.cells,
          };
        }),
      };
    });
    setBodyData(processedBodyData);
    // Set ref for processed data
    if (processedDataRef !== undefined)
      processedDataRef.current = { bodyData: processedBodyData, headerData: processedHeaderData };

    // Info that is not processed
    setComments(tableData.comments);
    setRowHeaderColumns(tableData.rowHeaderColumns ?? 1);
    setNoRepeatProcessing(tableData.noRepeatProcessing ?? false);
    setDecimalAlignPercent(tableData.decimalAlignPercent ?? initialDecimalAlignPercent);
  }, [
    defaultCellWidth,
    externalLists,
    externalSingles,
    initialDecimalAlignPercent,
    noRepeatProcessing,
    processedDataRef,
    setTableData,
    tableData,
  ]);

  // Unprocess data on the way back up
  const returnData = useCallback(
    (tableUpdate: {
      headerData?: AitRowGroupData<T> | false;
      headerDataUnprocessed?: boolean;
      bodyData?: AitRowGroupData<T>[];
      bodyDataUnprocessed?: boolean;
      comments?: T;
      rowHeaderColumns?: number;
      noRepeatProcessing?: boolean;
      decimalAlignPercent?: number;
    }) => {
      if (setTableData) {
        // Unprocess header data
        const headerRet =
          !tableUpdate.headerDataUnprocessed && tableUpdate.headerData
            ? unProcessRowGroup(tableUpdate.headerData, columnRepeats)
            : tableUpdate.headerData
              ? tableUpdate.headerData
              : headerData !== false && headerData !== undefined
                ? unProcessRowGroup(headerData, columnRepeats)
                : headerData;
        // Unprocess body data
        const bodyRet =
          tableUpdate.bodyDataUnprocessed || !tableUpdate.bodyData
            ? tableUpdate.bodyData ?? bodyData?.map((rg) => unProcessRowGroup(rg, columnRepeats))
            : tableUpdate.bodyData.map((rg) => unProcessRowGroup(rg, columnRepeats));
        // Assenble return information
        const r = {
          headerData: headerRet,
          bodyData: bodyRet,
          comments: tableUpdate.comments ?? comments,
          rowHeaderColumns: tableUpdate.rowHeaderColumns ?? rowHeaderColumns,
          noRepeatProcessing: tableUpdate.noRepeatProcessing ?? noRepeatProcessing,
          decimalAlignPercent: tableUpdate.decimalAlignPercent ?? decimalAlignPercent,
        };
        setTableData(r);
      }
    },
    [
      setTableData,
      unProcessRowGroup,
      headerData,
      bodyData,
      comments,
      rowHeaderColumns,
      noRepeatProcessing,
      decimalAlignPercent,
    ],
  );

  // Add column
  const addCol = useCallback(
    (ci: number) => {
      // Check ok to proceed
      if (rowHeaderColumns === undefined || headerData === undefined || bodyData === undefined)
        return;
      // Update body data
      let newBody: AitRowGroupData<T>[] = bodyData.map((rg) =>
        unProcessRowGroup(rg, columnRepeats),
      );
      newBody = newBody.map((rg) => {
        rg.rows = rg.rows.map((r) => {
          r.cells.splice(ci + 1, 0, newCell(defaultCellWidth, blankT));
          return r;
        });
        return rg;
      });
      // Update header group
      const newHeader = headerData && unProcessRowGroup(headerData, columnRepeats);
      if (newHeader !== false) {
        headerData.rows = newHeader.rows.map((r) => {
          // Check for colSpan
          if (ci >= 0 && r.cells[ci + 1]?.colSpan === 0) {
            // Change colSpan on previous spanner
            let lookback = 1;
            while (lookback <= ci && (r.cells[ci + 1 - lookback].colSpan ?? 0) === 0) lookback++;
            const targetCellBefore = r.cells[ci + 1 - lookback];
            if (targetCellBefore.colSpan === undefined) targetCellBefore.colSpan = 1;
            targetCellBefore.colSpan = targetCellBefore.colSpan + 1;
            // Add in blank cell
            const n = newHeaderCell<T>(defaultCellWidth, blankT);
            n.colSpan = 0;
            r.cells.splice(ci + 1, 0, n);
          } else {
            r.cells.splice(ci + 1, 0, newHeaderCell(defaultCellWidth, blankT));
          }
          return r;
        });
      }
      returnData({
        headerData: newHeader,
        headerDataUnprocessed: true,
        bodyData: newBody,
        bodyDataUnprocessed: true,
        rowHeaderColumns: ci < rowHeaderColumns - 1 ? rowHeaderColumns + 1 : rowHeaderColumns,
      });
    },
    [bodyData, defaultCellWidth, headerData, returnData, rowHeaderColumns, unProcessRowGroup],
  );

  // Remove column
  const remCol = useCallback(
    (ci: number) => {
      // Check ok to proceed
      if (rowHeaderColumns === undefined || headerData === undefined || bodyData === undefined)
        return;
      // Update body data
      let newBody: AitRowGroupData<T>[] = bodyData.map((rg) =>
        unProcessRowGroup(rg, columnRepeats),
      );
      newBody = newBody.map((rg) => {
        // let newRg = unProcessRowGroup(rg) as AitRowGroupData;
        const newRg = { ...rg };
        newRg.rows = newRg.rows.map((r) => {
          r.cells.splice(ci, 1);
          return r;
        });
        return newRg;
      });
      // Update header group
      const newHeader = headerData && unProcessRowGroup(headerData, columnRepeats);
      if (newHeader !== false) {
        headerData.rows = newHeader.rows.map((r) => {
          // Check for colSpan
          const c = r.cells[ci];
          if (c.colSpan === undefined) c.colSpan = 1;
          // Reduce where a hidden cell has been removed
          if (c.colSpan === 0) {
            let lookBack = 1;
            while (r.cells[ci - lookBack].colSpan === 0) {
              lookBack++;
            }
            r.cells[ci - lookBack].colSpan = (r.cells[ci - lookBack].colSpan ?? 1) - 1;
          }
          // Reveal where an expanded cell has been removed
          else if (c.colSpan > 1) {
            for (let cj = 1; cj < c.colSpan; cj++) {
              r.cells[ci + cj].colSpan = 1;
            }
          }
          r.cells.splice(ci, 1);
          return r;
        });
      }
      returnData({
        headerData: newHeader,
        headerDataUnprocessed: true,
        bodyData: newBody,
        bodyDataUnprocessed: true,
        rowHeaderColumns: ci < rowHeaderColumns ? rowHeaderColumns - 1 : rowHeaderColumns,
      });
    },
    [bodyData, headerData, returnData, rowHeaderColumns, unProcessRowGroup],
  );

  // Update to a rowGroup data
  const updateRowGroup = useCallback(
    (ret: AitRowGroupData<T>, rgi: number) => {
      const newBody: AitRowGroupData<T>[] = [...(bodyData ?? [])];
      newBody[rgi] = ret;
      returnData({ bodyData: newBody });
    },
    [bodyData, returnData],
  );

  // Add a new row group to the table body
  const addRowGroup = useCallback(
    (rgi: number, templateName?: string) => {
      // Check ok to proceed
      if (bodyData === undefined) return;
      // Create new body, take template if it can be found
      const ix =
        !templateName || !groupTemplates
          ? -1
          : groupTemplates.findIndex((g) => g.name === templateName);
      const newRowGroupTemplate: AitRowGroupData<T> =
        ix > -1 && groupTemplates ? groupTemplates[ix] : { rows: [{ cells: [] }] };
      // Ensure new template meets requirements
      const newrg: AitRowGroupData<T> = newRowGroup(
        defaultCellWidth,
        blankT,
        bodyData[0].rows[0].cells.length,
        newRowGroupTemplate,
      );
      // Set column widths
      newrg.rows.forEach((r) =>
        r.cells.forEach((c, ci) => (c.colWidth = bodyData[0].rows[0].cells[ci].colWidth)),
      );
      // Copy existing body and splice in new data
      const newBody = bodyData?.map((rg) => unProcessRowGroup(rg, columnRepeats)) ?? [];
      newBody.splice(rgi + 1, 0, newrg);
      // Update table body
      returnData({ bodyData: newBody, bodyDataUnprocessed: true });
    },
    [bodyData, defaultCellWidth, groupTemplates, returnData],
  );

  // Remove a row group from the table body
  const removeRowGroup = useCallback(
    (rgi: number) => {
      // Check ok to proceed
      if (bodyData === undefined) return;
      // Update bodyData
      const newRowGroups: AitRowGroupData<T>[] = [...bodyData];
      newRowGroups.splice(rgi, 1);
      returnData({ bodyData: newRowGroups });
    },
    [bodyData, returnData],
  );

  // Add rowHeader columns
  const addRowHeaderColumn = useCallback(() => {
    // Check ok to proceed
    if (rowHeaderColumns === undefined || headerData === undefined || bodyData === undefined)
      return;
    // Check new column has no colspan
    if (rowHeaderColumns === bodyData[0].rows[0].cells.length - 1) return;
    if (
      headerData !== false &&
      headerData.rows.some((r) => (r.cells[rowHeaderColumns].colSpan ?? 1) !== 1)
    )
      return;
    returnData({ rowHeaderColumns: rowHeaderColumns + 1 });
  }, [bodyData, headerData, returnData, rowHeaderColumns]);

  // Remove rowHeader columns
  const removeRowHeaderColumn = useCallback(() => {
    // Check ok to proceed
    if (
      rowHeaderColumns === 0 ||
      rowHeaderColumns === undefined ||
      headerData === undefined ||
      bodyData === undefined
    )
      return;
    if (
      headerData !== false &&
      headerData.rows.some((r) => (r.cells[rowHeaderColumns - 1].colSpan ?? 1) !== 1)
    )
      return;
    returnData({ rowHeaderColumns: rowHeaderColumns - 1 });
  }, [bodyData, headerData, returnData, rowHeaderColumns]);

  // Add header if is is not there
  const addNewHeader = useCallback(() => {
    // Check ok to proceed
    if (headerData === false) return;
    if ((headerData?.rows.length ?? 0) > 0 || bodyData === undefined) return;
    // Create new row
    const newHeader: AitRowGroupData<T> = {
      ...headerData,
      rows: [newRow(defaultCellWidth, blankT, bodyData[0].rows[0].cells.length)],
    };
    returnData({ headerData: newHeader });
  }, [bodyData, defaultCellWidth, headerData, returnData]);

  // Update columnWidth
  const updateColWidth = useCallback(
    (colNo: number, colWidth: number) => {
      const newHeaderData =
        headerData !== undefined && headerData !== false
          ? {
              ...headerData,
              rows: headerData.rows.map((r) => {
                return {
                  ...r,
                  cells: r.cells.map((c, ci) => {
                    // Check against the column repeat number if it exists
                    return {
                      ...c,
                      colWidth: columnRepeats
                        ? columnRepeats[ci].columnIndex === columnRepeats[colNo].columnIndex
                          ? colWidth
                          : c.colWidth
                        : ci === colNo
                          ? colWidth
                          : c.colWidth,
                    };
                  }),
                };
              }),
            }
          : headerData;
      const newBodyData =
        bodyData !== undefined
          ? bodyData.map((rg) => {
              return {
                ...rg,
                rows: rg.rows.map((r) => {
                  return {
                    ...r,
                    cells: r.cells.map((c, ci) => {
                      // Check against the column repeat number if it exists
                      return {
                        ...c,
                        colWidth: columnRepeats
                          ? columnRepeats[ci].columnIndex === columnRepeats[colNo].columnIndex
                            ? colWidth
                            : c.colWidth
                          : ci === colNo
                            ? colWidth
                            : c.colWidth,
                      };
                    }),
                  };
                }),
              };
            })
          : undefined;
      returnData({
        headerData: newHeaderData,
        bodyData: newBodyData,
      });
    },
    [bodyData, columnRepeats, headerData, returnData],
  );

  // Manipulate cell spans
  const addHeaderColSpan = useCallback(
    (loc: AitLocation) => {
      if (!headerData) return;
      // Update header group
      const newHeader = unProcessRowGroup(headerData, columnRepeats);
      const newRows = [...newHeader.rows];
      const actualCol = loc.column;

      // Get things to change
      const targetCell = newRows[loc.row].cells[actualCol];
      if (targetCell.colSpan === undefined) targetCell.colSpan = 1;
      const hideCell = newRows[loc.row].cells[actualCol + targetCell.colSpan];

      // Check change is ok
      if (
        targetCell === undefined ||
        hideCell === undefined ||
        targetCell.rowSpan !== 1 ||
        hideCell.rowSpan !== 1 ||
        hideCell.colSpan !== 1
      )
        return;
      if (loc.column + targetCell.colSpan === rowHeaderColumns) return;
      if (loc.column + targetCell.colSpan >= newRows[loc.row].cells.length) return;
      if (hideCell.colSpan !== 1) return;
      // Update target cell
      targetCell.colSpan++;
      // Hide next cell
      hideCell.colSpan = 0;
      // Done
      returnData({ headerData: { ...newHeader, rows: newRows }, headerDataUnprocessed: true });
    },
    [headerData, unProcessRowGroup, columnRepeats, rowHeaderColumns, returnData],
  );

  const removeHeaderColSpan = useCallback(
    (loc: AitLocation) => {
      if (!headerData) return;
      // Update header group
      const newHeader = unProcessRowGroup(headerData, columnRepeats);
      const newRows = [...newHeader.rows];
      // Get things to change
      const actualCol = loc.column;
      const targetCell = newRows[loc.row].cells[actualCol];
      const hideCell = newRows[loc.row].cells[actualCol + (targetCell.colSpan ?? 1) - 1];
      // Update target cell
      targetCell.colSpan = (targetCell.colSpan ?? 1) - 1;
      // Show next cell
      hideCell.colSpan = 1;
      if (hideCell.rowSpan === 0) hideCell.rowSpan = 1;
      // Done
      returnData({ headerData: { ...newHeader, rows: newRows }, headerDataUnprocessed: true });
    },
    [headerData, columnRepeats],
  );

  // Show loading if there is nothing to see
  if (
    bodyData === undefined ||
    bodyData.length < 1 ||
    headerData === undefined ||
    // || processedHeader === null
    rowHeaderColumns === undefined ||
    noRepeatProcessing === undefined ||
    columnRepeats === undefined
  ) {
    return <div>Loading...</div>;
  }

  // Print the table
  return (
    <TableSettingsContext.Provider
      value={{
        showCellBorders: showCellBorders,
        noRepeatProcessing: noRepeatProcessing ?? false,
        rowHeaderColumns: rowHeaderColumns ?? 1,
        headerRows: headerData === false ? 0 : headerData.rows.length,
        externalLists: externalLists ?? [],
        editable,
        groupTemplateNames:
          groupTemplates === false
            ? ["None"]
            : groupTemplates !== undefined
              ? (groupTemplates
                  .filter((g) => g.name !== undefined)
                  .map((g) => g.name)
                  .sort((a, b) => (a ?? "").localeCompare(b ?? "")) as string[])
              : undefined,
        commentStyles: commentStyles,
        cellStyles: cellStyles,
        columnRepeats: columnRepeats,
        windowZIndex,
        setWindowZIndex,
        colWidthMod,
        decimalAlignPercent,
        defaultCellWidth,
        blank: blankT,
        Editor: Editor as unknown as (
          props: AsupInternalEditorProps<string | object>,
        ) => JSX.Element,
        getTextFromT: getTextFromT as unknown as (text: string | object) => string[],
        replaceTextInT: replaceTextInT as unknown as (
          s: string | object,
          oldPhrase: string,
          newPhrase: string | object,
        ) => string | object,
        joinTintoBlock: joinTintoBlock as unknown as (
          lines: (string | object)[],
        ) => string | object,
        splitTintoLines: splitTintoLines as unknown as (
          text: string | object,
        ) => (string | object)[],
      }}
    >
      <div
        className="ait-holder"
        style={style}
      >
        <div>
          {!noTableOptions && (
            <AioIconButton
              id={`${id}-table-options`}
              tipText="Global options"
              onClick={() => {
                setShowOptions(!showOptions);
              }}
              iconName={"aio-button-settings"}
            />
          )}
          {showOptions && (
            <ContextWindow
              id={`${id}-options-window`}
              title={"Global options"}
              visible={showOptions}
              onClose={() => {
                setShowOptions(false);
              }}
            >
              <div className="aiw-body-row">
                <AioComment
                  id={`${id}-table-comment`}
                  label={"Notes"}
                  value={comments}
                  setValue={
                    editable
                      ? (ret) => {
                          returnData({ comments: ret });
                        }
                      : undefined
                  }
                  commentStyles={commentStyles}
                />
              </div>
              {headerData !== false && headerData.rows.length === 0 ? (
                <div className="aiw-body-row">
                  <div className={"aio-label"}>Add header section: </div>
                  <div
                    className={"aiox-button-holder"}
                    style={{ padding: "2px" }}
                  >
                    <div
                      className="aiox-button aiox-plus"
                      id={`${id}-add-header`}
                      onClick={editable ? () => addNewHeader() : undefined}
                    />
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div className="aiw-body-row">
                <AioBoolean
                  id={`${id}-suppress-repeats`}
                  label="Suppress repeats"
                  value={noRepeatProcessing ?? false}
                  setValue={
                    editable
                      ? (ret) => {
                          returnData({ noRepeatProcessing: ret });
                        }
                      : undefined
                  }
                />
              </div>
              <div className="aiw-body-row">
                <div className={"aio-label"}>Row headers: </div>
                <div className={"aio-ro-value"}>{rowHeaderColumns ?? 1}</div>
                <div
                  className={"aiox-button-holder"}
                  style={{ padding: "2px" }}
                >
                  {editable && (rowHeaderColumns ?? 1) < bodyData[0].rows[0].cells.length - 1 ? (
                    <div
                      id={`${id}-add-row-header-column`}
                      className="aiox-button aiox-plus"
                      onClick={() => addRowHeaderColumn()}
                    />
                  ) : (
                    <div className="aiox-button" />
                  )}
                  {editable && (rowHeaderColumns ?? 1) > 0 ? (
                    <div
                      className="aiox-button aiox-minus"
                      id={`${id}-remove-row-header-column`}
                      onClick={() => removeRowHeaderColumn()}
                    />
                  ) : (
                    <div className="aiox-button" />
                  )}
                </div>
              </div>
              <div className="aiw-body-row">
                <AioNumber
                  id={`${id}-decimal-align-percent`}
                  label="Decimal align percent"
                  value={decimalAlignPercent}
                  minValue={0}
                  maxValue={100}
                  setValue={
                    editable
                      ? (ret) => {
                          returnData({ decimalAlignPercent: ret });
                        }
                      : undefined
                  }
                />
              </div>
            </ContextWindow>
          )}
        </div>
        <table
          id={id}
          className="ait-table"
        >
          <thead>
            <AitBorderRow
              id={`${id}-top-border`}
              spaceAfter={true}
              changeColumns={
                editable
                  ? {
                      addColumn: addCol,
                      removeColumn: remCol,
                      showButtons: true,
                    }
                  : undefined
              }
              rowHeaderColumns={rowHeaderColumns}
            />
            {headerData !== false && (
              <AitHeader
                id={`${id}-header`}
                aitid={headerData.aitid ?? "header"}
                rows={headerData.rows}
                comments={headerData.comments}
                replacements={headerData.replacements}
                setHeaderData={
                  editable
                    ? (ret) => {
                        returnData({ headerData: ret });
                      }
                    : undefined
                }
                setColWidth={updateColWidth}
                addHeaderColSpan={addHeaderColSpan}
                removeHeaderColSpan={removeHeaderColSpan}
              />
            )}
          </thead>

          <tbody>
            {bodyData.map((rowGroup: AitRowGroupData<T>, rgi: number) => {
              return (
                <AitRowGroup
                  id={`${id}-row-group-${rgi}`}
                  key={`row-group-${rgi}-${rowGroup.aitid}`}
                  aitid={rowGroup.aitid ?? `row-group-${rgi}`}
                  rows={rowGroup.rows}
                  comments={rowGroup.comments}
                  replacements={rowGroup.replacements ?? []}
                  spaceAfter={rowGroup.spaceAfter}
                  setRowGroupData={
                    editable
                      ? (ret) => {
                          updateRowGroup(ret, rgi);
                        }
                      : undefined
                  }
                  setColWidth={updateColWidth}
                  location={{
                    tableSection: AitRowType.body,
                    rowGroup: rgi,
                    row: -1,
                    column: -1,
                  }}
                  addRowGroup={
                    groupTemplates !== false
                      ? (rgi, templateName) => {
                          addRowGroup(rgi, templateName);
                        }
                      : undefined
                  }
                  removeRowGroup={
                    groupTemplates !== false && bodyData.length > 1
                      ? (rgi) => {
                          removeRowGroup(rgi);
                        }
                      : undefined
                  }
                />
              );
            })}
            <AitBorderRow id={`${id}-bottom-border`} />
          </tbody>
        </table>
      </div>
    </TableSettingsContext.Provider>
  );
};

AsupInternalTable.displayName = "AsupInternalTable";
