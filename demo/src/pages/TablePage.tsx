import { AioSingleReplacements } from "components/aio/AioSingleReplacements";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AieStyleMap,
  AioExternalReplacements,
  AioExternalSingle,
  AitRowGroupData,
  AitTableData,
  AsupInternalTable,
  updateTableDataVersion,
} from "../../../src/components";

export const TablePage = () => {
  const ta = useRef<HTMLTextAreaElement | null>(null);
  const [tableData, setTableData] = useState<AitTableData | undefined>();
  const processedTableData = useRef<AitTableData>();
  const [sampleGroupTemplates, setSampleGroupTempaltes] = useState<AitRowGroupData[] | undefined>();
  const [externalReplacements, setExternalReplacements] = useState<AioExternalReplacements[]>([]);
  const [listStatus, setListStatus] = useState<string>("");
  const commentStyles: AieStyleMap = {
    Optional: { css: { color: "mediumseagreen" }, aieExclude: ["Notes"] },
    Notes: { css: { color: "royalblue" }, aieExclude: ["Optional"] },
  };
  const cellStyles: AieStyleMap = {
    Optional: { css: { color: "mediumseagreen" }, aieExclude: ["Notes"] },
    Notes: { css: { color: "royalblue" }, aieExclude: ["Optional"] },
  };
  const [externalSingles, setExternalSingles] = useState<AioExternalSingle[]>([]);
  const [showTableOptions, setShowTableOptions] = useState<boolean>(true);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  /** Load defaults */
  useEffect(() => {
    /** Load row group templates */
    fetch("public/groupTemplates.json", {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (MyJson: AitRowGroupData[]) {
        setSampleGroupTempaltes(MyJson);
      });
    /** Load table data */
    fetch("public/tableData.json", {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (MyJson: AitTableData) {
        setTableData(updateTableDataVersion(MyJson, 40));
      });
  }, []);

  const loadData = useCallback(() => {
    try {
      if (ta.current && ta.current.value === "") {
        ta.current.value = window.localStorage.getItem("tableContent") ?? "";
      }
      if (ta.current) {
        const j = updateTableDataVersion(JSON.parse(ta.current.value?.toString() ?? "{}"), 40);
        setTableData(updateTableDataVersion(j, 40));
        ta.current.value = JSON.stringify(j, null, 2);
      }
    } catch (e) {
      console.warn("JSON parse failed");
      console.dir(e);
    }
  }, []);

  const loadReplacements = useCallback(() => {
    try {
      const j: AioExternalReplacements[] = JSON.parse(
        window.localStorage.getItem("listContent") ?? "[]",
      );
      setExternalReplacements(j);
      const g: AitRowGroupData[] = JSON.parse(
        window.localStorage.getItem("rowGroupContent") ?? "[]",
      );
      setSampleGroupTempaltes(g);
      setListStatus(
        `Loaded ${j.length} lists: ${j.map((rv) => rv.givenName).join(", ")}, RG templates: ${g
          .map((rg) => rg.name)
          .join(", ")}`,
      );
    } catch (e) {
      console.warn("JSON parse from listContent failed");
      console.dir(e);
      setListStatus("Error loading external list data");
    }
  }, []);

  return (
    <>
      <div
        style={{
          marginLeft: "1rem",
          marginRight: "1rem",
          width: "100%",
          // display: "flex",
          // justifyContent: "center",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div>
          {tableData === undefined ? (
            <span style={{ margin: "3rem" }}>Table loading</span>
          ) : (
            <AsupInternalTable
              id="test-table"
              noTableOptions={!showTableOptions}
              tableData={tableData}
              setTableData={(ret) => {
                setTableData(ret);
              }}
              isEditable={isEditable}
              processedDataRef={processedTableData}
              style={{ margin: "1rem" }}
              showCellBorders={true}
              externalLists={externalReplacements}
              externalSingles={externalSingles}
              groupTemplates={sampleGroupTemplates}
              commentStyles={commentStyles}
              cellStyles={cellStyles}
              colWidthMod={3}
              defaultCellWidth={40}
            />
          )}
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
        <span>
          <input
            type="checkbox"
            checked={showTableOptions}
            onChange={(e) => setShowTableOptions(e.currentTarget.checked)}
          />
          &nbsp; Show global options
        </span>
        <span style={{ marginLeft: "1rem" }}>
          <input
            type="checkbox"
            checked={isEditable}
            onChange={(e) => setIsEditable(e.currentTarget.checked)}
          />
          &nbsp; Editable
        </span>
        <div style={{ margin: "1rem" }}>
          <AioSingleReplacements
            id="test-singles"
            replacements={externalSingles}
            setReplacements={(ret) => setExternalSingles(ret)}
          />
        </div>
        <button onClick={loadData}>Load</button>
        <button
          onClick={() => {
            if (!ta.current) return;
            // Show intended data
            ta.current.value = JSON.stringify(tableData, null, 2);
            // Save string
            window.localStorage.setItem("tableContent", JSON.stringify(tableData));
          }}
        >
          Save
        </button>
        <span style={{ paddingLeft: "1rem" }}>(browser storage)</span>

        <button
          onClick={loadReplacements}
          style={{ marginLeft: "1rem", marginRight: "0.5rem" }}
        >
          Load lists
        </button>
        <span>{listStatus}</span>

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
