
import { wagmiConnectProvider } from "./component/WagmiHandleProvider";
import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail, IEthereumWalletMethods, IWallet, ParamAddChain, ParamAddToken, ParamEthSignTypedDataV4, ParamPersonalSign, ParamSendTransaction, ParamSwitchChain, Response, RESULT_CODE } from "./interface/interface";
import { MetaMask } from "./wallets/metamask";
import { Wagmiconnect } from "./wallets/wagmiconnect";

const IS_DEV = process.env.NEXT_PUBLIC_STAKING_API_URL !== 'https://staking-api.strmchain.com'

export enum WALLET_TYPE {
    Metamask = 'io.metamask',
    // Passport = 'com.immutable.passport',
    WalletConnect = 'com.walletconnect.org'
}
class WalletLib {
    #UNINSTALL:Response = { result: RESULT_CODE.UN_INSTALL, data: undefined};
    #useNetworks: ParamAddChain[] = [];
    #eip6963ProviderDetails: EIP6963ProviderDetail[] = [];
    #wallets: Map<string, IWallet> = new Map();
    constructor() {
        this.#wallets = new Map();
    }
    #emitDisconnect(wallet_type: WALLET_TYPE) {
        if(IS_DEV) console.log('[emit-Disconnect]', wallet_type);
    }
    #emitChangedChainId(wallet_type: WALLET_TYPE, res:any) {
        if(IS_DEV) console.log('[emit-Changed-ChainId]', wallet_type, res);
    }
    #emitChangedAddress(wallet_type: WALLET_TYPE, res:any) {
        if(res) {
            if(res instanceof Array) {
                if(res.length > 0) {
                    if(IS_DEV) console.log('[emit-Changed-Address]', wallet_type, res[0]);
                } else {
                    if(IS_DEV) console.log('[emit-Changed-Address]out-', wallet_type, undefined);
                }
                
            } else {
                if(IS_DEV) console.log('[emit-Changed-Address]', wallet_type, res);
            }
        } else {
            if(IS_DEV) console.log('[emit-Changed-Address]out-', wallet_type, undefined);
        }
    }
    async init(useNetworks: ParamAddChain[]) {
        this.#useNetworks = useNetworks;
        this.#createEip6963();
        await this.#createWagmiWalletConnect();
    }
    #createEip6963() {
        window.addEventListener("eip6963:announceProvider", (event: Event) => {
            const customEvent = event as EIP6963AnnounceProviderEvent;
            if(!this.#eip6963ProviderDetails.some(p => p.info.uuid === customEvent.detail.info.uuid)) {
                this.#eip6963ProviderDetails.push(customEvent.detail);
                // if(IS_DEV) console.log('customEvent : ', customEvent);
                this.#eip6963ProviderDetails.forEach(detail=>{
                    if(detail.info.rdns === WALLET_TYPE.Metamask) {
                        const wallet = new MetaMask(detail.provider)
                        this.#addWallet(WALLET_TYPE.Metamask, wallet);
                    }
                })
            }
        });
        window.dispatchEvent(new Event("eip6963:requestProvider"));
    }

    async #createWagmiWalletConnect() {
        this.#addWallet(WALLET_TYPE.WalletConnect, new Wagmiconnect(wagmiConnectProvider));
    }
    #addWallet(wallet_type: WALLET_TYPE, wallet: IWallet) {
        if(this.#wallets.has(wallet_type)) return;
        this.#wallets.set(wallet_type, wallet);
        wallet.on('disconnect', ()=>{this.#emitDisconnect(wallet_type)});
        wallet.on('chainChanged', (res:any)=>{this.#emitChangedChainId(wallet_type, res)});
        wallet.on('accountsChanged', (res:any)=>{this.#emitChangedAddress(wallet_type, res)});

    }
    async connect(wallet_Type: WALLET_TYPE): Promise<Response> {
        const wallet = this.#wallets.get(wallet_Type);
        // if(IS_DEV) console.log('wallet : ', wallet);
        if(!wallet) return this.#UNINSTALL;
        const res = await wallet.connect();
        // if(IS_DEV) console.log('res : ', res);
        return res;
    }
    async disconnect(wallet_Type: WALLET_TYPE): Promise<Response> {
        const wallet = this.#wallets.get(wallet_Type);
        if(!wallet) return this.#UNINSTALL;
        return await wallet.disconnect();
    }
    async #ethereumMethodCall(wallet_Type: WALLET_TYPE, method: keyof IEthereumWalletMethods, param: any): Promise<Response> {
        const wallet = this.#wallets.get(wallet_Type);
        if(!wallet) return this.#UNINSTALL;
        return await wallet[method](param);
    }
    async ethChainId(wallet_Type: WALLET_TYPE): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'ethChainId', undefined);
    }
    async addToken(wallet_Type: WALLET_TYPE, param: ParamAddToken): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'addToken', param);
    }
    async addChain(wallet_Type: WALLET_TYPE, param: ParamAddChain): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'addChain', param);
    }
    async switchChain(wallet_Type: WALLET_TYPE, param: ParamSwitchChain): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'switchChain', param);
    }
    async personalSign(wallet_Type: WALLET_TYPE, param: ParamPersonalSign): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'personalSign', param);
    }
    async ethSignTypedDataV4(wallet_Type: WALLET_TYPE, param: ParamEthSignTypedDataV4): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'ethSignTypedDataV4', param);
    }
    async sendTransaction(wallet_Type: WALLET_TYPE, param: ParamSendTransaction): Promise<Response> {
        if(wallet_Type === WALLET_TYPE.Metamask) {
            const network = this.#useNetworks.find(n => Number(n.chainId) === Number(param.chainId));
            if(network) {
                return await this.sendTransactionWithChain(wallet_Type, param, network);
            }
        }
        return await this.#sendTransaction(wallet_Type, param);
    }
    async #sendTransaction(wallet_Type: WALLET_TYPE, param: ParamSendTransaction): Promise<Response> {
        return await this.#ethereumMethodCall(wallet_Type, 'sendTransaction', param);
    }
    // async sendTransactionWithChain(wallet_Type: WALLET_TYPE, param: ParamSendTransaction, paramChain: ParamAddChain): Promise<Response> {
    //     // if(wallet_Type === WALLET_TYPE.Metamask) {
    //         const resSwitchChain = await this.switchChain(wallet_Type, paramChain);
    //         // if(IS_DEV) console.log('resSwitchChain : ' , resSwitchChain)
    //         if(resSwitchChain.result === RESULT_CODE.USER_REJECTED) return resSwitchChain;
    //         if(
    //             resSwitchChain.result === RESULT_CODE.INVALID_PARAMS ||
    //             resSwitchChain.result === RESULT_CODE.NOT_MATCH_CHAINID ||
    //             resSwitchChain.result === RESULT_CODE.UN_RECOGNIZED_CHAIN_ID
    //         ) {
    //             const resAddChain = await this.addChain(wallet_Type, paramChain);
    //             // if(IS_DEV) console.log('resAddChain : ' , resAddChain)
    //             if(resAddChain.result === RESULT_CODE.USER_REJECTED) return resAddChain;
    //             return await this.#sendTransaction(wallet_Type, param);
    //         }
    //     // }
    //     return await this.#sendTransaction(wallet_Type, param);
    // }
    async sendTransactionWithChain(wallet_Type: WALLET_TYPE, param: ParamSendTransaction, paramChain: ParamAddChain): Promise<Response> {
        if(wallet_Type === WALLET_TYPE.WalletConnect) {
            const resChainId = await this.ethChainId(wallet_Type)
            if(resChainId.result === RESULT_CODE.NOT_CONNECTED) return resChainId;
            if(IS_DEV) console.log('resChainId : ' , resChainId, ', req-chain : ' , Number(paramChain.chainId))
            if(Number(resChainId.data) !== Number(paramChain.chainId)) {
                const resAddChain = await this.addChain(wallet_Type, paramChain);
                if(IS_DEV) console.log('resAddChain : ' , resAddChain)
                if(resAddChain.result === RESULT_CODE.USER_REJECTED) return resAddChain;
                if(resAddChain.result === RESULT_CODE.SUCCESS) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
        } else {
            const resSwitchChain = await this.switchChain(wallet_Type, {chainId: paramChain.chainId});
            if(IS_DEV) console.log('resSwitchChain : ' , resSwitchChain)
            if(resSwitchChain.result === RESULT_CODE.USER_REJECTED) return resSwitchChain;
            if(
                resSwitchChain.result === RESULT_CODE.INVALID_PARAMS ||
                resSwitchChain.result === RESULT_CODE.NOT_MATCH_CHAINID ||
                resSwitchChain.result === RESULT_CODE.UN_RECOGNIZED_CHAIN_ID
            ) {
                const resAddChain = await this.addChain(wallet_Type, paramChain);
                if(IS_DEV) console.log('resAddChain : ' , resAddChain)
                if(resAddChain.result === RESULT_CODE.USER_REJECTED) return resAddChain;
            }
        }

        const resSend = await this.#sendTransaction(wallet_Type, param);
        if(IS_DEV) console.log('resSend : ' , resSend)
        return resSend;
    }

}


export const walletLib = new WalletLib();
