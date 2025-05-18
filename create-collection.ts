import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

//created connection to Solana Devnet.
const connection = new Connection(clusterApiUrl("devnet"));

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

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi , {
    mint: collectionMint,
    name: "My Nft Collection",
    symbol: "MC",
    uri: "https://raw.githubusercontent.com/HimakshP/create-nft-bootcamp/main/collection-metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
})
await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
);
console.log(`Created the collection!! Adderess is ${getExplorerLink(
    "address",
    createdCollectionNft.mint.publicKey, 
    "devnet"
)}`
)


