import React from "react";

export function drawInnerHtml(
  divRef: React.MutableRefObject<HTMLDivElement | null>,
  setCurrentText: React.Dispatch<React.SetStateAction<string>>,
  getCaretPosition: (element: HTMLDivElement) => { start: number; end: number },
  textAlignment: string,
  decimalAlignPercent: number,
  initialText?: string,
  e?: React.KeyboardEvent<HTMLDivElement>,
  range?: Range,
) {
  if (!divRef.current) return;
  // Decode any HTML here too... we are going to set textContent so this is safe
  let fullText = (initialText !== undefined ? initialText : divRef.current.textContent ?? "")
    .replace(/[\u202F|\u00A0]/g, " ")
    .trim();
  setCurrentText(fullText);
  // Get cursor position
  const caretPosn = getCaretPosition(divRef.current);
  let decimal = fullText.match(/\./)?.index;
  // Modification because of the key pressed
  if (e !== undefined) {
    if (e.key === "ArrowRight") caretPosn.end++;
    else if (e.key === "Home") caretPosn.end = 0;
    else if (e.key === "End") caretPosn.end = fullText.length;
    else if (e.key === "Delete" && caretPosn.end === decimal) {
      decimal = undefined;
      fullText = fullText.replace(/\./, "");
    }
    // The non-space has been deleted
    else if (e !== undefined && e.key === "Delete" && fullText?.match(/[\u200B]/) === null) {
      fullText = fullText.substring(0, caretPosn.end) + fullText.substring(caretPosn.end + 1);
    }
    // The non-space has been deleted
    else if (e.key === "Backspace" && fullText?.match(/[\u200B]/) === null) {
      fullText = fullText.substring(0, caretPosn.end - 2) + fullText.substring(caretPosn.end);
    }
  }

  // Set up new fragment
  const emptyNode = document.createTextNode("\u200B");
  const fragment = new DocumentFragment();

  // Get all boundaries in fullText
  const boundaries: { type: string; start: number; end?: number; span?: HTMLSpanElement | Node }[] =
    [
      { type: "start", start: 0, end: caretPosn.end },
      { type: "caret", start: caretPosn.end, end: caretPosn.end },
      { type: "afterCaret", start: caretPosn.end, end: fullText.length },
    ];
  if (decimal !== null && decimal !== undefined && textAlignment === "decimal")
    boundaries.push({ type: "decimal", start: decimal });
  // Fix ends for any inserted boundaries
  const fixedBoundaries = boundaries
    .sort((a, b) => a.start - b.start)
    .map((b, i, all) => {
      const newB = { ...b };
      if (i === all.length - 1) newB.end = fullText.length;
      else newB.end = all[i + 1].start;
      return newB;
    });

  // Split fulltext into spans at boundaries
  fixedBoundaries.forEach((b) => {
    // Add cursor if position is reached
    if (b.type === "caret") {
      b.span = emptyNode;
    } else if (b.end && b.end > b.start) {
      b.span = document.createElement("span");
      b.span.textContent = fullText
        .substring(b.start, b.end)
        .replace(/[\u200B-\u200F\uFEFF]/g, "") // Remove bad characters
        .replace(/[ ]/g, "\u00A0"); // Change space to nbsp
    }
  });

  // Create preceeding text if decimal aligned
  if (textAlignment === "decimal") {
    const line = document.createElement("div");
    line.className = "aiev2-decimal-line";
    fragment.append(line);

    // Set up space before decimal
    const prePoint = document.createElement("span");
    prePoint.className = "aiev2-span aiev2-span-point";
    prePoint.style.textAlign = "right";
    prePoint.style.right = `${100 - (decimalAlignPercent ?? 60)}%`;
    line.append(prePoint);

    // Set up space after (and including) decimal
    const postPoint = document.createElement("span");
    postPoint.className = "aiev2-span aiev2-span-point";
    postPoint.style.textAlign = "left";
    postPoint.style.left = `${decimalAlignPercent ?? 60}%`;
    line.append(postPoint);

    // Add spans with text if there is no decimal
    if (decimal === null || decimal === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prePoint.append(...fixedBoundaries.filter((b) => b.span !== undefined).map((b) => b.span!));
    } else {
      const cut = fixedBoundaries.findIndex((b) => b.type === "decimal");
      prePoint.append(
        ...fixedBoundaries
          .slice(0, cut)
          .filter((b) => b.span !== undefined)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((b) => b.span!),
      );
      postPoint.append(
        ...fixedBoundaries
          .slice(cut)
          .filter((b) => b.span !== undefined)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((b) => b.span!),
      );
    }
  } else {
    // Create single span with text
    const innerSpan = document.createElement("span");
    innerSpan.className = "aiev2-span";
    innerSpan.style.textAlign = textAlignment ?? "left";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    innerSpan.append(...fixedBoundaries.filter((b) => b.span !== undefined).map((b) => b.span!));
    fragment.append(innerSpan);
  }

  divRef.current.innerHTML = "";
  divRef.current.appendChild(fragment);

  // Update height after being added to divRef for decimal lines
  (
    Array.from(divRef.current.getElementsByClassName("aiev2-decimal-line")) as HTMLDivElement[]
  ).forEach((el) => {
    el.style.height = `${Math.max(
      ...(Array.from(el.getElementsByClassName("aiev2-span")) as HTMLSpanElement[]).map(
        (el) => el.clientHeight,
      ),
    )}px`;
  });

  // Update cursor position and live happily ever after
  if (range !== undefined) {
    range.setEnd(emptyNode, 0);
    range.collapse();
  }
  if (e !== undefined) {
    e.stopPropagation();
    e.preventDefault();
  }
}
