import { AioExternalSingle } from "components/aio";
import { AitRowData } from "../table";
import { newRow } from "./newRow";
import { singleReplacements } from "./singleReplacements";

jest.mock("./newRow");

describe("Check single replacements", () => {
  const srep: AioExternalSingle<string> = {
    airid: "repl",
    oldText: "Old",
    newText: "New",
  };

  const row: AitRowData<string> = newRow(60, "", 1);
  row.cells[0].text = "Old";

  test("Basic checks", async () => {
    expect(
      singleReplacements(
        undefined,
        [row],
        (s: string, o: string, n: string) => s.replace(o, n),
        "",
      ),
    ).toEqual([row]);

    const result = singleReplacements(
      [srep],
      [row],
      (s: string, o: string, n: string) => s.replace(o, n),
      "",
    );

    expect(result[0].cells[0].replacedText).toEqual("New");
  });
});
