export const splitIntoLines = <T>(text: T): T[] => {
  if (typeof text === "string") {
    return text.split("\n") as T[];
  } else {
    throw new Error("If text is not a string, a custom function is required");
  }
};

export const joinIntoBlock = <T>(lines: T[]): T => {
  if (lines.length === 0) return "" as T;
  else if (typeof lines[0] === "string") {
    return lines.join("\n") as T;
  } else throw new Error("If lines are not strings, a custom function is required");
};
