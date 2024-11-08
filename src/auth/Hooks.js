"use client"
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Web3AuthNoModal } from  "@web3auth/no-modal"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from "@web3auth/base";
import { LOGIN_PROVIDER, AuthAdapter } from "@web3auth/auth-adapter";
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
    chainConfig,
  }
})

const web3auth = new Web3AuthNoModal({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider
})

const adapter = new AuthAdapter({
  adapterSettings: {
    uxMode: "redirect",
    redirectUrl: process.env.NEXT_PUBLIC_WEB3AUTH_REDIRECT_URL,
    loginConfig: {
      google: {
        verifier: "google-email-passwordless",
        verifierSubIdentifier: "google",
        typeOfLogin: "google",
        clientId: "114293822105-klnadodqg04n7o20rk08k5u2ukbsb9mn.apps.googleusercontent.com"
      },
      email_passwordless: {
        verifier: "google-email-passwordless",
        verifierSubIdentifier: "email-passwordless",
        typeOfLogin: "email_passwordless",
        clientId
      }
    }
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
      setConnected(web3auth.connected)
      setProvider(web3auth.provider)
      setUser(web3auth)
      setApp(null)
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

    if(connected) {
      const getAppInfo = async () => {
        const info = await signedFetch("/api/account", {provider})
        const i = await info.json()
        setApp(i)
      }
      getAppInfo()
    }
  }, [provider])

  // call this function when you want to authenticate the user
  const Login = async (method, hint) => {
    console.log(clientId)

    if (user?.connected) {
      throw new Error("already logged in")
    }

    if(web3auth.connected) {
      setProvider(web3auth.provider)
      setUser(web3auth)
      return
    }

    let web3authProvider

    const methodSwitch = async (method) => {
      console.log(web3auth.status)
      switch (method) {

        case "google": {
          web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
            loginProvider: LOGIN_PROVIDER.GOOGLE,
            verifierIdField: "email"
          })
        }
        
        case "emailpasswordless": {
          web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
            loginProvider: LOGIN_PROVIDER.EMAIL_PASSWORDLESS,
            extraLoginOptions: {
              login_hint: hint,
              verifierIdField: "email"
            }
          })
        }
  
        case "github": {
        }
        
      }  
    }

    await methodSwitch(method)

    if (web3auth.connected) {
      setProvider(web3authProvider)
      setUser(web3auth)
    } else {
      setProvider(null)
      setUser(null)
      setApp(null)
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
    setApp(null)
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