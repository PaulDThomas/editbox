import { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer } from "react";
import { blockReducer, IBlockAction, IBlockState, SET_STATE } from "./blockReducer";

interface BlockContextProps<T> {
  state: IBlockState<T>;
  dispatch: Dispatch<IBlockAction<T>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockContext = createContext<BlockContextProps<any> | null>(null);

export const BlockContextProvider = <T,>(props: BlockContextProviderProps<T>): JSX.Element => {
  const { initialState, children } = props;
  const [state, dispatch] = useReducer(blockReducer<T>, initialState);

  // Check for initial state update
  useEffect(() => {
    dispatch({ type: SET_STATE, state: props.initialState });
  }, [props.initialState]);

  return <BlockContext.Provider value={{ state, dispatch }}>{children}</BlockContext.Provider>;
};
BlockContextProvider.displayName = "BlockContextProvider";

interface BlockContextProviderProps<T> {
  initialState: IBlockState<T>;
  children: ReactNode;
}

// Custom hook to use the context
export function useBlockContext<T>() {
  const context = useContext(BlockContext as React.Context<BlockContextProps<T> | null>);
  return !context
    ? { state: null, dispatch: null }
    : { state: context.state, dispatch: context.dispatch };
}
