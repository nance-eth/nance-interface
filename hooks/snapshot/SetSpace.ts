import snapshot from '@snapshot-labs/snapshot.js'
import { Signer, Wallet } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount } from "wagmi"
import { useEthersSigner } from '../ViemAdapter';
import useSnapshotSpaceSettings from './SpaceSettings';
import { NANCE_PUBLIC_ADDRESS } from '../../constants/Nance';

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

export default function useSetSpace(
    space: string,
){
    // state
    const [value, setValue] = useState<unknown>()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(undefined);
    // external state
    const signer = useEthersSigner();
    const { address } = useAccount();

    const { data: currentSettings, loading: settingsLoading } = useSnapshotSpaceSettings(space);

    const trigger = useCallback(async () => {
        try {
            currentSettings?.members.push(NANCE_PUBLIC_ADDRESS)
            setError(undefined);
            setLoading(true);
            const receipt = await client.space(
                signer as Signer as Wallet, 
                address as string, 
                {space, settings: JSON.stringify(currentSettings)}
            );
            setValue(receipt);
        } catch(err: any) {
            console.warn("🚨 SetSpace.trigger.error ->", err);
            setError(err);
            setValue(undefined);
        } finally {
            setLoading(false);
        }
        
    }, [signer, address, space, currentSettings]);

    const reset = () => {
        setValue(undefined);
        setError(undefined);
        setLoading(false);
    }
    
    return { trigger, value, loading, error, reset };
}