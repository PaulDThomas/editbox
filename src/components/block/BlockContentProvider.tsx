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

const BlockContext = createContext<BlockContextProps<unknown> | null>(null);

export const BlockContextProvider = ({
  initialState,
  children,
}: BlockContextProviderProps<unknown>): JSX.Element => {
  const [state, dispatch] = useReducer(blockReducer, initialState);

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
