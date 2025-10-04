import React, { createContext, useContext, useMemo, useState } from 'react';


export type UserProfile = {
  id: string;
  name: string;
  picture: string;
  email?: string;
};


type AuthCtx = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
};


const Ctx = createContext<AuthCtx>({ user: null, setUser: () => {} });


export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};


export const useAuth = () => useContext(Ctx);