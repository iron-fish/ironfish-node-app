import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const FLAGS = ["demoFlag"] as const;

type Flag = (typeof FLAGS)[number];

type ContextType = {
  flags: Record<Flag, boolean>;
  toggleFlag: (flag: Flag) => void;
};

const defaultValues = Object.fromEntries(
  FLAGS.map<[Flag, boolean]>((flag) => [flag, false]),
) as Record<Flag, boolean>;

const Context = createContext<ContextType>({
  flags: defaultValues,
  toggleFlag: () => {},
});

type Props = {
  children: ReactNode;
};

export function FeatureFlagsProvider({ children }: Props) {
  const [flagsState, setFlagsState] = useState(defaultValues);

  const toggleFlag = useCallback((flag: Flag) => {
    setFlagsState((prev) => {
      const clone = { ...prev };
      clone[flag] = !clone[flag];
      return clone;
    });
  }, []);

  return (
    <Context.Provider
      value={{
        flags: flagsState,
        toggleFlag,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(Context);
}
