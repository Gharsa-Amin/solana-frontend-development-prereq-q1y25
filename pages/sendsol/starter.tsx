    // import BoilerPlate from '../../components/BoilerPlate';
    import React, { useState, useEffect } from "react";
    import * as web3 from "@solana/web3.js";
    import { toast } from "react-toastify"; //for displaying notifications.. 
    import { useConnection, useWallet } from "@solana/wallet-adapter-react";
    import { ExternalLinkIcon } from "@heroicons/react/outline"; //display icons to the user.. 

    const Starter = () => {
        const [account, setAccount] = useState("");
        const [amount, setAmount] = useState(0);
        const [balance, setBalance] = useState(0);
        const [txSig, setTxSig] = useState("");
        const { connection } = useConnection();
        const { publicKey, sendTransaction } = useWallet();

        const handleTransaction = async () => {        // calling on async anonymous function 
            if (!connection || !publicKey) {  //we are saying if there is no connection, and public key, then throw an error saying connect to ur wallet. 
            toast.error("Please connect your wallet.");
            return;
            }
        
            const { blockhash, lastValidBlockHeight } = // codealong says temporal information, what does temporal info mean? 
            await connection.getLatestBlockhash();
            const txInfo = {
            // feePayer is set to PublicKey 
            feePayer: publicKey,
           //and blockchash is set to the value of blockhash 
            blockhash: blockhash,
        
            lastValidBlockHeight: lastValidBlockHeight,
            };
            const transaction = new web3.Transaction(txInfo);
            const instruction = web3.SystemProgram.transfer({
            fromPubkey: publicKey,
            lamports: amount * web3.LAMPORTS_PER_SOL,
            toPubkey: new web3.PublicKey(account),
            });
        
            transaction.add(instruction);
        
            try {   //using a try catch statment inside our async function.. and using await to await until the results get fetched. 
            const signature = await sendTransaction(transaction, connection); // here we are sending the transactions, to update the UI by calling setTxSig and setBalance. 
            setTxSig(signature);
        
            const newBalance = balance - amount;
            setBalance(newBalance); 
            } catch (error) {    // if there is an error, throw this error. 
            console.log(error);
            toast.error("Transaction failed!");
            }

                useEffect(() => {  // we are calling useEffect to execute when the varaibles change, and each time it mounts. 
                    const getInfo = async () => {
                    if (connection && publicKey) {
                        const info = await connection.getAccountInfo(publicKey);
                        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
                    }
                    };
                    getInfo();
                }, [connection, publicKey]);
                
                const outputs = [   // here we have an output, and this out is an array of objects, each object has it's own values ot title, which are account
                    //balances and transaction signature, and we are calling on the useState initial values of balance and txSig to set the values of dependency be 
                    //those values. 
                    {
                    title: "Account Balance...",
                    dependency: balance,
                    },
                    {
                    title: "Transaction Signature...",
                    dependency: txSig,
                    href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`, // i think this will direct the user to the blockchain explorer to see the transaction hash and activity on sol explorer. 
                    },
                ];

        return (
                <main className="min-h-screen text-white max-w-7xl">
                <section className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4">
                    <form className="rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-2xl text-[#fa6ece]">Send Sol 💸</h2> 
                        {/* this is simple jsx return statements here..  */}
                        <button
                        // here my first button calling event, and using preventDefault to stop reloading the page, and calling onClick event handler and calling
                        //my handletransaction from above here... so basically saying if there is no connection or public key defined, and the user does something, 
                        //call on this function.. 
                        onClick={(e) => {
                            e.preventDefault();
                            handleTransaction();
                        }}
                        
                        disabled={!account || !amount}
                        className={`disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] 
                            rounded-lg w-24 py-1 font-semibold transition-all duration-200 
                            hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]`}
                        >
                        Submit
                        </button>
                    </div>
                    <div className="mt-6">
                        <h3 className="italic text-sm">Address of receiver</h3>
                        <input
                        id="account"
                        type="text"
                        placeholder="Public key of receiver"
                        className="text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white"
                        onChange={(event) => setAccount(event.target.value)} // here calling on my onChange and sitting its value to event.target.value. 
                        />
                    </div>
                    <div className="mt-6">
                        <h3 className="italic text-sm">Number amount</h3>
                        <input
                        id="amount"
                        type="number"
                        min={0}
                        placeholder="Amount of SOL"
                        className="text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white"
                        onChange={(event) => setAmount(Number(event.target.value))}
                        />
                    </div>
                    <div className="text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
                        <ul className="p-2">
                        {outputs.map(({ title, dependency, href }, index) => (  //using .map function to iterate over the array, and we are passing on title, dependency and href as props. 
                        //since title is set to be account balance, and transaction signature, we are sitting the key to be the value of title which will be unique keypairs like id. 
                            <li
                            key={title}
                            className={`flex justify-between items-center ${
                                index !== 0 && "mt-4"
                            }`}
                            >
                            <p className="tracking-wider">{title}</p>
                            {dependency && (
                                <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex text-[#80ebff] italic ${
                                    href && "hover:text-white"
                                } transition-all duration-200`}
                                >
                                {dependency.toString().slice(0, 25)}
                                {href && <ExternalLinkIcon className="w-5 ml-1" />}
                                </a>
                            )}
                            </li>
                        ))}
                        </ul>
                    </div>
                    </form>
                </section>
                </main>
            );
        }
    
    
    
    
    
    
    }
        


    export default Starter;