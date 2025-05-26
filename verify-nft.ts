import { findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";

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

const nftAddress = publicKey("33UVDTkPLETkUeuHYBS5fDgNKcNE6LEdCCSe5aucG8FU");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {mint : nftAddress}),
    collectionMint: collectionAddress,
    authority: umi.identity,
});

transaction.sendAndConfirm(umi);

console.log(`Nft ${nftAddress} is verified as the member of collection ${collectionAddress}. See on explorer ${getExplorerLink(
    "address",
    nftAddress,
    "devnet")
}`);

