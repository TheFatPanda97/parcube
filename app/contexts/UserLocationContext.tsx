import { createContext, useContext, useReducer } from "react";
import type { Dispatch } from "react";

const initialUserLocationState = {
  longitude: -1,
  latitude: -1,
  city: "",
};

const UserLocationContext = createContext(initialUserLocationState);
const UserLocationDispatchContext = createContext<Dispatch<IAction>>(() => {
  throw Error("User Dispatch not initialized");
});

interface IUserLocationState {
  longitude: number;
  latitude: number;
  city: string;
}

interface IAction {
  type: "setUserLocation";
  data: {
    longitude: number;
    latitude: number;
    city: string;
  };
}

interface IProps {
  children: JSX.Element;
}

const UserLocationProvider = ({ children }: IProps) => {
  const [userLocationState, dispatch] = useReducer(userReducer, initialUserLocationState);

  return (
    <UserLocationContext.Provider value={userLocationState}>
      <UserLocationDispatchContext.Provider value={dispatch}>
        {children}
      </UserLocationDispatchContext.Provider>
    </UserLocationContext.Provider>
  );
};

const useUserLocation = () => {
  return useContext(UserLocationContext);
};

const useUserLocationDispatch = () => {
  return useContext(UserLocationDispatchContext);
};

const userReducer = (
  _userLocationState: IUserLocationState,
  action: IAction
): IUserLocationState => {
  switch (action.type) {
    case "setUserLocation": {
      return {
        ...action.data,
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

export { UserLocationProvider, useUserLocation, useUserLocationDispatch };
export type { IUserLocationState, IAction };
