import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export default function CustomConnectButton() {
  const { status: sessionStatus } = useSession();
  const { status: walletStatus } = useAccount();

  useEffect(() => {
    if (sessionStatus === "authenticated" && walletStatus === "disconnected") {
      console.debug("signOut to sync session state with wallet");
      signOut({ redirect: false });
    }
  }, [sessionStatus, walletStatus]);

  return <ConnectButton showBalance={false} />;
}
