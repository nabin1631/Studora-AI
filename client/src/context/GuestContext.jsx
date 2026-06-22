import { createContext, useState, useContext } from "react";

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const promptAuth = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <GuestContext.Provider value={{ showAuthModal, promptAuth, closeAuthModal }}>
      {children}
    </GuestContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGuest = () => useContext(GuestContext);