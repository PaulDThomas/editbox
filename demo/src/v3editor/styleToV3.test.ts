import { AieStyleMap } from "../../../src/components/interface";
import { styleToV3 } from "./styleToV3";

describe("styleToV3", () => {
  test("Should convert AieStyleMap to EditorV3Styles", async () => {
    const style: AieStyleMap = {
      bold: {
        css: {
          fontWeight: "bold",
        },
        aieExclude: ["italic", "underline"],
      },
      italic: {
        css: {
          fontStyle: "italic",
        },
        aieExclude: ["bold", "underline"],
      },
      underline: {
        css: {
          textDecoration: "underline",
        },
        aieExclude: ["bold", "italic"],
      },
    };

    const result = styleToV3(style);

    expect(result).toEqual({
      bold: {
        fontWeight: "bold",
      },
      italic: {
        fontStyle: "italic",
      },
      underline: {
        textDecoration: "underline",
      },
    });
  });

  test("Should handle empty AieStyleMap", async () => {
    const style: AieStyleMap = {};

    const result = styleToV3(style);

    expect(result).toEqual({});
  });
});
