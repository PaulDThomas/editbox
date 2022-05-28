import { AioExternalSingle } from 'components/aio';
import React, { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";
import { AieStyleMap } from '../aie';
import "./aif.css";
import { AifBlockLine, AifLineType } from './aifInterface';
import { AifLineDisplay } from './aifLineDisplay';
import { replaceBlockText } from './replaceBlockText';

interface AsupInternalBlockProps {
  lines: AifBlockLine[]
  setLines?: (ret: AifBlockLine[]) => void
  minLines?: number,
  maxLines?: number,
  externalSingles?: AioExternalSingle[],
  styleMap?: AieStyleMap,
  defaultType?: AifLineType,
  style?: React.CSSProperties,
}
export const AsupInternalBlock = ({
  lines,
  setLines,
  minLines,
  maxLines,
  externalSingles,
  styleMap,
  defaultType,
  style,
}: AsupInternalBlockProps): JSX.Element => {

  /** Check lines object min/max rule */
  useEffect(() => {
    if (typeof setLines !== "function") return;
    let newLines = [...lines];
    if (newLines.length < Math.min(minLines ?? 1, maxLines ?? 1)) {
      let reqlines = (minLines ?? 1) - lines.length;
      for (let i = 0; i < reqlines; i++) {
        let newLine: AifBlockLine = {
          aifid: uuidv4(),
          left: "",
          centre: "",
          right: "",
          canEdit: true,
          canMove: true,
          canRemove: true,
        };
        newLines.push(newLine);
      }
    }
    else if (newLines.length > Math.max(minLines ?? 10, maxLines ?? 10)) {
      newLines = newLines.slice(0, maxLines ?? 10);
    }
    setLines(newLines.map((l, li) => {
      if (l.aifid === undefined) l.aifid = uuidv4();
      return l;
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minLines, maxLines])

  // General function to return complied object
  const returnData = useCallback((linesUpdate: { lines: AifBlockLine[] }) => {
    if (typeof setLines !== "function") return;
    let r: AifBlockLine[] = [...linesUpdate.lines];
    setLines!(r);
  }, [setLines]);

  // Update row
  const updateLine = useCallback((ret: AifBlockLine, li: number) => {
    // Do nothing if readonly
    if (typeof (setLines) !== "function") return;

    // Create new object to send back
    let newLines = [...lines];
    newLines[li] = ret;
    returnData({ lines: newLines });
  }, [setLines, lines, returnData]);

  const addLine = useCallback((li: number) => {
    let newLines = [...lines];
    let newLine: AifBlockLine = {
      aifid: uuidv4(),
      left: "",
      centre: "",
      right: "",
      canEdit: true,
      canMove: true,
      canRemove: true,
    };
    if (defaultType !== undefined) {
      switch (defaultType) {
        case AifLineType.leftOnly:
          newLine.right = false;
          newLine.centre = false;
          break;
        case AifLineType.leftAndRight:
          newLine.centre = false;
          break;
        case AifLineType.centreOnly:
          newLine.left = false;
          newLine.right = false;
          break;
        case AifLineType.leftCentreAndRight:
        default:
          break;
      }
    }
    newLines.splice(li + 1, 0, newLine);
    returnData({ lines: newLines });
  }, [defaultType, lines, returnData])

  const removeLine = useCallback((li: number) => {
    let newLines = [...lines];
    newLines.splice(li, 1);
    returnData({ lines: newLines });
  }, [lines, returnData])

  return (
    <div className="aif-block" style={{ ...style }}>
      {lines.map((l: AifBlockLine, li: number) => {
        // Check for replacements 
        let editable: boolean = true;
        let left = l.left;
        let centre = l.centre;
        let right = l.right;
        if (externalSingles !== undefined && externalSingles.length > 0) {
          externalSingles.forEach(repl => {
            if (repl.oldText !== undefined && repl.oldText !== "" && repl.newText !== undefined) {
              let { newText: newLeft, updated: leftChange } = replaceBlockText(left, repl)
              let { newText: newCentre, updated: centreChange } = replaceBlockText(centre, repl);
              let { newText: newRight, updated: rightChange } = replaceBlockText(right, repl);
              editable = !(leftChange || centreChange || rightChange);
              if (leftChange) left = newLeft;
              if (centreChange) centre = newCentre;
              if (rightChange) right = newRight;
            }
          })
        }
        return (
          <AifLineDisplay
            key={l.aifid ?? li}
            aifid={l.aifid}
            left={left}
            centre={centre}
            right={right}
            addBelow={l.addBelow}
            canEdit={l.canEdit && editable}
            canMove={l.canMove}
            canRemove={l.canRemove}
            setLine={l.canEdit !== false && editable ? (ret) => updateLine(ret, li) : undefined}
            addLine={(l.addBelow !== false && lines.length < (maxLines ?? 10)) ? () => addLine(li) : undefined}
            removeLine={(lines.length > (minLines ?? 1) && l.canEdit !== false && l.canRemove !== false) ? () => removeLine(li) : undefined}
            styleMap={styleMap}
          />
        );
      })}
    </div>
  );
}
