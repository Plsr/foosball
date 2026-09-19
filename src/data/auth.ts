export type RequestCookie = {
  name: string;
  value: string;
};

export type CookieMutation = {
  name: string;
  value: string;
  options: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    partitioned?: boolean;
    path?: string;
    priority?: "low" | "medium" | "high";
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
  };
};

export type HeaderMutation = {
  name: string;
  value: string;
};

export type AuthEffects = {
  cookies: CookieMutation[];
  headers: HeaderMutation[];
};

export type Viewer = {
  id: string;
  email: string | null;
  userName: string | null;
};
