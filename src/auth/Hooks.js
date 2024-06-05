"use client"
import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../utilities/useLocalStorage";
import { Web3AuthNoModal } from  "@web3auth/no-modal"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { LOGIN_PROVIDER, OpenloginAdapter } from "@web3auth/openlogin-adapter";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [provider, setProvider] = useLocalStorage("provider", null);
  const [auth, setAuth] = useLocalStorage("auth", null);

  // call this function when you want to authenticate the user
  const Login = async (method, params) => {

    if (auth?.connected) {
      throw new Error("already logged in")
    }
    console.log(process.env.NEXT_PUBLIC_TEST)
    const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
    console.log(clientId)

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: {
        chainConfig:{
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x89",
          rpcTarget: "https://rpc.ankr.com/polygon",
          displayName: "Polygon Mainnet",
          blockExplorerUrl: "https://polygon.etherscan.io",
          ticker: "MATIC",
          tickerName: "Polygon"
        }
      }
    })

    const web3auth = new Web3AuthNoModal({
      clientId,
      web3AuthNetwork: "sapphire_devnet",
      privateKeyProvider
    })

    const adapter = new OpenloginAdapter({
      privateKeyProvider: privateKeyProvider,
      adapterSettings: {
        uxMode: "redirect"
      }
    })
    
    web3auth.configureAdapter(adapter)

    switch (method) {

      case "google": {
        const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
          loginProvider: LOGIN_PROVIDER.GOOGLE
        })
      }

      case "emailpassword": {
      }

      case "github": {
      }
      
    }

    if (web3auth.connected) {
      console.log("connected!")
      setProvider(web3authProvider)
      setAuth(web3auth)
    } else {
      console.log("unable to connect")
      setProvider(null)
      setAuth(null)
    }
  };


  // call this function to sign out logged in user
  const Logout = () => {
    if(!auth.connected) {
      setProvider(null);
      setAuth(null);
      throw new Error("not logged in")
    }

    auth.logout();
    setProvider(null);
    setAuth(null);
  };

  const Connected = () => {
    return auth?.connected
  }

  const value = useMemo(
    () => ({
      provider,
      Connected,
      Login,
      Logout
    }),
    [provider]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};