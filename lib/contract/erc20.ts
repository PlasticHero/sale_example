import { ethers } from "ethers";


export function transfer(to: string, amount: string): string {
    const iface = new ethers.utils.Interface(['function transfer(address to, uint256 amount) external']);
    return iface.encodeFunctionData('transfer', [to, amount]);
}

