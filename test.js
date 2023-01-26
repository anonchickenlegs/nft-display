import { FetchNFTClient } from "@audius/fetch-nft";
import fetch from "node-fetch"
import sharp from "sharp"
import fspromise from "fs/promises"
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const COLLECTION_ADDRESSES = {
  "0x79fcdef22feed20eddacbb2587640e45491b757f": true,
};
const WALLET = "0x4a36d0CAFE9a052493725B99AeF80A70C25598cD";
// Initialize fetch client
const openSeaConfig = {
  apiKey: process.env.OPENSEA_API_KEY,
};
const fetchClient = new FetchNFTClient({openSeaConfig});

const fetchNFTS = async () => {
    // Fetching all collectibles for the given wallets
    const response = await fetchClient.getCollectibles({
      ethWallets: [WALLET],
    });
    
    //mfers do what they want
    const NFTS = response["ethCollectibles"][WALLET]
    return NFTS
}

const storeImagesInDirectory = async (nft) => {
    const imageResponse = await fetch(nft.imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await sharp(buffer).toFile(`images/${nft.name}${nft.tokenId}.png`)
}

const createGallery = async () => {

    while (true) {
        try {
            const listOfImages = await fspromise.readdir("./images")
            const hashOfImages = {}
            listOfImages.forEach((img) => {
                hashOfImages[img] = false
            })

            console.log("fetching nfts")
            const NFTS = await fetchNFTS();

            for (let i = 0; i < NFTS.length; i++) {
                const nft = NFTS[i]
                const nftFileName = `${nft.name}${nft.tokenId}.png`
                console.log(nft.assetContractAddress)
                if (COLLECTION_ADDRESSES[nft.assetContractAddress.trim()]) {
                    console.log("bananan")
                    if (nft.imageUrl && !hashOfImages[nftFileName]) {
                        hashOfImages[nftFileName] = true
                        await storeImagesInDirectory(nft);
                        await new Promise((r) => setTimeout(r, 2000));
                        console.log('stored image')
                    }
                }
            }
            
            for (let i = 0; i < Object.keys(hashOfImages).length; i++) {
                console.log(hashOfImages)
                const key = Object.keys(hashOfImages)[i];
                console.log(key)
                const value = hashOfImages[key]
                console.log(value)
                if (!value) {
                    await fspromise.unlink(`./images/${key}`)
                    await new Promise((r) => setTimeout(r, 2000));
                }
            }

        } catch (error) {
            console.log(error)
            console.log("trying again")
        }
        console.log("waiting 5 seconds")
        await new Promise((r) => setTimeout(r, 10000));
    }
}


createGallery()


