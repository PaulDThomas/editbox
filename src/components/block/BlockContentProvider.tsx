import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { blockReducer, IBlockAction, IBlockState, SET_STATE } from "./blockReducer";
import { isEqual } from "lodash";

interface BlockContextProps<T> {
  state: IBlockState<T>;
  dispatch: Dispatch<IBlockAction<T>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockContext = createContext<BlockContextProps<any> | null>(null);

export const BlockContextProvider = <T,>(props: BlockContextProviderProps<T>): JSX.Element => {
  const { initialState, children } = props;
  const [state, dispatch] = useReducer(blockReducer<T>, initialState);
  const [lastState, setLastState] = useState<IBlockState<T>>(initialState);

  // Update start from top down
  useEffect(() => {
    dispatch({ type: SET_STATE, state: initialState });
  }, [initialState]);
  // Update return data
  useEffect(() => {
    if (!isEqual(state, lastState)) {
      setLastState(state);
      state.returnData && state.returnData(state.lines);
    }
  }, [lastState, state]);

  return (
    <BlockContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

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

BlockContextProvider.displayName = "BlockContextProvider";
