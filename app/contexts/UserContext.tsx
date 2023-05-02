import { createContext, useContext, useReducer } from "react";
import type { Dispatch } from "react";

const initialUserState = {
  loggedIn: false,
  isPremium: false,
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  imageUrl: "",
  uid: "",
  totalBookedHours: 0,
  currentSession: 0,
};

const UserContext = createContext(initialUserState);
const UserDispatchContext = createContext<Dispatch<IAction>>(() => {
  throw Error("User Dispatch not initialized");
});

interface IUserState {
  loggedIn: boolean;
  isPremium: boolean;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  imageUrl: string;
  uid: string;
  totalBookedHours: number;
  currentSession: number;
}

interface IAction {
  type: "login" | "logout" | "update";
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  uid?: string;
  imageUrl?: string;
  totalBookedHours?: number;
  currentSession?: number;
  isPremium?: boolean;
}

interface IProps {
  children: JSX.Element;
}

const UserProvider = ({ children }: IProps) => {
  const [userState, dispatch] = useReducer(userReducer, initialUserState);

  return (
    <UserContext.Provider value={userState}>
      <UserDispatchContext.Provider value={dispatch}>{children}</UserDispatchContext.Provider>
    </UserContext.Provider>
  );
};

const useUser = () => {
  return useContext(UserContext);
};

const useUserDispatch = () => {
  return useContext(UserDispatchContext);
};

const userReducer = (userState: IUserState, action: IAction): IUserState => {
  switch (action.type) {
    case "login": {
      return {
        loggedIn: true,
        isPremium: action.isPremium || false,
        firstname: action.firstname || "",
        lastname: action.lastname || "",
        username: action.username || "",
        email: action.email || "",
        imageUrl: action.imageUrl || "",
        uid: action.uid || "",
        totalBookedHours: action.totalBookedHours || 0,
        currentSession: action.currentSession || 0,
      };
    }
    case "logout": {
      return {
        loggedIn: false,
        isPremium: false,
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        imageUrl: "",
        uid: "",
        totalBookedHours: 0,
        currentSession: 0,
      };
    }
    case "update": {
      const { type, ...restState } = action;

      return {
        ...userState,
        ...restState,
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

export { UserProvider, useUser, useUserDispatch };
export type { IUserState, IAction };
