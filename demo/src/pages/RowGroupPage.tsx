import React, { useCallback, useRef, useState } from "react";
import {
  AioString,
  AitRowGroupData,
  AitTableData,
  AsupInternalTable,
  newRowGroup,
} from "../../../src/components";

export const RowGroupPage = (): JSX.Element => {
  const ta = useRef<HTMLTextAreaElement | null>(null);
  const [rowGroups, setRowGroups] = useState<AitRowGroupData[]>([]);
  const [tableData, setTableData] = useState<AitTableData | null>(null);
  const [currentName, setCurrentName] = useState<string>("");

  const loadData = useCallback(() => {
    try {
      if (ta.current && ta.current.value === "") {
        ta.current.value = window.localStorage.getItem("rowGroupContent") ?? "";
      }
      if (ta.current) {
        const j: AitRowGroupData[] = JSON.parse(ta.current.value?.toString() ?? "[]");
        setRowGroups(j);
        ta.current.value = JSON.stringify(j, null, 2);
      }
    } catch (e) {
      console.warn("JSON parse failed");
      console.dir(e);
    }
  }, []);

  const rg2Table = useCallback(
    (rg?: AitRowGroupData) => {
      if (rg === undefined) setTableData(null);
      else if (tableData === null) {
        setTableData({ headerData: false, bodyData: [rg] });
      } else {
        setTableData({ ...tableData, bodyData: [rg] });
      }
    },
    [tableData],
  );

  const rgFromTableData = useCallback(
    (ret: AitTableData): AitRowGroupData => {
      if (ret === null || ret.bodyData === undefined || ret.bodyData.length < 1) {
        return {
          ...newRowGroup(50),
          name: currentName,
        };
      }
      return {
        ...ret.bodyData[0],
        name: currentName,
      };
    },
    [currentName],
  );

  return (
    <>
      <div
        style={{
          width: "100%",
          margin: "1.5rem",
          display: "flex",
        }}
      >
        <div style={{ width: "30%" }}>
          <h4>Available row groups</h4>
          <div>
            {rowGroups
              .filter((rg) => rg.name !== "Empty section")
              .map((rg, rgi) => (
                <div key={`${rgi}-${rg.name}`}>
                  <span
                    onFocus={() => {
                      rg2Table(rowGroups.find((rgi) => rgi.name === rg.name));
                      setCurrentName(rg.name ?? "");
                    }}
                  >
                    <AioString
                      id="test-string"
                      value={rg.name}
                      setValue={(ret) => {
                        setCurrentName(ret);
                        const ix = rowGroups.findIndex((rgi) => rgi.name === rg.name);
                        if (ix > -1) {
                          const newRg: AitRowGroupData = { ...rowGroups[ix] };
                          const newRgs = [...rowGroups];
                          newRgs.splice(ix, 1, newRg);
                          setRowGroups(newRgs);
                        }
                      }}
                    />
                  </span>
                  <div
                    className="aiox-button aiox-minus"
                    onClick={() => {
                      const newRgs = [...rowGroups];
                      newRgs.splice(
                        newRgs.findIndex((rgi) => rgi.name === rg.name),
                        1,
                      );
                      setRowGroups(newRgs);
                      setTableData(null);
                    }}
                  />
                  {tableData && currentName === rg.name && (
                    <div
                      style={{
                        display: "inline-block",
                        marginLeft: "0.5rem",
                        height: "1rem",
                        width: "1rem",
                        backgroundColor: "green",
                      }}
                    />
                  )}
                </div>
              ))}
          </div>
          {/* Add list button */}
          <div
            className="aiox-button aiox-plus"
            onClick={() => {
              const newRgs = [...rowGroups];
              const newRg = { ...newRowGroup(50), name: `Group ${newRgs.length}` };
              newRgs.push(newRg);
              setRowGroups(newRgs);
              setCurrentName(newRg.name);
            }}
          />
        </div>
        <div style={{ width: "70%" }}>
          <h4>Row group</h4>
          <div>
            {tableData && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <AsupInternalTable
                  id="test-table"
                  groupTemplates={false}
                  tableData={tableData}
                  setTableData={(ret) => {
                    setTableData(ret);
                    const newRg = rgFromTableData(ret);
                    const newRgs = [...rowGroups];
                    newRgs.splice(
                      newRgs.findIndex((rgi) => rgi.name === currentName),
                      1,
                      newRg,
                    );
                    setRowGroups(newRgs);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          margin: "1rem",
          padding: "1rem",
          border: "solid black 3px",
          backgroundColor: "rgb(220, 220, 220)",
          borderRadius: "8px",
        }}
      >
        <button onClick={loadData}>Load</button>
        <button
          onClick={() => {
            if (!ta.current) return;
            // Show intended data
            ta.current.value = JSON.stringify(rowGroups, null, 2);
            // Save string
            window.localStorage.setItem("rowGroupContent", JSON.stringify(rowGroups));
          }}
        >
          Save
        </button>
        <span style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>(browser storage)</span>
        <button
          onClick={() => {
            /** Load row group templates */
            fetch("public/groupTemplates.json", {
              headers: { "Content-Type": "application/json", Accept: "application/json" },
            })
              .then(function (response) {
                return response.json();
              })
              .then(function (MyJson: AitRowGroupData[]) {
                setRowGroups(MyJson);
              });
          }}
        >
          Defaults
        </button>

        <pre>
          <textarea
            style={{ width: "98%", height: "200px" }}
            ref={ta}
          />
        </pre>
      </div>
    </>
  );
};
