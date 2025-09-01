import { TRANSACTION_TYPE } from "../define";
import { EIP1193Provider, EventCallback, EventName, IWallet, ParamAddChain, ParamAddToken, ParamChain, ParamEthSignTypedDataV4, ParamPersonalSign, ParamSendTransaction, ParamSwitchChain, REQUEST_METHOD, Response, RESULT_CODE } from "../interface/interface";

const IS_DEV = process.env.NEXT_PUBLIC_STAKING_API_URL !== 'https://staking-api.strmchain.com'

export class MetaMask implements IWallet {

    #provider: EIP1193Provider;
    #eventListeners: Map<EventName, EventCallback> = new Map();

    constructor(provider: EIP1193Provider) {
        this.#provider = provider;
    }
    
    on(event: EventName, listener: EventCallback) {
        this.#eventListeners.set(event, listener);
        if(event === 'disconnect') {
            this.#provider.on('accountsChanged', (accounts: string[])=>{
                if(IS_DEV) console.log('[METAMASK] accountsChanged', accounts);
                if(!accounts || accounts.length === 0) {
                    this.#eventListeners.get('disconnect')?.();
                }
            });
        } else {
            this.#provider.on(event, listener);
        }

    }

    async disconnect(): Promise<Response> {
        const res = await this.#request('wallet_revokePermissions', [{ eth_accounts:{}}]);
        return res
    }

    async connect(): Promise<Response> {
        const res = await this.#request('eth_requestAccounts');
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
        // await window.ethereum.request({
        //         "method": "wallet_watchAsset",
        //         "params": {
        //         type: "ERC20",
        //         options: {
        //         address: "0xb60e8dd61c5d32be8058bb8eb970870f07233155",
        //         symbol: "FOO",
        //         decimals: 18,
        //         image: "https://foo.io/token-image.svg"
        //         }
        //     },
        // });
        const res = await this.#request('wallet_watchAsset', param);
        return res
    }

    async addChain(param: ParamAddChain): Promise<Response> {
        // await window.ethereum.request({
        //     "method": "wallet_addEthereumChain",
        //     "params": [
        //      {
        //        chainId: "0x64",
        //        chainName: "Gnosis",
        //        rpcUrls: [
        //          "https://rpc.gnosischain.com"
        //        ],
        //        iconUrls: [
        //          "https://xdaichain.com/fake/example/url/xdai.svg",
        //          "https://xdaichain.com/fake/example/url/xdai.png"
        //        ],
        //        nativeCurrency: {
        //          name: "XDAI",
        //          symbol: "XDAI",
        //          decimals: 18
        //        },
        //        blockExplorerUrls: [
        //          "https://blockscout.com/poa/xdai/"
        //        ]
        //      }
        //    ],
        //    });
        const res = await this.#request('wallet_addEthereumChain', [param]);
        return res
    }

    async switchChain(param: ParamSwitchChain): Promise<Response> {
        // await window.ethereum.request({
        //     "method": "wallet_switchEthereumChain",
        //     "params": [
        //         {
        //             chainId: "0x64"
        //         }
        //     ],
        // });
        const res = await this.#request('wallet_switchEthereumChain', [param]);
        return res
    }

    async sendTransaction(param: ParamSendTransaction): Promise<Response> {
        if(param.value === '' || param.value === '0' || param.value === '0x') param.value = '0x0'
        if(param.data === '0' || param.data === '0x' || param.data === '0x0') param.data = ''
        const {type, ...rest} = param
        const sendParam = param.type === TRANSACTION_TYPE.None ? rest : param
        const res = await this.#request('eth_sendTransaction', [sendParam]);
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
        const hexMessage = `0x${Buffer.from(param.message, "utf8").toString("hex")}`;
        const res = await this.#request('personal_sign', [hexMessage, param.address]);
        return res
    }

    async ethSignTypedDataV4(param: ParamEthSignTypedDataV4): Promise<Response> {
        // await window.ethereum.request({
        //     "method": "eth_signTypedData_v4",
        //     "params": [
        //      "0x0000000000000000000000000000000000000000",
        //      {
        //        types: {
        //          EIP712Domain: [
        //            {
        //              name: "name",
        //              type: "string"
        //            },
        //            {
        //              name: "version",
        //              type: "string"
        //            },
        //            {
        //              name: "chainId",
        //              type: "uint256"
        //            },
        //            {
        //              name: "verifyingContract",
        //              type: "address"
        //            }
        //          ],
        //          Person: [
        //            {
        //              name: "name",
        //              type: "string"
        //            },
        //            {
        //              name: "wallet",
        //              type: "address"
        //            }
        //          ],
        //          Mail: [
        //            {
        //              name: "from",
        //              type: "Person"
        //            },
        //            {
        //              name: "to",
        //              type: "Person"
        //            },
        //            {
        //              name: "contents",
        //              type: "string"
        //            }
        //          ]
        //        },
        //        primaryType: "Mail",
        //        domain: {
        //          name: "Ether Mail",
        //          version: "1",
        //          chainId: 1,
        //          verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
        //        },
        //        message: {
        //          from: {
        //            name: "Cow",
        //            wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"
        //          },
        //          to: {
        //            name: "Bob",
        //            wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
        //          },
        //          contents: "Hello, Bob!"
        //        }
        //      }
        //    ],
        // });
        const res = await this.#request('eth_signTypedData_v4', [param.signer, param.data]);
        return res
    }

    async #request(method: REQUEST_METHOD, params?: any): Promise<Response> {
        try {
            if(IS_DEV) console.log('[Metamask] request : ' , method, params)
            const res = await this.#provider.request({ method, params })
            if(IS_DEV) console.log('[Metamask] response : ' , res)
            return {
                result: RESULT_CODE.SUCCESS,
                data: res === null || res === undefined ? true : res
            }
        } catch(error: any) {
            if(IS_DEV) console.log('error : ' , error)
            if(IS_DEV) console.log('error.code : ' , error.code)
            if(IS_DEV) console.log('error.message : ' , error.message)

            const res = {
                result: this.#handleError(method, error),
                data: undefined
            }
            if(res.result === RESULT_CODE.UN_KNOWN) {
                if(IS_DEV) console.log('[Metamask] error : ' , error);
            }
            
            return res
        }
    }

    #handleError(method: REQUEST_METHOD, error: any): RESULT_CODE {
        // https://github.com/MetaMask/rpc-errors?tab=readme-ov-file
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
                    if(method === 'wallet_addEthereumChain') {
                      if(error.message === "p is not a function" || error.message.includes('already has added')) {
                          return RESULT_CODE.CHAIN_ALREADY_ADDED;
                      }
                    }
                    if(error.message && typeof error.message === 'string') {
                        if(error.message.toLowerCase().includes('symbol')) {
                            return RESULT_CODE.SUCCESS
                        }
                    }
                    
                    return RESULT_CODE.INVALID_PARAMS;
                case -32603:
                    if(error.message && typeof error.message === 'string') {
                        if(error.message.toLowerCase().includes('chainid')) {
                            return RESULT_CODE.NOT_MATCH_CHAINID
                        }
                    }
                    if(method === 'wallet_addEthereumChain') {
                        if(error.message === "p is not a function" || error.message.includes('already has added')) {
                            return RESULT_CODE.CHAIN_ALREADY_ADDED;
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

            }
        } catch(error_error) {

        }
        if(IS_DEV) console.error('[ERROR] metamask error code : ' + error);
        return RESULT_CODE.UN_KNOWN;
    }
}

