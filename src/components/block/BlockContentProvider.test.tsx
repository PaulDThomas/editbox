import { render, screen } from "@testing-library/react";
import { BlockContextProvider, useBlockContext } from "./BlockContentProvider";
import { defaultBlockState, IBlockState } from "./blockReducer";
import { AibLineType } from "./interface";

const MockChildren = () => {
  const { state } = useBlockContext<string>();
  const lcr = ["left", "center", "right"];
  return !state ? (
    <>No state</>
  ) : (
    <div>
      {lcr.map((position) => (
        <span key={position}>{state.lines[0][position as "left" | "center" | "right"]}</span>
      ))}
    </div>
  );
};

describe("BlockContextProvider", () => {
  test("Renders children with initial state", async () => {
    const initialState: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid: "line-id",
          left: "left",
          center: null,
          right: "right",
          lineType: AibLineType.leftAndRight,
          canEdit: false,
          canRemove: true,
          canMove: false,
          addBelow: false,
          canChangeType: false,
        },
      ],
      disabled: false,
      returnData: jest.fn(),
    };

    render(
      <BlockContextProvider initialState={initialState}>
        <MockChildren />
      </BlockContextProvider>,
    );

    expect(screen.queryByText(/left/)).toBeInTheDocument();
    expect(screen.queryByText(/right/)).toBeInTheDocument();
  });

  test("Updates state when initialState changes", async () => {
    const initialState1: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid: "line-id",
          left: "left",
          center: null,
          right: "right",
          lineType: AibLineType.leftAndRight,
          canEdit: false,
          canRemove: true,
          canMove: false,
          addBelow: false,
          canChangeType: false,
        },
      ],
      disabled: false,
      returnData: jest.fn(),
    };

    const initialState2: IBlockState<string> = {
      ...defaultBlockState,
      lines: [
        {
          aifid: "new-line-id",
          left: "new-left",
          center: "new-center",
          right: "new-right",
          lineType: AibLineType.leftCenterAndRight,
          canEdit: false,
          canRemove: true,
          canMove: false,
          addBelow: false,
          canChangeType: false,
        },
      ],
      disabled: true,
      returnData: jest.fn(),
    };

    const { rerender } = render(
      <BlockContextProvider initialState={initialState1}>
        <MockChildren />
      </BlockContextProvider>,
    );

    expect(screen.queryByText("left")).toBeInTheDocument();
    expect(screen.queryByText("right")).toBeInTheDocument();

    rerender(
      <BlockContextProvider initialState={initialState2}>
        <MockChildren />
      </BlockContextProvider>,
    );

    expect(screen.queryByText(/new-left/)).toBeInTheDocument();
    expect(screen.queryByText(/new-center/)).toBeInTheDocument();
    expect(screen.queryByText(/new-right/)).toBeInTheDocument();
  });

  test("No context render", () => {
    render(<MockChildren />);
    expect(screen.queryByText(/No state/)).toBeInTheDocument();
  });
});
