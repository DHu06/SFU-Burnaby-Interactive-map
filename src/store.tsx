import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Point, Route } from "./types";
function useAppState() {
  const [start, setStart] = useState("aq201"),
    [end, setEnd] = useState("asb101"),
    [accessible, setAccessible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null),
    [floor, setFloor] = useState(1),
    [route, setRoute] = useState<Route | null>(null);
  const [focus, setFocus] = useState<Point | null>(null),
    [step, setStep] = useState(0),
    [navigating, setNavigating] = useState(false);
  useEffect(() => {
    setRoute(null);
    setNavigating(false);
    setStep(0);
  }, [start, end, accessible]);
  return {
    start,
    setStart,
    end,
    setEnd,
    accessible,
    setAccessible,
    selected,
    setSelected,
    floor,
    setFloor,
    route,
    setRoute,
    focus,
    setFocus,
    step,
    setStep,
    navigating,
    setNavigating,
  };
}
const Context = createContext<ReturnType<typeof useAppState> | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  return <Context.Provider value={useAppState()}>{children}</Context.Provider>;
}
export function useApp() {
  return useContext(Context)!;
}
