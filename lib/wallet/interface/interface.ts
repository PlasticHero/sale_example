// error_code === 0 : success

export type REQUEST_METHOD = 'eth_chainId' | 'eth_requestAccounts' | 'wallet_watchAsset' | 'wallet_addEthereumChain' | 'wallet_switchEthereumChain' | 'eth_sendTransaction' | 'personal_sign' | 'eth_signTypedData_v4' | 'wallet_revokePermissions';
export interface ParamChain {
    chainId: string;// 0x1
}
export interface ParamAddToken extends ParamChain {
    type: 'ERC20';
    options: {
        address: string;
        symbol: string;
        decimals: number;
        image: string;
    }
}
export interface ParamAddChain {
    chainId: string;// 0x1
    chainName: string;
    iconUrls: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
}
export interface ParamSwitchChain extends ParamChain {
    
}
export interface ParamPersonalSign extends ParamChain {
    message: string;
    address?: string;
}
export interface EthSignTypedDataV4 { 
    types: Record<string, {name: string; type: string}[]>;
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: string;
    };
    primaryType: string;
    message: Record<string, any>;
}
export interface ParamEthSignTypedDataV4 extends ParamChain {
    signer: string;
    data: EthSignTypedDataV4;
}
export type TRANSACTION = '' | '0x0' | '0x2';
export interface ParamSendTransaction extends ParamChain {
    type?: TRANSACTION;
    to: string;
    from?: string;
    value?: string;// 0x8ac7230489e80000
    data?: string;// 0x
    gas?: string;// 0x76c0
    gasPrice?: string;// 0x4a817c800
}

export interface Metadata {
    name: string;
    description: string;
    url: string;
    icons: string[];
}

export interface RequestArguments {
    readonly method: string;
    readonly params?: any;
    readonly chainId?: string;
}
export interface EIP1193Provider {
    request(args: RequestArguments): Promise<any>;
    on(event: string, listener: (...args: any[]) => void): void;
}
export interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
}
export interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo;
    provider: EIP1193Provider;
}
export interface EIP6963AnnounceProviderEvent extends CustomEvent {
    type: "eip6963:announceProvider";
    detail: EIP6963ProviderDetail;
}

export enum RESULT_CODE {
    SUCCESS = 0, // Success: The operation was successful. : 성공적으로 작업이 완료됨.
    UN_INSTALL = 1, // Uninstall: The required software is not installed. : 필요한 소프트웨어가 설치되지 않음.
    ALREADY_PROCESSING = 2, // Already Processing: A similar request is already being processed. : 동일한 요청이 이미 처리 중임.
    ALREADY_CONNECTED = 3, // Already Connected: The wallet is already connected. : 지갑이 이미 연결된 상태임.
    INVALID_INPUT = 4, // Invalid Input: The input provided is not valid. : 제공된 입력값이 유효하지 않음.
    PARSE_ERROR = 5, // Parse Error: The JSON received is invalid and cannot be parsed. : 수신된 JSON이 잘못되어 구문 분석할 수 없음.
    INVALID_REQUEST = 6, // Invalid Request: The request is not a valid JSON-RPC request. : 요청이 유효한 JSON-RPC 요청이 아님.
    METHOD_NOT_FOUND = 7, // Method Not Found: The requested method does not exist. : 요청한 메서드가 존재하지 않음.
    INVALID_PARAMS = 8, // Invalid Parameters: The parameters provided are incorrect. : 제공된 매개변수가 올바르지 않음.
    INTERNAL_ERROR = 9, // Internal Error: An internal JSON-RPC error occurred. : 내부 JSON-RPC 오류가 발생함.
    RESOURCE_NOT_FOUND = 10, // Resource Not Found: The requested resource could not be found. : 요청한 리소스를 찾을 수 없음.
    TRANSACTION_REJECTED = 11, // Transaction Rejected: The transaction was rejected. : 트랜잭션이 거부됨.
    METHOD_NOT_SUPPORTED = 12, // Method Not Supported: The requested method is not supported. : 요청한 메서드가 지원되지 않음.
    LIMIT_EXCEEDED = 13, // Limit Exceeded: The request exceeded the allowed limit. : 허용된 한도를 초과함.
    USER_REJECTED = 14, // User Rejected: The user declined the request. : 사용자가 요청을 거부함.
    UNAUTHORIZED = 15, // Unauthorized: The user has not authorized the request. : 사용자가 요청을 승인하지 않음.
    UNSUPPORTED_METHOD = 16, // Unsupported Method: The provider does not support the method. : 제공자가 해당 메서드를 지원하지 않음.
    DISCONNECTED = 17, // Disconnected: The provider is disconnected. : 제공자가 연결이 끊어진 상태임.
    CHAIN_DISCONNECTED = 18, // Chain Disconnected: The connection to the chain has been lost. : 블록체인과의 연결이 끊어짐.
    UN_RECOGNIZED_CHAIN_ID = 19, // Unrecognized chain ID: The chain ID is not recognized. : 블록체인 ID가 인식되지 않음.
    NOT_MATCH_CHAINID = 20, // Not match chain ID: The chain ID does not match. : 블록체인 ID가 일치하지 않음.
    TRANSACTION_FAILED = 21, // Transaction Failed: The transaction failed. : 트랜잭션이 실패함.
    TRANSACTION_NOT_FOUND = 22, // Transaction Not Found: The transaction cannot be found. : 트랜잭션을 찾을 수 없음.
    NOT_CONNECTED = 23, // Not Connected: The wallet is not connected. : 지갑이 연결되지 않음.
    ACCOUNT_NOT_FOUND = 24, // Account Not Found: The account is not found. : 계정을 찾을 수 없음.
    CHAIN_ALREADY_ADDED = 25, // Chain Already Added: The chain is already added to the wallet. : 체인이 이미 지갑에 추가되어 있음.
    UN_KNOWN = 999, // Unknown Error: An unspecified or unknown error occurred. : 알 수 없거나 정의되지 않은 오류가 발생함.
}
export interface Response {
    result: RESULT_CODE;
    data: any;
}


export type EventName = 'disconnect' | 'connect' | 'chainChanged' | 'accountsChanged' | 'message';
// export type EventName = 'disconnect'
export type EventCallback = (...args: any[]) => void;

export interface IEthereumWalletMethods {
    addToken: (param: ParamAddToken) => Promise<Response>;
    addChain: (param: ParamAddChain) => Promise<Response>;
    switchChain: (param: ParamSwitchChain) => Promise<Response>;
    sendTransaction: (param: ParamSendTransaction) => Promise<Response>;
    personalSign: (param: ParamPersonalSign) => Promise<Response>;
    ethSignTypedDataV4: (param: ParamEthSignTypedDataV4) => Promise<Response>;
    ethChainId: () => Promise<Response>;
}
export interface IWallet extends IEthereumWalletMethods{
    on: (event: EventName, listener: EventCallback) => void;
    connect: (param?: ParamChain) => Promise<Response>;
    disconnect: () => Promise<Response>;
    //use[passport]
    loginCallback?: () => Promise<void>;
}

