"use client"
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Web3AuthNoModal } from  "@web3auth/no-modal"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { LOGIN_PROVIDER, OpenloginAdapter } from "@web3auth/openlogin-adapter";
import postAccount from "./postAccount";
import signedFetch from "./signedFetch";

const AuthContext = createContext(null);

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x89",
  rpcTarget: "https://rpc.ankr.com/polygon",
  displayName: "Polygon Mainnet",
  blockExplorerUrl: "https://polygon.etherscan.io",
  ticker: "MATIC",
  tickerName: "Polygon"
}

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig
  }
})

const web3auth = new Web3AuthNoModal({
  clientId,
  web3AuthNetwork: "sapphire_devnet",
  chainConfig
})

const adapter = new OpenloginAdapter({
  privateKeyProvider: privateKeyProvider,
  adapterSettings: {
    uxMode: "redirect",
    redirectUrl: process.env.NEXT_PUBLIC_WEB3AUTH_REDIRECT_URL
  }
})

web3auth.configureAdapter(adapter)



export const AuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null)
  const [user, setUser] = useState(null)
  const [app, setApp] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {

    const init = async () => {
      await web3auth.init()
      console.log(web3auth)
      console.log(web3auth.connected)
      setConnected(web3auth.connected)
      setProvider(web3auth.provider)
      setUser(web3auth)
    }

    init()
  }, [])

  useEffect(() => {
    const post = async () => {
      const info = await user?.getUserInfo()
      if(info?.name && info?.email) {
        await postAccount(info.name, info.email, provider)
      }
    }

    if(connected) {
      post()
    }
  }, [connected])

  useEffect(() => {

    if(provider) {
      const getAppInfo = async () => {
        const info = await signedFetch("/api/account", {provider})
        const i = await info.json()
        setApp(i)
      }
      getAppInfo()
    }
  }, [provider])

  // call this function when you want to authenticate the user
  const Login = async (method, params) => {

    if (user?.connected) {
      throw new Error("already logged in")
    }

    if(web3auth.connected) {
      console.log("connected!")
      setProvider(web3auth.provider)
      setUser(web3auth)
      return
    }

    let web3authProvider

    const methodSwitch = async (method) => {
      switch (method) {

        case "google": {
          web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
            loginProvider: LOGIN_PROVIDER.GOOGLE
          })
        }
        
        case "emailpassword": {
        }
  
        case "github": {
        }
        
      }  
    }

    await methodSwitch(method)

    if (web3auth.connected) {
      console.log("connected!")
      setProvider(web3authProvider)
      setUser(web3auth)
    } else {
      console.log("unable to connect")
      setProvider(null)
      setUser(null)
    }
  };


  // call this function to sign out logged in user
  const Logout = async() => {
    if(!user.connected) {
      setProvider(null);
      setUser(null);
      throw new Error("not logged in")
    }

    await user.logout();
    setProvider(null);
    setUser(null);
    setConnected(false);
  };

  const Connected = () => {
    return user?.connected
  }

  const value = useMemo(
    () => ({
      user,
      app,
      provider,
      connected,
      Login,
      Logout
    }),
    [provider, app]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};