import { AsupInternalWindow } from "components/aiw/AsupInternalWindow";
import * as React from "react";
import { useState } from "react";
import { AioOptionGroup } from "./aioOptionGroup";
import { AioPrintItem } from "./aioPrintItem";
import { AioNewItem, OptionGroup, OptionType } from "./aioInterface";

interface AioArraySortableProps {
  inputArray: any[],
  updateArray?: (value: any) => void,
  newItem?: any,
  canRemoveItems?: boolean,
  canAddItems?: boolean,
  canMoveItems?: boolean,
};



export function AioArraySortable(props: AioArraySortableProps) {

  const [showWindows, setShowWindows] = useState<Array<boolean>>(new Array(props.inputArray.length + 1).fill(false));

  function addWindow(i: number): JSX.Element {
    return <AsupInternalWindow
      Title={"Add item"}
      Visible={showWindows[i]}
      onClose={() => {
        const newShowWindows = [...showWindows];
        newShowWindows[i] = false;
        setShowWindows(newShowWindows);
      }}
      style={{ minHeight: "100px" }}
    >
      <AioOptionGroup
        initialData={[
          {
            type: OptionType.select,
            optionName: AioNewItem.newType,
            value: "",
            label: "New type",
            availableValues: ["string", "number", "array", "object"]
          },
        ]}
        returnData={(ret) => {
          // Check value is ok
          let newItem;
          switch (ret[0].value) {
            case ("number"):
              newItem = 0;
              break;
            case ("array"):
              newItem = [];
              break;
            case ("object"):
              newItem = {};
              break;
            case ("string"):
            default:
              newItem = "";
          }
          let newArray = [...props.inputArray];
          newArray.splice(i, 0, newItem);
          if (props.updateArray)
            props.updateArray(newArray);
          const newShowWindows = [...showWindows];
          newShowWindows[i] = false;
          setShowWindows(newShowWindows);
        }}
        buttonText="Add" />
    </AsupInternalWindow>;
  }

  return (
    <>
      {
        props.inputArray.map((value: any, i: number) => {
          const id = value ?? i;
          return (
            <div className="aio-body-row" key={i}>
              <AioPrintItem
                id={id}
                value={value}
                setValue={
                  (props.updateArray) ? (ret) => {
                    const newArray = [...Object.values(props.inputArray)];
                    newArray[i] = ret;
                    if (props.updateArray) props.updateArray(newArray);
                  } : undefined
                }
                moveUp={
                  (props.canMoveItems && props.updateArray && i > 0) ? () => {
                    const mover = props.inputArray[i];
                    const newArray = [...(props.inputArray)];
                    newArray.splice(i, 1);
                    newArray.splice(i - 1, 0, mover);
                    if (props.updateArray) props.updateArray(newArray);
                  } : undefined
                }
                moveDown={
                  (props.canMoveItems && props.updateArray && i < props.inputArray.length - 1) ? () => {
                    const mover = props.inputArray[i];
                    const newArray = [...(props.inputArray)];
                    newArray.splice(i, 1);
                    newArray.splice(i + 1, 0, mover);
                    if (props.updateArray) props.updateArray(newArray);
                  } : undefined
                }
                addItem={
                  (props.canAddItems && props.updateArray)
                    ?
                    () => {
                      const newShowWindows = [...showWindows];
                      newShowWindows[i] = true;
                      setShowWindows(newShowWindows);
                    }
                    :
                    undefined
                }
                removeItem={
                  (props.updateArray && props.canRemoveItems)
                    ?
                    () => {
                      const newArray = [...props.inputArray];
                      newArray.splice(i, 1);
                      if (props.updateArray) props.updateArray(newArray);
                    }
                    :
                    undefined
                }
                canAddItems={props.canAddItems}
                canMoveItems={props.canMoveItems}
                canRemoveItems={props.canRemoveItems}
              >
                {props.canAddItems ? addWindow(i) : <></>}
              </AioPrintItem>
            </div>
          );
        })
      }
      {props.canAddItems &&
        <div className="aio-body-row" key={props.inputArray.length}>
          <div className="aio-input-holder" />
          <div className="aiox-button-holder">
            {props.canMoveItems && <div className="aiox-button" style={{ margin: 0 }} />}
            <div className="aiox-button aiox-plus" onClick={() => {
              const newShowWindows = [...showWindows];
              newShowWindows[props.inputArray.length] = true;
              setShowWindows(newShowWindows);
            }}>
              {addWindow(props.inputArray.length)}
            </div>
          </div>
        </div>
      }
    </>
  );
}