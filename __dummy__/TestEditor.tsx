import { useEffect, useState } from "react";
import { AsupInternalEditorProps, EditorProps } from "../src/main";

export const TestEditor = <T,>(props: AsupInternalEditorProps<T>) => {
  const [text, setText] = useState<string>();
  useEffect(() => {
    if (typeof props.value === "string") setText(props.value);
  }, [props.value]);

  if (typeof props.value !== "string")
    throw new Error("If newText is not a string, a custom function is required");

  return (
    <input
      id={props.id}
      className={"aio-input"}
      disabled={!props.setValue}
      value={text ?? ""}
      onChange={(e) => setText(e.currentTarget.value)}
      onBlur={() => props.setValue && props.setValue(text as T)}
    />
  );
};

export const replaceTextInTestEditor = (text: string, oldPhrase: string, newPhrase: string) => {
  return text.replaceAll(oldPhrase, newPhrase);
};

export const testEditorProps: EditorProps<string> = {
  Editor: TestEditor,
  getTextFromT: (text: string) => [text],
  replaceTextInT: replaceTextInTestEditor,
  blankT: "",
  joinTintoBlock: (lines: string[]) => lines.join("\n"),
  splitTintoLines: (text: string) => text.split("\n"),
};
