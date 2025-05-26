import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount,  publicKey} from "@metaplex-foundation/umi";

//created connection to Solana Devnet.
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

//created user.
const user = await getKeypairFromFile();

//airdropped sol to user
await airdropIfRequired(
    connection, 
    user.publicKey, 
    1 * LAMPORTS_PER_SOL, 
    0.5 *LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

//created a umi instance to interact with metaplex.
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

//created a umi instance for the user who is the default signer for all the transactions.
const umiUser =  umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up umi instance for user");


const collectionAddress = publicKey("AjdeBijYQ4JcmGm9PZAHNrJPtNDn9LTPjqkk2vXEPHcx");

console.log(`Creating Nft...`);


const mint = generateSigner(umi);


const transaction = await createNft(umi, {
    mint,
    name: "The Cigg",
    uri: "https://raw.githubusercontent.com/HimakshP/create-nft-bootcamp/main/cigg-metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection:{
        key: collectionAddress,
        verified: false,
    },
})

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(`Nft is created!! Address is ${getExplorerLink(
    "address",
    createdNft.mint.publicKey,
    "devnet"

)}`
);