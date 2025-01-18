    import React, { useState, useEffect } from "react";
    import * as web3 from "@solana/web3.js";
    import { toast } from "react-toastify";
    import { useConnection, useWallet } from "@solana/wallet-adapter-react";
    import { ExternalLinkIcon } from "@heroicons/react/outline";
    import { Program, AnchorProvider } from "@coral-xyz/anchor";
    import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet"; //to make the web3.js wallet compatable with Anchor. 
    import CounterIDL from "../../programs/idls/counter.json"; 
    import { Counter } from "../../programs/types/counter";
    import { Keypair, PublicKey } from "@solana/web3.js";
import { start } from "repl";

    const starter = () => {
        const [counterKey, setCounterKey] = useState("");// here we are storing the public key of the counter
        const [count, setCount] = useState(0); //storing the current counter of the counter. 
        const [txSig, setTxSig] = useState("");
        const { connection } = useConnection();  //store the transaction signature of the most recent transaction.
        const { publicKey, wallet } = useWallet(); //here I am just using publicKey and wallet, not sendTransactions, although the finished code has sendTransactions, but the instructions says to only use the two variables. 

            const provider = new AnchorProvider(
                connection,
                wallet?.adapter as unknown as NodeWallet,
                AnchorProvider.defaultOptions()
            );
            
                const counterProgram = new Program(
                    CounterIDL as unknown as Counter,
                    provider
                );

                //here we are preparing the transactions: 
                const getPreparedTransaction = async () => {
                    const { blockhash, lastValidBlockHeight } =
                    await connection.getLatestBlockhash();
                    const txInfo = {
                
                    feePayer: publicKey,
                
                    blockhash: blockhash,
                    lastValidBlockHeight: lastValidBlockHeight,
                    };
                    const transaction = new web3.Transaction(txInfo);
                    return transaction;
                };
            
                const handleInitializeCounter = async () => {
                    if (!connection || !publicKey) { //similar to the last one: Here we are saying if connection and publicKey is not defined, alert the user with the error messgae. 
                    toast.error("Please connect your wallet.");
                    return;
                    }
                    const transaction = await getPreparedTransaction();  //this code is to prepare the transaction? 
                    const counterKeypair = Keypair.generate();
                    const instruction = await counterProgram.methods
                    .initialize()
                    .accounts({
                        payer: publicKey,
                        counter: counterKeypair.publicKey,
                    })
                    .instruction();
                    transaction.add(instruction);
                
                    try {
                    const signature = await provider.sendAndConfirm( //this like of code says: method to send the transaction and wait for confirmation.
                        transaction,
                        [counterKeypair],
                        {
                        skipPreflight: true,
                        }
                    );
                    setTxSig(signature);
                    setCounterKey(counterKeypair.publicKey.toBase58());
                    } catch (error) {
                    console.log(error);
                    toast.error("Transaction failed!");
                    }
                };
            
                const handleIncrementCounter = async () => { //incrementing the counter... basically repeating very similar structure to handleInitializeCounter
                    if (!connection || !publicKey) {
                    toast.error("Please connect your wallet.");
                    return;
                    }
                
                    const transaction = await getPreparedTransaction();
                    const instruction = await counterProgram.methods
                    .increment()
                    .accounts({
                        counter: new PublicKey(counterKey),
                    })
                    .instruction();
                    transaction.add(instruction);
                
                    try {
                    const signature = await provider.sendAndConfirm(transaction, [], { 
                        skipPreflight: true,
                    });
                    setTxSig(signature);    //we are mounting the useState with each new render. 
                    } catch (error) {
                    console.log(error);
                    toast.error("Transaction failed!"); //alerting the user if there is error. we are using a try/catch statement. 
                    }
                };

                useEffect(() => { //using useEffect to update the UI each time it gets updated. this useEffect is 
                    //recording when the counterKey, txSig, or connection changes, so each time it changes, then this codebase runs. 
                    const getInfo = async () => {
                    if (connection && publicKey && counterKey) {
                        try {
                        const currentCount = await counterProgram.account.counter.fetch( // this piece of code`counterProgram.account.counter.fetch` helps us to fetch or get the counter account, we use await here too. 
                            new PublicKey(counterKey)
                        );
                        setCount(currentCount.count);
                        } catch (error) {
                        console.log(error);
                        }
                    }
                    };
                    getInfo();
                }, [connection, publicKey, counterKey, txSig]);

                const outputs = [ //sitting the output array to two objects, similar to what we did in the previous code base... 
                    {
                    title: "Counter Value...",
                    dependency: count,
                    },
                    {
                    title: "Latest Transaction Signature...",
                    dependency: txSig,
                    href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
                    },
                ];
                
                return (
                    <main className="min-h-screen text-white max-w-7xl">
                    <section className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4">
                        <form className="rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-2xl text-[#fa6ece]">
                            Create Counter 💸 
                            {/* alot of jsx but just main things are a button to initilize the counter, calling onCLick event handerl 
                            and another button for incrementing the counter by passing on the counterkey values, and handleIncrement counter and handle initilize counter functions. */}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleInitializeCounter();
                            }}
                            disabled={!publicKey}
                            className={`disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] 
                                rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent 
                                border-2 border-transparent hover:border-[#fa6ece]`}
                            >
                            Initialize Counter
                            </button>
                            {counterKey && (
                            <p className="text-sm text-gray-400">Counter Key: {counterKey}</p>
                            )}
                            <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleIncrementCounter();
                            }}
                            disabled={!publicKey || !counterKey}
                            className={`disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] 
                                rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent 
                                border-2 border-transparent hover:border-[#fa6ece]`}
                            >
                            Increment Counter
                            </button>
                        </div>
                        <div className="text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
                            <ul className="p-2">
                            {outputs.map(({ title, dependency, href }, index) => (
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
                
            export default starter;
           