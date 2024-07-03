import { newBlockLine } from "./newBlockLine";
import { AibLineType } from "./interface";

describe("newBlockLine", () => {
  test("should create a leftOnly line", () => {
    const lineType = AibLineType.leftOnly;
    const blankT = "";

    const result = newBlockLine(lineType, blankT);

    expect(result.aifid).toBeDefined();
    expect(result.lineType).toBe(lineType);
    expect(result.left).toBe(blankT);
    expect(result.center).toBeNull();
    expect(result.right).toBeNull();
    expect(result.canEdit).toBe(true);
    expect(result.canMove).toBe(true);
    expect(result.canRemove).toBe(true);
    expect(result.canChangeType).toBe(true);
  });

  test("should create a leftAndRight line", () => {
    const lineType = AibLineType.leftAndRight;
    const blankT = "";

    const result = newBlockLine(lineType, blankT);

    expect(result.aifid).toBeDefined();
    expect(result.lineType).toBe(lineType);
    expect(result.left).toBe(blankT);
    expect(result.center).toBeNull();
    expect(result.right).toBe(blankT);
  });

  test("should create a leftCenterAndRight line", () => {
    const lineType = AibLineType.leftCenterAndRight;
    const blankT = "";

    const result = newBlockLine(lineType, blankT);

    expect(result.aifid).toBeDefined();
    expect(result.lineType).toBe(lineType);
    expect(result.left).toBe(blankT);
    expect(result.center).toBe(blankT);
    expect(result.right).toBe(blankT);
  });

  test("should create a centerOnly line", () => {
    const lineType = AibLineType.centerOnly;
    const blankT = "";

    const result = newBlockLine(lineType, blankT);

    expect(result.aifid).toBeDefined();
    expect(result.lineType).toBe(lineType);
    expect(result.left).toBeNull();
    expect(result.center).toBe(blankT);
    expect(result.right).toBeNull();
  });
});
