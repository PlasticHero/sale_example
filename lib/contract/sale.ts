import { ethers } from "ethers";


export function makeDataDeposit(usdt: string, amount: string): string {
    const iface = new ethers.utils.Interface(['function deposit(address usdt, uint256 amount) external']);
    return iface.encodeFunctionData('deposit', [usdt, amount]);
}

export function makeDataApprove(usdt: string, amount: string): string {
    const iface = new ethers.utils.Interface(['function approve(address spender, uint256 amount) external']);
    return iface.encodeFunctionData('approve', [usdt, amount]);
}