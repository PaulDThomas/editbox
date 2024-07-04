export interface AibBlockLine<T> {
  aifid: string; // Unique ID
  lineType: AibLineType; // Type of line
  left: T | null; // Left aligned text in the row
  center: T | null; // Center aligned text in the row
  right: T | null; // Right aligned text in the row
  addBelow: boolean; // If the user can add a line below
  canEdit: boolean; // If the user can edit the line
  canRemove: boolean; // If the user can remove the line
  canMove: boolean; // If the user can move the line in an array of lines
  canChangeType: boolean; // Can update the type of line
}

export enum AibLineType {
  leftOnly = "Left only",
  centerOnly = "Center only",
  leftAndRight = "Left and Right",
  leftCenterAndRight = "Left, Center and Right",
}
