'use client'
import { useEffect } from 'react';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { defineChain, http } from 'viem';
import { Connector, createConfig, useAccount, useConnect, useDisconnect, WagmiProvider } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { IS_MAINNET, USE_NETWORKS } from '../define';
import { EIP1193Provider, ParamAddChain, RequestArguments, RESULT_CODE } from '../interface/interface';

const chains = [...USE_NETWORKS.map(chain => makeChain(chain))]
function makeChain(chain: ParamAddChain) {
  return defineChain({
    id: Number(chain.chainId),
    name: chain.chainName,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: {
      default: { http: chain.rpcUrls },
    },
    blockExplorers: {
      default: {
        name: chain.chainName,
        url: chain.blockExplorerUrls[0],
      },
    },
    testnet: !IS_MAINNET,
  })
}

const transports = chains.reduce((acc, chain) => ({
  ...acc,
  [chain.id]: http(chain.rpcUrls.default.http[0])
}), {});

const config =  createConfig({
  chains: chains as any,
  connectors: [
    metaMask(),
  ],
  // storage: createStorage({
  //   storage: cookieStorage,
  // }),
  // ssr: true,
  transports: transports,
})


type STATUS = 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
export class WagmiConnectProvider implements EIP1193Provider {
  address:string = '';
  chainId:number = 0;
  status: STATUS = 'disconnected';
  eventMap:Map<string, (...args: any[]) => void> = new Map();
  connector: Connector | undefined = undefined;
  connectedConnector:Connector | undefined = undefined;
  connectFn: any = undefined;
  disconnectFn:any = undefined;
  

  onChangeConnectFn = (cf: any) => {
    this.connectFn = cf;
  }

  onChangeDisconnectFn = (dcf: any) => {
    this.disconnectFn = dcf;
  }

  onChangedConnectedConnector = (connector: Connector | undefined) => {
    this.connectedConnector = connector;
  }
  onChangedConnector = (connector: Connector | undefined) => {
    this.connector = connector;
  }
  
  onChangedAddress = (address: string) => {
    // console.log('onChangedAddress : ' , address)
    this.address = address;
    if(this.eventMap.has('accountsChanged')) {
      this.eventMap.get('accountsChanged')?.(address);
    }
  }
  onChangedChainId = (chainId: number) => {
    // console.log('onChangedChainId : ' , chainId)
    this.chainId = chainId;
    if(this.eventMap.has('chainChanged')) {
      this.eventMap.get('chainChanged')?.(chainId);
    }
  }
  onChangedStatus = (status: STATUS) => {
    // console.log('onChangedStatus : ' , status)
    this.status = status;
  }

  //EIP1193Provider =================================
  on = (event: string, listener: (...args: any[]) => void): void => {
    this.eventMap.set(event, listener);
  }
  request = async (args: RequestArguments): Promise<any> => {
    console.log('[WAGMI] request-args : ' , args)
    if(args.method === 'eth_requestAccounts') {
      return await this._eth_requestAccounts(args);
    } else if(args.method === 'wallet_revokePermissions') {
      return await this._wallet_revokePermissions(args);
    } else if(args.method === 'eth_chainId') {
      return this.chainId;
    } else {
      if(!this.connector) {
        throw { code: RESULT_CODE.NOT_CONNECTED, message: "connector is undefined" }
      }
      try {
        const caip2ChainId = `eip155:${parseInt(args.chainId || '0', 16)}`
        let chainId = args.chainId;
        if(args.method === 'wallet_addEthereumChain') {
          chainId = caip2ChainId;
        }
        const request = {
          method: args.method as any,
          params: args.params,
          chainId: chainId,
        }

        const provider = await this.connector?.getProvider()
        if(!provider) {
          throw { code: RESULT_CODE.NOT_CONNECTED, message: "provider is undefined" }
        }
        return await (provider as EIP1193Provider).request(request)
      } catch(error) {
        console.log('[RP] request-error : ' , error)
        throw error;
      }
    }
    
  }

  _clearWagmiCookies = () => {
    return;
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if(cookieName.startsWith('wagmi.')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }

  _eth_requestAccounts = async (args: RequestArguments): Promise<string[]> => {
    try{
      
      const connector = this.connector;
      if(!connector) {
        throw { code: 5959, message: "connector is undefined" }
      }
      
      if(this.address) {
        return [this.address];
      }


      this._clearWagmiCookies();


      const res = await this.connectFn({
        connector: this.connector,
        chainId: chains[0].id
      })
      console.log('res : ' , res)
      if(res && res.accounts && res.accounts.length > 0) {
        return res.accounts
      }
    } catch(error) {
      console.log('[RP] _eth_requestAccounts-error : ' , error)
      return [];
    }


    const RETRY_COUNT = 5;

    let retryCount = 0;
    while(retryCount < RETRY_COUNT) {
      if(this.address) {
        return [this.address];
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      retryCount++;
    }

    return [];
  }
  _wallet_revokePermissions = async (args: RequestArguments): Promise<boolean> => {

    const RETRY_COUNT = 5;
    const RETRY_INTERVAL_MS = 1000 * 5;

    let retryCount = 0;
    while(retryCount < RETRY_COUNT) {
      if(this.disconnectFn && this.connectedConnector) {
        this.disconnectFn({connector: this.connectedConnector});
      }
      const startTime = Date.now();
      while(startTime + RETRY_INTERVAL_MS > Date.now()) {

        if(this.status === 'disconnected') {
          this._clearWagmiCookies();
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      retryCount++;
    }
    this._clearWagmiCookies();
    return false;
  }

  
}

export const wagmiConnectProvider = new WagmiConnectProvider();

function WagmiHandler() {
  const { 
    address, 
    chainId,
    status,
    connector,
  } = useAccount();
  
  const { disconnectAsync } = useDisconnect();
  const { connectAsync, connectors } = useConnect();
 
  useEffect(()=>{
    wagmiConnectProvider.onChangeConnectFn(connectAsync);
  },[connectAsync])

  useEffect(()=>{
    wagmiConnectProvider.onChangeDisconnectFn(disconnectAsync);
  },[disconnectAsync])

  useEffect(()=>{
    wagmiConnectProvider.onChangedConnectedConnector(connector);
  },[connector])

  useEffect(()=>{
    if(connectors.length > 0) {
      const connector = connectors[0];
      wagmiConnectProvider.onChangedConnector(connector);
    }
  },[connectors])
  
  useEffect(()=>{
    wagmiConnectProvider.onChangedAddress(address || '');
  },[address])
  
  useEffect(()=>{
    wagmiConnectProvider.onChangedChainId(chainId || 0);
  },[chainId])
  
  useEffect(()=>{
    wagmiConnectProvider.onChangedStatus(status);
  },[status])

  return null;
} 


export function WagmiHandleProvider({ client, children }: { client: QueryClient, children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client ?? new QueryClient()}>
          {children}
          <WagmiHandler/>
      </QueryClientProvider>
    </WagmiProvider>
  );
}