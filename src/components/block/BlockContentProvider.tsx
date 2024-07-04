import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { blockReducer, IBlockAction, IBlockState } from "./blockReducer";

interface BlockContextProps<T> {
  state: IBlockState<T>;
  dispatch: Dispatch<IBlockAction<T>>;
}

interface BlockContextProviderProps<T> {
  initialState: IBlockState<T>;
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockContext = createContext<BlockContextProps<any> | null>(null);

export const BlockContextProvider = <T,>(props: BlockContextProviderProps<T>): JSX.Element => {
  const { initialState, children } = props;
  const [state, dispatch] = useReducer(blockReducer<T>, initialState);

  return <BlockContext.Provider value={{ state, dispatch }}>{children}</BlockContext.Provider>;
};
BlockContextProvider.displayName = "BlockContextProvider";

// Custom hook to use the context
export function useBlockContext<T>() {
  const context = useContext(BlockContext as React.Context<BlockContextProps<T> | null>);
  if (!context) {
    throw new Error("useBlockContext must be used within a BlockContextProvider");
  }
  return { state: context.state, dispatch: context.dispatch };
}
