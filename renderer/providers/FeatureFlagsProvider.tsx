import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Writable } from "type-fest";
import { useLocalStorage } from "usehooks-ts";

const FLAGS_DEFINITION = [
  {
    name: "Demo Flag",
    description: "Turning this flag on will make the logo blue.",
    key: "demoFlag",
  },
  {
    name: "Chainport Bridge",
    description:
      "Turning this flag on will show the Bridge navigation item in the sidebar if the current network is Testnet.",
    key: "chainportBridge",
  },
  {
    name: "Global Theme Toggle",
    description:
      "Turning this flag on will allow double clicking the logo to change the theme",
    key: "themeToggle",
  },
  {
    name: "Multisig Ledger",
    description:
      "Turning this flag on will allow you to use a Ledger device to sign transactions using a multisig wallet. You will need to have the Ironfish DKG app installed on your Ledger device.",
    key: "multisigLedger",
  },
] as const;

type FlagsDefinition = Writable<(typeof FLAGS_DEFINITION)[number]>;

type FlagsValueMap = {
  [K in FlagsDefinition["key"]]: Extract<FlagsDefinition, { key: K }> & {
    enabled: boolean;
  };
};

type FlagValue = FlagsValueMap[keyof FlagsValueMap];

const FLAG_KEYS = FLAGS_DEFINITION.map((flag) => flag.key);

type FlagKey = (typeof FLAG_KEYS)[number];

type ContextType = {
  areFlagsEnabled: boolean;
  flags: FlagsValueMap;
  toggleFlag: (flag: FlagKey) => void;
};

const defaultValues = Object.fromEntries(
  FLAG_KEYS.map<[FlagKey, boolean]>((flag) => [flag, false]),
) as Record<FlagKey, boolean>;

const defaultFlagValues = Object.fromEntries(
  FLAGS_DEFINITION.map<[FlagKey, FlagValue]>((flag) => [
    flag.key,
    { ...flag, enabled: false },
  ]),
) as FlagsValueMap;

const Context = createContext<ContextType>({
  areFlagsEnabled: false,
  flags: defaultFlagValues,
  toggleFlag: () => {},
});

type Props = {
  children: ReactNode;
};

export function FeatureFlagsProvider({ children }: Props) {
  const [areFlagsEnabled, setAreFlagsEnabled] = useLocalStorage(
    "featureFlagsEnabled",
    false,
  );
  const [flagsState, setFlagsState] = useLocalStorage(
    "featureFlags",
    defaultValues,
  );

  const flagsValue = useMemo(() => {
    return Object.fromEntries(
      FLAGS_DEFINITION.map<[FlagKey, FlagValue]>((flag) => {
        return [
          flag.key,
          {
            ...flag,
            enabled: areFlagsEnabled ? flagsState[flag.key] || false : false,
          },
        ];
      }),
    ) as FlagsValueMap;
  }, [flagsState, areFlagsEnabled]);

  useEffect(() => {
    // @ts-expect-error This is a dev-only feature
    window.toggleFeatureFlags = () => {
      setAreFlagsEnabled((prev) => !prev);
    };
  }, [setAreFlagsEnabled]);

  const toggleFlag = useCallback(
    (flag: FlagKey) => {
      setFlagsState((prev) => {
        const clone = { ...prev };
        clone[flag] = !clone[flag];
        return clone;
      });
    },
    [setFlagsState],
  );

  const value = useMemo(() => {
    return {
      areFlagsEnabled,
      flags: flagsValue,
      toggleFlag,
    };
  }, [areFlagsEnabled, toggleFlag, flagsValue]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFeatureFlags() {
  return useContext(Context);
}
