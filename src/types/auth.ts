export type AuthActionState = {
  success: boolean;
  message: string;
  fieldErrors: {
    email?: string;
    password?: string;
  };
};

export const initialAuthActionState: AuthActionState = {
  success: false,
  message: "",
  fieldErrors: {},
};
