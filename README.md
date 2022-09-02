# iExec NFT Manager

With the iExec NFT Manager, users will be able to easily upload their NFT, and rent this NFT so that other Dapps on the iExec blockchain can use the NFT. 

## Installation

Install all of the required modules in order for this Dapp to work.

```bash
npm install
```
## Running the Dapp
After completing the steps described above, the dapp is ready to be used! 

1. Open a terminal in the directory / folder of the NFT Manager Dapp. 
2. Run the Dapp with the following line:
```bash
npm start
```

## Usage 
Overview of the features of this NFT manager dapp. 

### Connecting with Metamask 
Before you can interact with the dapp, you will need to connect to the dapp with Metamask. If you haven't installed Metamask, make sure to install the extension. If installed, you will automatically get prompted by Metamask to login and connect to the iExec Sidechain. 

### Creating a NFT
The process of creating a NFT is very straightforward. You can select any file, and upload this. Your file will get encrypted before it gets uploaded to the IPFS. The original file is never published anywhere, it stays on your device. 

### Manage a NFT
With iExec, it's possible to rent your NFT to other users. On this page, you can create an order for a NFT by just setting a few parameters: 

#### Price 
The price a user would have to pay for renting your NFT.

#### Volume 
The number of times your NFT can be used for this order. 

#### Restrict to Dapp
You are able to restrict your NFT to specific Dapps. You can then enter the address of this dapp in this field. Now, only this Dapp is able to use your NFT for a request, while the rest of the Dapps won't be able to use your NFT. 

## License
[MIT](https://choosealicense.com/licenses/mit/)