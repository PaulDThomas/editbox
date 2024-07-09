import { AioExternalSingle, AioReplacement } from "components/aio";
import { AitHeaderRowData } from "components/table/interface";
import { newHeaderRow } from "./newRow";
import { repeatHeaders } from "./repeatHeaders";

jest.mock("./newRow");

describe("Check repeatHeaders", () => {
  const rows: AitHeaderRowData<string>[] = [newHeaderRow(60, "", 3)];
  for (let i = 0; i++; i < 3) {
    rows[0].cells[i].text = `Cell ${i}`;
  }

  test("Basic checks", () => {
    const postProcess = repeatHeaders(
      rows,
      [],
      60,
      (s: string) => [s],
      (s: string, o: string, n: string) => s.replace(o, n),
      "",
      true,
      0,
      [],
      [],
    );
    expect(postProcess.rows).toEqual(rows);
    expect(postProcess.columnRepeats).toEqual([
      { columnIndex: 0 },
      { columnIndex: 1 },
      { columnIndex: 2 },
    ]);
  });

  const rowsC1: AitHeaderRowData<string>[] = [
    {
      cells: [
        { text: "r1c1", comments: "", rowSpan: 3 },
        { text: "r1c2", comments: "", colSpan: 4 },
        { text: "r1c3", comments: "", colSpan: 0 },
        { text: "r1c4", comments: "", colSpan: 0 },
        { text: "r1c5", comments: "", colSpan: 0 },
        { text: "r1c6", comments: "", colSpan: 4 },
        { text: "r1c7", comments: "", colSpan: 0 },
        { text: "r1c8", comments: "", colSpan: 0 },
        { text: "r1c9", comments: "", colSpan: 0 },
      ],
    },
    {
      cells: [
        { text: "r2c1", comments: "", rowSpan: 0 },
        { text: "r2c2", comments: "", rowSpan: 2 },
        { text: "r2c3", comments: "", colSpan: 2 },
        { text: "r2c4", comments: "", colSpan: 0 },
        { text: "r2c5", comments: "" },
        { text: "r2c6", comments: "", rowSpan: 2 },
        { text: "r2c7", comments: "", rowSpan: 2 },
        { text: "r2c8", comments: "", rowSpan: 2 },
        { text: "r2c9", comments: "", rowSpan: 2 },
      ],
    },
    {
      cells: [
        { text: "r3c1", comments: "", rowSpan: 0 },
        { text: "r3c2", comments: "", rowSpan: 0 },
        { text: "r3c3", comments: "" },
        { text: "r3c4", comments: "" },
        { text: "r3c5", comments: "" },
        { text: "r3c6", comments: "", rowSpan: 0 },
        { text: "r3c7", comments: "", rowSpan: 0 },
        { text: "r3c8", comments: "", rowSpan: 0 },
        { text: "r3c9", comments: "", rowSpan: 0 },
      ],
    },
  ];

  const replacements: AioReplacement<string>[] = [
    {
      oldText: "r1c2",
      newTexts: [
        {
          texts: ["r1c2-rep1", "r1c2-rep2"],
          subLists: [
            {
              oldText: "r3c5",
              newTexts: [
                {
                  texts: ["r3c5-rep1", "r3c5-rep2"],
                  subLists: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const singleReplacements: AioExternalSingle<string> = {
    airid: "repl",
    oldText: "r2c9",
    newText: "r2c9-single",
  };

  const fillerCell = {
    colSpan: 0,
    colWidth: 60,
    repeatColSpan: 0,
    rowSpan: 1,
    text: "",
    comments: "",
  };

  test("Complex header 1", () => {
    const postProcess = repeatHeaders(
      rowsC1,
      replacements,
      60,
      (s: string) => [s],
      (s: string, o: string, n: string) => s.replace(o, n),
      "",
      false,
      1,
      [],
      [singleReplacements],
    );
    expect(postProcess.columnRepeats).toEqual([
      { columnIndex: 0 },
      { columnIndex: 1, colRepeat: "[0,0]" },
      { columnIndex: 2, colRepeat: "[0,0]" },
      { columnIndex: 3, colRepeat: "[0,0]" },
      { columnIndex: 4, colRepeat: "[0,0][0,0]" },
      { columnIndex: 4, colRepeat: "[0,0][0,1]" },
      { columnIndex: 1, colRepeat: "[0,1]" },
      { columnIndex: 2, colRepeat: "[0,1]" },
      { columnIndex: 3, colRepeat: "[0,1]" },
      { columnIndex: 4, colRepeat: "[0,1][0,0]" },
      { columnIndex: 4, colRepeat: "[0,1][0,1]" },
      { columnIndex: 5 },
      { columnIndex: 6 },
      { columnIndex: 7 },
      { columnIndex: 8 },
    ]);
    expect(
      postProcess.rows.map((r) => ({
        ...r,
        cells: r.cells.map((c) => {
          const cx = { ...c };
          delete cx.aitid;
          return cx;
        }),
      })),
    ).toEqual([
      {
        cells: [
          { text: "r1c1", comments: "", rowSpan: 3 },
          { text: "r1c2", comments: "", colSpan: 4, replacedText: "r1c2-rep1", repeatColSpan: 5 },
          { text: "r1c3", comments: "", colSpan: 0 },
          { text: "r1c4", comments: "", colSpan: 0 },
          { text: "r1c5", comments: "", colSpan: 0 },
          fillerCell,
          { text: "r1c2", comments: "", colSpan: 4, replacedText: "r1c2-rep2", repeatColSpan: 5 },
          { text: "r1c3", comments: "", colSpan: 0 },
          { text: "r1c4", comments: "", colSpan: 0 },
          { text: "r1c5", comments: "", colSpan: 0 },
          fillerCell,
          { text: "r1c6", comments: "", colSpan: 4 },
          { text: "r1c7", comments: "", colSpan: 0 },
          { text: "r1c8", comments: "", colSpan: 0 },
          { text: "r1c9", comments: "", colSpan: 0 },
        ],
      },
      {
        cells: [
          { text: "r2c1", comments: "", rowSpan: 0 },
          { text: "r2c2", comments: "", rowSpan: 2 },
          { text: "r2c3", comments: "", colSpan: 2 },
          { text: "r2c4", comments: "", colSpan: 0 },
          { text: "r2c5", comments: "", colSpan: 1, repeatColSpan: 2 },
          fillerCell,
          { text: "r2c2", comments: "", rowSpan: 2 },
          { text: "r2c3", comments: "", colSpan: 2 },
          { text: "r2c4", comments: "", colSpan: 0 },
          { text: "r2c5", comments: "", colSpan: 1, repeatColSpan: 2 },
          fillerCell,
          { text: "r2c6", comments: "", rowSpan: 2 },
          { text: "r2c7", comments: "", rowSpan: 2 },
          { text: "r2c8", comments: "", rowSpan: 2 },
          { text: "r2c9", comments: "", rowSpan: 2, replacedText: "r2c9-single" },
        ],
      },
      {
        cells: [
          { text: "r3c1", comments: "", rowSpan: 0 },
          { text: "r3c2", comments: "", rowSpan: 0 },
          { text: "r3c3", comments: "" },
          { text: "r3c4", comments: "" },
          { text: "r3c5", comments: "", colSpan: 1, replacedText: "r3c5-rep1" },
          { text: "r3c5", comments: "", colSpan: 1, replacedText: "r3c5-rep2" },
          { text: "r3c2", comments: "", rowSpan: 0 },
          { text: "r3c3", comments: "" },
          { text: "r3c4", comments: "" },
          { text: "r3c5", comments: "", colSpan: 1, replacedText: "r3c5-rep1" },
          { text: "r3c5", comments: "", colSpan: 1, replacedText: "r3c5-rep2" },
          { text: "r3c6", comments: "", rowSpan: 0 },
          { text: "r3c7", comments: "", rowSpan: 0 },
          { text: "r3c8", comments: "", rowSpan: 0 },
          { text: "r3c9", comments: "", rowSpan: 0 },
        ],
      },
    ]);
  });
});
