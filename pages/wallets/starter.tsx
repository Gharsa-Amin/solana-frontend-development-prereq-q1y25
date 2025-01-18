 // import BoilerPlate from '../../components/BoilerPlate';

// I do not see some imports in the pre-req guidelines but they are not a part of the finished code:
// like the import * as walletAdapterReact from "@solana/wallet-adapter-react";import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
// or import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// and also   const endpoint = web3.clusterApiUrl("devnet"); and   const wallets = [new walletAdapterWallets.PhantomWalletAdapter()];
// so I won't add them here in my codebase...  

            import * as React from "react";
            import * as web3 from "@solana/web3.js";
            require("@solana/wallet-adapter-react-ui/styles.css");
            import { useState, useEffect } from 'react';
            import { useConnection, useWallet } from "@solana/wallet-adapter-react";
            const Starter = () => {  //changing the () to {} to use logic and state alongside our component, calling functional components. 
                const [balance, setBalance] = React.useState<number | null>(0); //using the UseState hook, and  sitting the initial value of the balance to 0, but why do we use number and null, cant we directly set the value to 0. 
                const { connection } = useConnection();
                const { publicKey } = useWallet();
                
                React.useEffect(() => {
                    const getInfo = async () => {
                    if (connection && publicKey) {
                        // we get the account info for the user's wallet data store and set the balance in our application's state
                        const info = await connection.getAccountInfo(publicKey);
                        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
                    }
                    };
                    getInfo();
                    
                }, [connection, publicKey]);  //when the variables change, the codebase will mount again, and change the state dynamically, rendering a new state. 
        
        
                return (
                    <main className="min-h-screen text-white">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
                        <div className="col-span-1 lg:col-start-2 lg:col-end-4 rounded-lg bg-[#2a302f] h-60 p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-semibold">account info ✨</h2>
                        </div>
                
                        <div className="mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
                            <ul className="p-2">
                            <li className="flex justify-between">
                                <p className="tracking-wider">Wallet is connected...</p>
                                <p className="text-turbine-green italic font-semibold">
                                {publicKey ? "yes" : "no"} 
                                </p>
                            </li>
                
                            <li className="text-sm mt-4 flex justify-between">
                                <p className="tracking-wider">Balance...</p>
                                <p className="text-turbine-green italic font-semibold">
                                {balance} 
                                {/* here we are calling the initial state from the useState defined above! */}
                                </p> 
                            </li>
                            </ul>
                        </div>
                        </div>
                    </div>
                    </main>
                );
            }
        
            export default Starter;