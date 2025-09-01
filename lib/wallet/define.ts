import { BigNumber, ethers } from "ethers";
import { ParamAddChain, TRANSACTION } from "./interface/interface";
export const IS_MAINNET = process.env.NEXT_PUBLIC_CHAIN_MAINNET === 'true' ? true : false


export type CHAIN = 'eth' | 'kaia' | 'bsc' | 'polygon' | 'immutable' | 'pth' | 'stream'
export const CHAIN_KEY: Record<CHAIN, CHAIN> = {
    eth:     'eth',
    kaia:    'kaia',
    bsc:     'bsc',
    polygon: 'polygon',
    immutable: 'immutable',
    pth:       'pth',
    stream:    'stream',
}

const CHAIN_CORE_INFO_MAINNET = {
    eth:       { key: CHAIN_KEY.eth,       chainId:1,        rpc: 'https://mainnet.infura.io/v3/7cc4c66309f1458c83ad70437ed40cca', explorer: 'https://etherscan.io' },
    immutable: { key: CHAIN_KEY.immutable, chainId:13371,    rpc: 'https://rpc.immutable.com',                                     explorer: 'https://explorer.immutable.com' },
    kaia:      { key: CHAIN_KEY.kaia,      chainId:8217,     rpc: 'https://public-en.node.kaia.io',                                explorer: 'https://kaiascope.com' },
    bsc:       { key: CHAIN_KEY.bsc,       chainId:56,       rpc: 'https://bsc-dataseed.binance.org',                              explorer: 'https://bscscan.com'      },
    polygon:   { key: CHAIN_KEY.polygon,   chainId:137,      rpc: 'https://polygon-rpc.com',                                       explorer: 'https://polygonscan.com'  },
    pth:       { key: CHAIN_KEY.pth,       chainId:250210,   rpc: 'https://rpc-private.plasticherokorea.com',                      explorer: 'https://explorer.plasticherokorea.com'  },
    stream:    { key: CHAIN_KEY.stream,    chainId:250611,   rpc: 'https://rpc.strmchain.com',                                     explorer: 'https://explorer.strmchain.com'  },
}
const CHAIN_CORE_INFO_TESTNET = {
    eth:       { key: CHAIN_KEY.eth,       chainId:11155111, rpc: 'https://sepolia.infura.io/v3/7cc4c66309f1458c83ad70437ed40cca', explorer: 'https://sepolia.etherscan.io' },
    immutable: { key: CHAIN_KEY.immutable, chainId:13473,    rpc: 'https://rpc.testnet.immutable.com',                             explorer: 'https://explorer.testnet.immutable.com' },
    kaia:      { key: CHAIN_KEY.kaia,      chainId:1001,     rpc: 'https://public-en-kairos.node.kaia.io',                         explorer: 'https://kairos.kaiascope.com' },
    bsc:       { key: CHAIN_KEY.bsc,       chainId:97,       rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',                explorer: 'https://testnet.bscscan.com'    },
    polygon:   { key: CHAIN_KEY.polygon,   chainId:80002,    rpc: 'https://rpc-amoy.polygon.technology',                           explorer: 'https://amoy.polygonscan.com' },
    pth:       { key: CHAIN_KEY.pth,       chainId:250210,   rpc: 'https://test-rpc.plasticherokorea.com',                         explorer: 'https://test-explorer.plasticherokorea.com'  },
    stream:    { key: CHAIN_KEY.stream,    chainId:250611,   rpc: 'https://rpc.strmchain.com',                                     explorer: 'https://explorer.strmchain.com'  },
}

const TARGET_CHAIN_CORE_INFO = IS_MAINNET ? CHAIN_CORE_INFO_MAINNET : CHAIN_CORE_INFO_TESTNET
export const CHAIN_ID: Record<CHAIN, number> = {
    eth:       TARGET_CHAIN_CORE_INFO.eth.chainId,
    immutable: TARGET_CHAIN_CORE_INFO.immutable.chainId,
    kaia:      TARGET_CHAIN_CORE_INFO.kaia.chainId,
    bsc:       TARGET_CHAIN_CORE_INFO.bsc.chainId,
    polygon:   TARGET_CHAIN_CORE_INFO.polygon.chainId,
    pth:       TARGET_CHAIN_CORE_INFO.pth.chainId,
    stream:    TARGET_CHAIN_CORE_INFO.stream.chainId,
}

export const TRANSACTION_TYPE: Record<string, TRANSACTION> = {
    None: '',
    Legacy: '0x0',
    EIP1559: '0x2',
}


interface ChainInfo {
    key: CHAIN;
    chainId: number;
    rpcURL: string;
    explorerURL: string;
    explorer_nft: string;
    explorer_nft_id: string;
    explorer_token: string;
    explorer_tx: string;
    explorer_account: string;
    transaction_type: TRANSACTION;
    chainName: string;
    coinName: string;
    coinSymbol: string;
    coinDeicmals: number;
    iconURL: string;
}
//네트워크 추가시 정보 추가 필요
export const TARGET_CHAIN_INFO: Record<CHAIN, ChainInfo> = {
    eth: {
        key:              TARGET_CHAIN_CORE_INFO.eth.key,
        chainId :         TARGET_CHAIN_CORE_INFO.eth.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.eth.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.eth.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.eth.explorer + "/token/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.eth.explorer}/nft/{0}/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.eth.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.eth.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.eth.explorer + "/address/",
        transaction_type: TRANSACTION_TYPE.EIP1559,
        chainName: 'Ethereum' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'ETH' : 'SepoliaETH',
        coinSymbol: IS_MAINNET ? 'ETH' : 'SepoliaETH',
        coinDeicmals: 18,
        iconURL:  "",
    },
    immutable: {
        key:              TARGET_CHAIN_CORE_INFO.immutable.key,
        chainId :         TARGET_CHAIN_CORE_INFO.immutable.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.immutable.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.immutable.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.immutable.explorer + "/token/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.immutable.explorer}/token/{0}/instance/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.immutable.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.immutable.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.immutable.explorer + "/address/",
        transaction_type: TRANSACTION_TYPE.EIP1559,

        chainName: 'ImmutableW zkEVM' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'IMX' : 'tIMX',
        coinSymbol:IS_MAINNET ? 'IMX' : 'tIMX',
        coinDeicmals: 18,
        iconURL:  "",
        
    },
    kaia: {
        key:              TARGET_CHAIN_CORE_INFO.kaia.key,
        chainId :         TARGET_CHAIN_CORE_INFO.kaia.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.kaia.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.kaia.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.kaia.explorer + "/nft/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.kaia.explorer}/nft/{0}/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.kaia.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.kaia.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.kaia.explorer + "/account/",
        transaction_type: TRANSACTION_TYPE.Legacy,
        chainName: 'KAIA' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'KAIA' : 'tKAIA',
        coinSymbol: IS_MAINNET ? 'KAIA' : 'tKAIA',
        coinDeicmals: 18,
        iconURL:  "",
        
    },
    bsc: {
        key:              TARGET_CHAIN_CORE_INFO.bsc.key,
        chainId :         TARGET_CHAIN_CORE_INFO.bsc.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.bsc.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.bsc.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.bsc.explorer + "/token/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.bsc.explorer}/nft/{0}/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.bsc.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.bsc.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.bsc.explorer + "/address/",
        transaction_type: TRANSACTION_TYPE.None,
        chainName: 'BNB Smart Chain' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'BNB' : 'tBNB',
        coinSymbol: IS_MAINNET ? 'BNB' : 'tBNB',
        coinDeicmals: 18,
        iconURL:  "",
        
    },
    polygon: {
        key:              TARGET_CHAIN_CORE_INFO.polygon.key,
        chainId :         TARGET_CHAIN_CORE_INFO.polygon.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.polygon.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.polygon.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.polygon.explorer + "/token/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.polygon.explorer}/nft/{0}/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.polygon.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.polygon.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.polygon.explorer + "/address/",
        transaction_type: TRANSACTION_TYPE.None,
        chainName: 'Polygon' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'MATIC' : 'tMATIC',
        coinSymbol: IS_MAINNET ? 'MATIC' : 'tMATIC',
        coinDeicmals: 18,
        iconURL:  "",
    },
    pth: {
        key:              TARGET_CHAIN_CORE_INFO.pth.key,
        chainId :         TARGET_CHAIN_CORE_INFO.pth.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.pth.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.pth.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.pth.explorer + "/token/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.pth.explorer}/nft/{0}/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.pth.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.pth.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.pth.explorer + "/address/",
        transaction_type: TRANSACTION_TYPE.None,
        chainName: 'PTH' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'PTH' : 'tPTH',
        coinSymbol: IS_MAINNET ? 'PTH' : 'tPTH',
        coinDeicmals: 18,
        iconURL:  "",
    },
    stream: {
        key:              TARGET_CHAIN_CORE_INFO.stream.key,
        chainId :         TARGET_CHAIN_CORE_INFO.stream.chainId,
        rpcURL:           TARGET_CHAIN_CORE_INFO.stream.rpc,
        explorerURL:      TARGET_CHAIN_CORE_INFO.stream.explorer, 
        explorer_nft:     TARGET_CHAIN_CORE_INFO.stream.explorer + "/token/",
        explorer_nft_id:  `${TARGET_CHAIN_CORE_INFO.stream.explorer}/nft/{0}/{1}`,
        explorer_token:   TARGET_CHAIN_CORE_INFO.stream.explorer + "/token/",
        explorer_tx:      TARGET_CHAIN_CORE_INFO.stream.explorer + "/tx/",
        explorer_account: TARGET_CHAIN_CORE_INFO.stream.explorer + "/address/",
        transaction_type: TRANSACTION_TYPE.None,
        chainName: 'Stream' + (IS_MAINNET? '' :  ' Testnet'),
        coinName: IS_MAINNET ? 'Stream' : 'tStream',
        coinSymbol: IS_MAINNET ? 'STREAM' : 'tSTREAM',
        coinDeicmals: 18,
        iconURL:  "",
    },
}




const makeParamAddChain = (chain: CHAIN): ParamAddChain => {
    const chainInfo = TARGET_CHAIN_INFO[chain]
    return {
        chainId: `0x${chainInfo.chainId.toString(16)}`,
        chainName: chainInfo.chainName,
        iconUrls: chainInfo.iconURL ? [
            chainInfo.iconURL
        ] : [],
        nativeCurrency: {
            name: chainInfo.coinName,
            symbol: chainInfo.coinSymbol,
            decimals: chainInfo.coinDeicmals
        },
        rpcUrls: [
            chainInfo.rpcURL
        ],
        blockExplorerUrls: [
            chainInfo.explorerURL
        ]
    }
}

export const ACTIVE_NETWORKS: CHAIN[] = [
    CHAIN_KEY.eth,
    CHAIN_KEY.bsc,
]
export const USE_NETWORKS:ParamAddChain[] = ACTIVE_NETWORKS.map(chain => makeParamAddChain(chain));
export const TX_WAIT_TIME_MS = 30 * 1000;


export function eth2wei(eth: number| string): BigNumber {
    if(eth) {
        try{
            return ethers.utils.parseEther(eth.toString());
        } catch(error) {
            // console.error('eth2wei error :: ', error)
        }
    }
    return BigNumber.from(0);
}
export function wei2eth(wei: bigint | BigNumber | string): number {

    if(wei) {
        try{
            return Number(ethers.utils.formatEther(wei));
        } catch(error) {
            // console.error('wei2eth error :: ', error)
        }
    }
    return 0;
}

// USDT와 같은 6 decimals 토큰용 변환 함수들
export function token2wei(amount: number | string, decimals: number = 6): BigNumber {
    if(amount) {
        try{
            return ethers.utils.parseUnits(amount.toString(), decimals);
        } catch(error) {
            // console.error('token2wei error :: ', error)
        }
    }
    return BigNumber.from(0);
}

export function wei2token(wei: bigint | BigNumber | string, decimals: number = 6): number {
    if(wei) {
        try{
            return Number(ethers.utils.formatUnits(wei, decimals));
        } catch(error) {
            // console.error('wei2token error :: ', error)
        }
    }
    return 0;
}

export function getChainInfo(chainId: number | string): ChainInfo | undefined {
    return Object.values(TARGET_CHAIN_INFO).find(chain => chain.chainId === Number(chainId))
}

export function getChainInfoByKey(key: CHAIN): ChainInfo {
    return TARGET_CHAIN_INFO[key]
}
