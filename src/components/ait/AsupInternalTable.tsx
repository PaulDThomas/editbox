import React, { useCallback, useEffect, useState } from 'react';
import { AieStyleMap } from '../aie';
import {
  AioBoolean,
  AioComment,
  AioExternalReplacements,
  AioExternalSingle,
  AioIconButton,
  AioNumber,
} from '../aio';
import { AsupInternalWindow } from '../aiw';
import {
  bodyPreProcess,
  headerPreProcess,
  newCell,
  newRow,
  newRowGroup,
  repeatHeaders,
  repeatRows,
} from '../functions';
import './ait.css';
import { AitBorderRow } from './aitBorderRow';
import { TableSettingsContext } from './aitContext';
import { AitHeader } from './aitHeader';
import { AitColumnRepeat, AitRowGroupData, AitRowType, AitTableData } from './aitInterface';
import { AitRowGroup } from './aitRowGroup';

interface AsupInternalTableProps {
  tableData: AitTableData;
  setTableData: (ret: AitTableData) => void;
  processedDataRef?: React.MutableRefObject<AitTableData | undefined>;
  externalLists?: AioExternalReplacements[];
  externalSingles?: AioExternalSingle[];
  style?: React.CSSProperties;
  showCellBorders?: boolean;
  groupTemplates?: AitRowGroupData[] | false;
  commentStyles?: AieStyleMap;
  cellStyles?: AieStyleMap;
  colWidthMod?: number;
  initialDecimalAlignPercent?: number;
  defaultCellWidth?: number;
}

/**
 * Table view for clinical table data
 * @param props
 * @returns
 */
export const AsupInternalTable = ({
  tableData,
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
}: AsupInternalTableProps) => {
  // Internal state
  const [showOptions, setShowOptions] = useState(false);
  const [columnRepeats, setColumnRepeats] = useState<AitColumnRepeat[] | null>(null);

  // Explode tableData
  const [headerData, setHeaderData] = useState<AitRowGroupData | false>();
  const [bodyData, setBodyData] = useState<AitRowGroupData[]>();
  const [comments, setComments] = useState<string>();
  const [rowHeaderColumns, setRowHeaderColumns] = useState<number>();
  const [noRepeatProcessing, setNoRepeatProcessing] = useState<boolean>();
  const [windowZIndex, setWindowZIndex] = useState<number>(10000);
  const [decimalAlignPercent, setDecimalAlignPercent] = useState<number>(
    initialDecimalAlignPercent,
  );

  // Pushdown data when it it updated externally
  useEffect(() => {
    // Set defaults for no processing
    const headerData = headerPreProcess(defaultCellWidth, tableData.headerData);
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
    const bodyData = bodyPreProcess(defaultCellWidth, tableData.bodyData);
    const processedBodyData: AitRowGroupData[] = bodyData.map((rg) => {
      return {
        ...rg,
        rows: repeatRows(
          rg.rows,
          defaultCellWidth,
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
    setComments(tableData.comments ?? '');
    setRowHeaderColumns(tableData.rowHeaderColumns ?? 1);
    setNoRepeatProcessing(tableData.noRepeatProcessing ?? false);
    setDecimalAlignPercent(tableData.decimalAlignPercent ?? initialDecimalAlignPercent);
  }, [
    externalLists,
    externalSingles,
    initialDecimalAlignPercent,
    noRepeatProcessing,
    processedDataRef,
    setTableData,
    tableData,
  ]);

  const unProcessRowGroup = useCallback(
    (processedGroup: AitRowGroupData | false): AitRowGroupData | false => {
      const ret =
        processedGroup === false
          ? false
          : {
              ...processedGroup,
              rows: processedGroup.rows
                .filter(
                  (r) => r.rowRepeat === undefined || r.rowRepeat.match(/^[[\]0,]+$/) !== null,
                )
                .map((r) => {
                  return {
                    ...r,
                    cells: r.cells.filter(
                      (_, ci) =>
                        columnRepeats === null ||
                        (columnRepeats !== null &&
                          columnRepeats[ci] !== undefined &&
                          (columnRepeats[ci].colRepeat ?? '0').match(/^[[\]0,]+$/)),
                    ),
                  };
                }),
            };
      return ret;
    },
    [columnRepeats],
  );

  // Unprocess data on the way back up
  const returnData = useCallback(
    (tableUpdate: {
      headerData?: AitRowGroupData | false;
      headerDataUnprocessed?: boolean;
      bodyData?: AitRowGroupData[];
      bodyDataUnprocessed?: boolean;
      comments?: string;
      rowHeaderColumns?: number;
      noRepeatProcessing?: boolean;
      decimalAlignPercent?: number;
    }) => {
      if (typeof setTableData !== 'function') return;
      // Unprocess header data
      const headerRet =
        !tableUpdate.headerDataUnprocessed && tableUpdate.headerData
          ? unProcessRowGroup(tableUpdate.headerData)
          : tableUpdate.headerData
          ? tableUpdate.headerData
          : headerData !== false && headerData !== undefined
          ? unProcessRowGroup(headerData)
          : headerData;
      // Unprocess body data
      const bodyRet =
        tableUpdate.bodyDataUnprocessed || !tableUpdate.bodyData
          ? tableUpdate.bodyData ?? bodyData?.map((rg) => unProcessRowGroup(rg))
          : tableUpdate.bodyData.map((rg) => unProcessRowGroup(rg));
      // Assenble return information
      const r = {
        headerData: headerRet,
        bodyData: bodyRet,
        comments: tableUpdate.comments ?? comments,
        rowHeaderColumns: tableUpdate.rowHeaderColumns ?? rowHeaderColumns,
        noRepeatProcessing: tableUpdate.noRepeatProcessing ?? noRepeatProcessing,
        decimalAlignPercent: tableUpdate.decimalAlignPercent ?? decimalAlignPercent,
      } as AitTableData;
      setTableData(r);
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
      let newBody: AitRowGroupData[] = bodyData.map(
        (rg) => unProcessRowGroup(rg) as AitRowGroupData,
      );
      newBody = newBody.map((rg) => {
        rg.rows = rg.rows.map((r) => {
          r.cells.splice(ci + 1, 0, newCell(defaultCellWidth));
          return r;
        });
        return rg;
      });
      // Update header group
      const newHeader = unProcessRowGroup(headerData);
      if (newHeader !== false && headerData !== false) {
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
            const n = newCell(defaultCellWidth);
            n.colSpan = 0;
            r.cells.splice(ci + 1, 0, n);
          } else {
            r.cells.splice(ci + 1, 0, newCell(defaultCellWidth));
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
    [bodyData, headerData, returnData, rowHeaderColumns, unProcessRowGroup],
  );

  // Remove column
  const remCol = useCallback(
    (ci: number) => {
      // Check ok to proceed
      if (rowHeaderColumns === undefined || headerData === undefined || bodyData === undefined)
        return;
      // Update body data
      let newBody: AitRowGroupData[] = bodyData.map(
        (rg) => unProcessRowGroup(rg) as AitRowGroupData,
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
      const newHeader = unProcessRowGroup(headerData);
      if (newHeader !== false && headerData !== false) {
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
    (ret: AitRowGroupData, rgi: number) => {
      const newBody: AitRowGroupData[] = [...(bodyData ?? [])];
      newBody[rgi] = ret;
      returnData({ bodyData: newBody });
    },
    [bodyData, returnData],
  );

  /**
   * Add a new row group to the table body
   */
  const addRowGroup = useCallback(
    (rgi: number, templateName?: string) => {
      // Check ok to proceed
      if (bodyData === undefined) return;
      // Create new body, take template if it can be found
      const ix =
        !templateName || !groupTemplates
          ? -1
          : groupTemplates.findIndex((g) => g.name === templateName);
      const newRowGroupTemplate: AitRowGroupData =
        ix > -1 && groupTemplates ? groupTemplates[ix] : { rows: [{ cells: [] }] };
      // Ensure new template meets requirements
      const newrg = newRowGroup(
        defaultCellWidth,
        bodyData[0].rows[0].cells.length,
        newRowGroupTemplate,
      );
      // Copy existing body and splice in new data
      const newBody: AitRowGroupData[] = [...(bodyData ?? [])];
      newBody.splice(rgi + 1, 0, newrg);
      // Update table body
      returnData({ bodyData: newBody });
    },
    [bodyData, groupTemplates, returnData],
  );

  // Remove a row group from the table body
  const removeRowGroup = useCallback(
    (rgi: number) => {
      // Check ok to proceed
      if (bodyData === undefined) return;
      // Update bodyData
      const newRowGroups: AitRowGroupData[] = [...bodyData];
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
    // Check bodyData for cells with rowSpan
    if (
      bodyData.some((rg) => rg.rows.some((r) => (r.cells[rowHeaderColumns - 1].rowSpan ?? 1) !== 1))
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
    const newHeader: AitRowGroupData = {
      ...headerData,
      rows: [newRow(bodyData[0].rows[0].cells.length, defaultCellWidth)],
    };
    returnData({ headerData: newHeader });
  }, [bodyData, headerData, returnData]);

  // Update columnWidth
  const setColWidth = useCallback(
    (colNo: number, colWidth: number) => {
      console.log(`ColWidth: colNo:${colNo}, newColWidth:${colWidth}`);
      const newHeaderData =
        headerData !== undefined && headerData !== false
          ? {
              ...headerData,
              rows: headerData.rows.map((r) => {
                return {
                  ...r,
                  cells: r.cells.map((c, ci) => {
                    return { ...c, colWidth: ci === colNo ? colWidth : c.colWidth };
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
                      return { ...c, colWidth: ci === colNo ? colWidth : c.colWidth };
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
    [bodyData, headerData, returnData],
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
        groupTemplateNames:
          groupTemplates === false
            ? ['None']
            : groupTemplates !== undefined
            ? (groupTemplates
                .filter((g) => g.name !== undefined)
                .map((g) => g.name)
                .sort((a, b) => (a ?? '').localeCompare(b ?? '')) as string[])
            : undefined,
        commentStyles: commentStyles,
        cellStyles: cellStyles,
        columnRepeats: columnRepeats,
        windowZIndex,
        setWindowZIndex,
        colWidthMod,
        decimalAlignPercent,
        defaultCellWidth,
      }}
    >
      <div
        className='ait-holder'
        style={style}
      >
        <div>
          <AioIconButton
            tipText='Table options'
            onClick={() => {
              setShowOptions(!showOptions);
            }}
            iconName={'aio-button-settings'}
          />
          {showOptions && (
            <AsupInternalWindow
              Title={'Table options'}
              Visible={showOptions}
              onClose={() => {
                setShowOptions(false);
              }}
            >
              <div className='aiw-body-row'>
                <AioComment
                  label={'Notes'}
                  value={comments ?? ''}
                  setValue={setComments}
                  commentStyles={commentStyles}
                />
              </div>
              {headerData !== false && headerData.rows.length === 0 ? (
                <div className='aiw-body-row'>
                  <div className={'aio-label'}>Add header section: </div>
                  <div
                    className={'aiox-button-holder'}
                    style={{ padding: '2px' }}
                  >
                    <div
                      className='aiox-button aiox-plus'
                      onClick={() => addNewHeader()}
                    />
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div className='aiw-body-row'>
                <AioBoolean
                  label='Suppress repeats'
                  value={noRepeatProcessing ?? false}
                  setValue={(ret) => {
                    returnData({ noRepeatProcessing: ret });
                  }}
                />
              </div>
              <div className='aiw-body-row'>
                <div className={'aio-label'}>Row headers: </div>
                <div className={'aio-ro-value'}>{rowHeaderColumns ?? 1}</div>
                <div
                  className={'aiox-button-holder'}
                  style={{ padding: '2px' }}
                >
                  {(rowHeaderColumns ?? 1) < bodyData[0].rows[0].cells.length - 1 ? (
                    <div
                      className='aiox-button aiox-plus'
                      onClick={() => addRowHeaderColumn()}
                    />
                  ) : (
                    <div className='aiox-button' />
                  )}
                  {(rowHeaderColumns ?? 1) > 0 ? (
                    <div
                      className='aiox-button aiox-minus'
                      onClick={() => removeRowHeaderColumn()}
                    />
                  ) : (
                    <div className='aiox-button' />
                  )}
                </div>
              </div>
              <div className='aiw-body-row'>
                <AioNumber
                  label='Decimal align percent'
                  value={decimalAlignPercent}
                  minValue={0}
                  maxValue={100}
                  setValue={(ret) => {
                    returnData({ decimalAlignPercent: ret });
                  }}
                />
              </div>
            </AsupInternalWindow>
          )}
        </div>
        <table className='ait-table'>
          <thead>
            <AitBorderRow
              spaceAfter={true}
              changeColumns={{
                addColumn: addCol,
                removeColumn: remCol,
                showButtons: true,
              }}
              rowHeaderColumns={rowHeaderColumns}
            />
            {headerData !== false && (
              <AitHeader
                aitid={headerData.aitid ?? 'header'}
                rows={headerData.rows}
                comments={headerData.comments}
                replacements={headerData.replacements}
                setHeaderData={(ret) => {
                  returnData({ headerData: ret });
                }}
                setColWidth={setColWidth}
              />
            )}
          </thead>

          <tbody>
            {bodyData.map((rowGroup: AitRowGroupData, rgi: number) => {
              return (
                <AitRowGroup
                  key={rowGroup.aitid ?? `row-group-${rgi}`}
                  aitid={rowGroup.aitid ?? `row-group-${rgi}`}
                  rows={rowGroup.rows}
                  comments={rowGroup.comments}
                  replacements={rowGroup.replacements ?? []}
                  spaceAfter={rowGroup.spaceAfter}
                  setRowGroupData={(ret) => {
                    updateRowGroup(ret, rgi);
                  }}
                  setColWidth={setColWidth}
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
            <AitBorderRow />
          </tbody>
        </table>
      </div>
    </TableSettingsContext.Provider>
  );
};
