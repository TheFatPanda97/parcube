import { createContext, useContext, useReducer } from "react";
import type { Dispatch } from "react";

type TMarkerData = {
  address: string;
  createdBy: string;
  bookedBy: string;
  startDate?: Date;
  endDate?: Date;
  bookedFrom?: Date;
  bookedTo?: Date;
  rating?: number;
  ratingCount?: number;
  country: string;
  city: string;
  description: string;
  type: string;
  parkingSpaceType: string;
  vehicleSizeType: string;
  electricCharger: boolean;
  geopoint: {
    latitude: number;
    longitude: number;
  };
  cost: number;
  numSpots: number;
  distance: number;
  imagePaths?: string[];
  imageUrls?: string[];
  url?: string;
};

interface IMarkerState {
  [id: string]: TMarkerData;
}

interface IAction {
  type: "add" | "delete" | "update" | "clearAndAdd";
  deletionIds?: string[];
  data?: {
    [id: string]: TMarkerData;
  };
}

interface IProps {
  children: JSX.Element;
}

const MarkerContext = createContext<IMarkerState>({});
const MarkerDispatchContext = createContext<Dispatch<IAction>>(() => {
  throw Error("Marker Dispatch not initialized");
});

const MarkerProvider = ({ children }: IProps) => {
  const [MarkerState, dispatch] = useReducer(markerReducer, {});

  return (
    <MarkerContext.Provider value={MarkerState}>
      <MarkerDispatchContext.Provider value={dispatch}>{children}</MarkerDispatchContext.Provider>
    </MarkerContext.Provider>
  );
};

const useMarkerInfo = () => {
  return useContext(MarkerContext);
};

const useMarkerInfoDispatch = () => {
  return useContext(MarkerDispatchContext);
};

const markerReducer = (markerState: IMarkerState, action: IAction): IMarkerState => {
  switch (action.type) {
    case "add": {
      return {
        ...markerState,
        ...action.data,
      };
    }
    case "clearAndAdd": {
      return { ...action.data };
    }
    case "update": {
      return {
        ...markerState,
        ...action.data,
      };
    }
    case "delete": {
      return Object.fromEntries(
        Object.entries(markerState).filter(([key, _]) => !action.deletionIds?.includes(key))
      );
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

export { MarkerProvider as SpotInfoProvider, useMarkerInfo, useMarkerInfoDispatch };
export type { IMarkerState, TMarkerData, IAction };
