import { AibBlockLine, AibLineType } from "./interface";

export interface OldBlockLine {
  aifid?: string; // Unique ID
  left?: string | false; // Left aligned text in the row
  centre?: string | false; // Centre aligned text in the row
  right?: string | false; // Right aligned text in the row
  addBelow?: boolean; // If the user can add a line below
  canEdit?: boolean; // If the user can edit the line
  canRemove?: boolean; // If the user can remove the line
  canMove?: boolean; // If the user can move the line in an array of lines
}

export const updateLineDisplayVersion = (
  inArray: OldBlockLine[] | AibBlockLine<string>[],
): AibBlockLine<string>[] => {
  return inArray.map((inData) => {
    // Check options for new center
    let newCenter: string | null = null;
    if (typeof (inData as OldBlockLine).centre === "string") {
      newCenter = (inData as OldBlockLine).centre as string;
    } else if (typeof (inData as AibBlockLine<string>).center === "string") {
      newCenter = (inData as AibBlockLine<string>).center as string;
    }
    // Ensure at least one is present
    if (!inData.left && inData.left !== "" && !newCenter && !inData.right && inData.right !== "") {
      newCenter = "";
    }

    return {
      aifid: inData.aifid,
      lineType:
        typeof inData.right === "string" && newCenter !== null
          ? AibLineType.leftCenterAndRight
          : typeof inData.right === "string"
            ? AibLineType.leftAndRight
            : newCenter !== null
              ? AibLineType.centerOnly
              : AibLineType.leftOnly,
      left: inData.left === false ? null : inData.left ?? null,
      center: newCenter,
      right: inData.right === false ? null : inData.right ?? null,
      addBelow: inData.addBelow,
      canEdit: inData.canEdit,
      canRemove: inData.canRemove,
      canMove: inData.canMove,
    };
  });
};
