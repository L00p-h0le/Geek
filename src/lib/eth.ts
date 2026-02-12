import { mnemonicToSeed } from "bip39";
import { HDNodeWallet } from "ethers";
import { formatEther } from "ethers";
import { ethprovider } from "./provider";

export async function getEthbalance(
    address: string
): Promise<string> {
    const balance = await ethprovider.getBalance(address);
    return formatEther(balance);
}

export async function deriveEthsigner(
    mnemonic: string,
    index: number
) : Promise<HDNodeWallet>{
    const seed = await mnemonicToSeed(mnemonic);
    const root = HDNodeWallet.fromSeed(seed);
    const path = `m/44'/60'/0'/0/${index}`;
    const signer = root.derivePath(path).connect(ethprovider);

    return signer;
}

export async function deriveEthaddress(
    mnemonic: string,
    currentIndex: number
): Promise<string> {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/0'/0/${currentIndex}`;
                 
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
                 
    const wallet = child;

    return wallet.address;
}