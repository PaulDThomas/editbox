import { fromHtml } from "../../functions/tofromHtml";

export const getRawTextParts = (s: string): string[] => {
  // Do standard replace if not aie-text or no inline styles
  if (!s.match(/^<div classname=["']aie-text/i) || !s.includes("data-inline-style-ranges")) {
    return [fromHtml(s)];
  } else {
    // Create element to manipulate
    const ret: string[] = [];
    const htmlIn: HTMLTemplateElement = document.createElement("template");
    htmlIn.innerHTML = s.trim();
    // Cycle through elements
    htmlIn.content.childNodes.forEach((el) => {
      if (el.textContent !== null) ret.push(el.textContent);
    });
    return ret;
  }
};
