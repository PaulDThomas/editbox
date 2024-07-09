import { AitRowData } from "../table/interface";

/**
 * Print row data as a character print with new lines, tabs
 * @param rs
 * @returns Table string
 */
export const printRows = (rs: AitRowData<string>[]): string => {
  return (
    "\t" +
    rs
      .map((r) =>
        r.cells
          .map((c) =>
            c !== undefined
              ? `${c.text} ${c.replacedText ? " => " + c.replacedText : ""}`
              : "!!UNDEF!!",
          )
          .join("\u2506"),
      )
      .join("\n\t")
  );
};
