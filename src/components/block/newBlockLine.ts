import { AibBlockLine, AibLineType } from "./interface";

export const newBlockLine = <T extends string | object>(
  lineType: AibLineType,
  blankT: T,
): AibBlockLine<T> => {
  const ret: AibBlockLine<T> = {
    aifid: crypto.randomUUID(),
    lineType,
    left: [AibLineType.leftOnly, AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(
      lineType,
    )
      ? blankT
      : null,
    center: [AibLineType.centerOnly, AibLineType.leftCenterAndRight].includes(lineType)
      ? blankT
      : null,
    right: [AibLineType.leftAndRight, AibLineType.leftCenterAndRight].includes(lineType)
      ? blankT
      : null,
    canEdit: true,
    canMove: true,
    canRemove: true,
    canChangeType: true,
  };
  return ret;
};
