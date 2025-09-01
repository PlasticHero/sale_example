import { EIP1193Provider, ParamChain } from "../interface/interface";
import { EventCallback, EventName, IWallet, ParamAddChain, ParamAddToken, ParamEthSignTypedDataV4, ParamPersonalSign, ParamSendTransaction, ParamSwitchChain, REQUEST_METHOD, Response, RESULT_CODE } from "../interface/interface";




export class Wagmiconnect implements IWallet {
    #provider: EIP1193Provider;

    constructor(provider: EIP1193Provider) {
        this.#provider = provider;
    }
    
    on(event: EventName, listener: EventCallback) {
        this.#provider.on(event, listener);
    }

    async disconnect(param?: ParamChain): Promise<Response> {
        const res = await this.#request('wallet_revokePermissions', param?.chainId, [{ eth_accounts:{}}]);
        return res
    }

    async connect(param?: ParamChain): Promise<Response> {
        const res = await this.#request('eth_requestAccounts', param?.chainId);
        if(res.result === RESULT_CODE.SUCCESS) {
            if(res.data && res.data.length > 0) {
                return {...res, data: res.data[0]}
            }
        }
        return res
    }
    async ethChainId(): Promise<Response> {
        const res = await this.#request('eth_chainId');
        return res
    }

    async addToken(param: ParamAddToken): Promise<Response> {
        const res = await this.#request('wallet_watchAsset', param.chainId, param);
        return res
    }

    async addChain(param: ParamAddChain): Promise<Response> {
        const res = await this.#request('wallet_addEthereumChain', param.chainId, [param]);
        return res
    }

    async switchChain(param: ParamSwitchChain): Promise<Response> {
        const res = await this.#request('wallet_switchEthereumChain', param.chainId, [param]);
        return res
    }

    async sendTransaction(param: ParamSendTransaction): Promise<Response> {
        if(param.value === '' || param.value === '0' || param.value === '0x') param.value = '0x0'
        if(param.data === '0' || param.data === '0x' || param.data === '0x0') param.data = ''
        const res = await this.#request('eth_sendTransaction', param.chainId, [param]);
        return res
    }
    
    async personalSign(param: ParamPersonalSign): Promise<Response> {
        // await window.ethereum.request({
        //     "method": "personal_sign",
        //     "params": [
        //      "0x506c65617365207369676e2074686973206d65737361676520746f20636f6e6669726d20796f7572206964656e746974792e",
        //      "0x4B0897b0513FdBeEc7C469D9aF4fA6C0752aBea7"
        //    ],
        // });
        // const hexMessage = `0x${Buffer.from(param.message, "utf8").toString("hex")}`;
        // const res = await this.#request('personal_sign', [hexMessage, param.address]);
        const res = await this.#request('personal_sign', param.chainId, [param.message, param.address]);
        return res
    }

    async ethSignTypedDataV4(param: ParamEthSignTypedDataV4): Promise<Response> {
        const res = await this.#request('eth_signTypedData_v4', param.chainId, [param.signer, param.data]);
        return res
    }

    async #request(method: REQUEST_METHOD, chainId?: string, params?: any): Promise<Response> {
        const request = {method: method, params: params, chainId: chainId}
        try {
            console.log('[WalletConnect] request : ' , method, params)
            let res = await this.#provider.request(request)
            console.log('[WalletConnect] response : ' , res)
            return {
                result: RESULT_CODE.SUCCESS,
                data: res === null || res === undefined ? true : res
            }
        } catch(error) {
            console.log(error);
            return {
                result: this.#handleError(method, error),
                data: undefined
            }
        }
    }

    #handleError(method: REQUEST_METHOD, error: any): RESULT_CODE {
        console.log('error : ' , error)
        console.log('error.code : ' , error.code)
        console.log('error.message : ' , error.message)
        /*
            error.code :  4902
            error.message :  An error occurred when attempting to switch chain.
        */

        try {
            switch (Number(error.code)) {
                case -32700:
                    // "Parse error"
                    return RESULT_CODE.PARSE_ERROR;
                case -32600:
                    // "Invalid Request"
                    return RESULT_CODE.INVALID_REQUEST;
                case -32601:
                    // "Method not found"
                    return RESULT_CODE.METHOD_NOT_FOUND;
                case -32602:
                    // "Invalid params"
                    return RESULT_CODE.INVALID_PARAMS;
                    
                case -32603:
                    if(error.message && typeof error.message === 'string') {
                        if(error.message.toLowerCase().includes('chainid')) {
                            return RESULT_CODE.NOT_MATCH_CHAINID
                        }
                    }
                    if(method === 'wallet_addEthereumChain') {
                        if(error.message === "p is not a function" || error.message.includes('already has added')) {
                            return RESULT_CODE.CHAIN_ALREADY_ADDED
                        }
                    }
                    // "Internal error"
                    return RESULT_CODE.INTERNAL_ERROR;
                case -32000:
                    // "Invalid input"
                    return RESULT_CODE.INVALID_INPUT;
                case -32001:
                    // "Resource not found"
                    return RESULT_CODE.RESOURCE_NOT_FOUND;
                case -32002:
                    // "Already processing eth_requestAccounts. Please wait."
                    return RESULT_CODE.ALREADY_PROCESSING;
                case -32003:
                    // "Transaction rejected"
                    return RESULT_CODE.TRANSACTION_REJECTED;
                case -32004:
                    // "Method not supported"
                    return RESULT_CODE.METHOD_NOT_SUPPORTED;
                case -32005:
                    // "Limit exceeded"
                    return RESULT_CODE.LIMIT_EXCEEDED;
                case 4001:
                    // "User rejected the request"
                    return RESULT_CODE.USER_REJECTED;
                case 4100:
                    // "Unauthorized"
                    return RESULT_CODE.UNAUTHORIZED;
                case 4200:
                    // "Unsupported method"
                    return RESULT_CODE.UNSUPPORTED_METHOD;
                case 4900:
                    // "Disconnected"
                    return RESULT_CODE.DISCONNECTED;
                case 4901:
                    // "Chain disconnected"
                    return RESULT_CODE.CHAIN_DISCONNECTED;
                case 4902:
                    //Unrecognized chain ID
                    return RESULT_CODE.UN_RECOGNIZED_CHAIN_ID;
                case 5000:
                    return RESULT_CODE.USER_REJECTED;

            }
        } catch(error_error) {
        }

        console.log('[Metamask] error : ' + error);
        if (typeof error === "string") {
            if(error.toLowerCase().includes('chainid')) {
                return RESULT_CODE.UN_RECOGNIZED_CHAIN_ID;
            }
        } else if (error instanceof Error) {
            // console.error('[ERROR] metamask error message : ' + error.message);
            if(error.message.toLowerCase().includes('chainid')) {
                return RESULT_CODE.UN_RECOGNIZED_CHAIN_ID;
            }
        }

        return RESULT_CODE.UN_KNOWN;
    }
}

