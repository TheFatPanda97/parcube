export type TRootRoutes = {
  Home: undefined;
  LoginPage: undefined;
  SignUpPage: undefined;
  TabNavigator: undefined;
  RentalDisplay: undefined;
  HelpPageNavigator: undefined;
  BookedByMe: undefined;
  ProfilePage: undefined;
  ReportPage: {
    uid: string;
  };
  RentalPage: {
    uid?: string;
    coord?: {
      latitude: number;
      longitude: number;
    };
  };
  AllRentalPage: undefined;
};

export type THelpRoutes = {
  HelpPageClient: undefined;
  HelpPageHost: undefined;
  HelpPageReport: undefined;
  HelpPageMenu: undefined;
};
