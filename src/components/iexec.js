import { IExec, utils } from 'iexec';
import {uploadFailed, loadingNotif} from './Notifications';
import toast from 'react-hot-toast';

const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ZGM4YzhkZS1hMTQ4LTRlMzEtYWI0Ni1jN2ZhOTExY2MwZGMiLCJlbWFpbCI6ImpvZXlqb2V5YjA5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI3MjEyZjFhODM1ZTY5OGU1NDQwNiIsInNjb3BlZEtleVNlY3JldCI6IjAwM2IyN2NmMjM1ZjhjYWQ4YjI5ODY1MTk5YzY4ZWFjZGM4MzkxNGMzMjc3ZDJjMzQwYjJiMTRhMGFkMWM4YjkiLCJpYXQiOjE2NjA3MzU5NTR9.Yi764mbXzusnwoJRltbUSRM3Iy8S7-S718Ebts-ZyK0';

const checkName = (iexec, id) => async () => {
    return await iexec.ens.lookupAddress(id);   
}

const claimUsername = (iexec, id, username ) => async() => {  
  const owner = await iexec.ens.getOwner(username + '.users.iexec.eth');
  if(owner === id) {
    uploadFailed('You already own this name');
    return; 
  }
  if(owner !== '0x0000000000000000000000000000000000000000') {
    return 0;
  }
  const domain = await iexec.ens.getDefaultDomain(id);
  const { name, registerTxHash } = iexec.ens.claimName(username, domain);
  return name;
}

const setUsername = (iexec, username) => async () => {
    const loading = loadingNotif('Setting username...');
    const { address, name_ } = await iexec.ens.configureResolution(username + '.users.iexec.eth');
    console.log('configured resolution:', address, '<=>', name_);
    toast.dismiss(loading);
    return address;
}

function bearertokenSet() {
    if(TOKEN) return true;
    return false; 
    
}

const generateDatasetKey = (iexec) => () => {
    try {
      const key = iexec.dataset.generateEncryptionKey();
      console.log('Dataset Key Generated');
      return key;
    } catch (error) {
      uploadFailed(error);
    }
};

/* const encryptDataset = (iexec, file, user_filename) => async () => {
  try {
    if (!file) {
      throw Error("No file selected");
    }
    const filename = user_filename;

    const fileBytes = await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => resolve(e.target.result);
      fileReader.onerror = () =>
        reject(Error(`Failed to read file: ${fileReader.error}`));
      fileReader.onabort = () => reject(Error(`Failed to read file: aborted`));
    });

    const key = generateDatasetKey(iexec)();
    const encrypted = await iexec.dataset.encrypt(fileBytes, key);
    const checksum = await iexec.dataset.computeEncryptedFileChecksum(encrypted);
    
    var data = new FormData();
    data.append('file', new Blob([encrypted]));
    var config = {
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      headers: { 
        'Authorization': TOKEN
      },
      data : data
    };

    const res = await axios(config);
    const cid = res.data.IpfsHash;
    const multiaddr=`/ipfs/${cid}`;
    const ipfs_url = `https://gateway.pinata.cloud${multiaddr}`+ '?filename=' + filename + '.enc';

    await fetch(ipfs_url).then((res) => {
      if (!res.ok) {
        throw Error(`Failed to load uploaded file at ${ipfs_url}`);
      }
    });
    return [filename, multiaddr, checksum, key];
  } catch (error) {
    alert(error);
  }
}; */


const encryptDataset = (iexec, file, user_filename) => async () => {
    try {
      if (!file) {
        throw Error("No file selected");
      }
      
      const filename = user_filename;
      const ipfs =  await window.Ipfs.create();
     
      const fileBytes = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => resolve(e.target.result);
        fileReader.onerror = () =>
          reject(Error(`Failed to read file: ${fileReader.error}`));
        fileReader.onabort = () => reject(Error(`Failed to read file: aborted`));
      });
  
      const key = generateDatasetKey(iexec)();
      const encrypted = await iexec.dataset.encrypt(fileBytes, key);
      const checksum = await iexec.dataset.computeEncryptedFileChecksum(encrypted);

      const add = await ipfs.add(new Blob([encrypted]));
      console.log(add);
      const cid = add.path;
      const multiaddr=`/ipfs/${cid}`;
      const ipfs_url = `https://ipfs.io${multiaddr}`+ '?filename=' + filename + '.enc';
      
      await fetch(ipfs_url).then((res) => {
        if (!res.ok) {
          throw Error(`Failed to load uploaded file at ${ipfs_url}`);
        }
      });
      await ipfs.stop();
      return [filename, multiaddr, checksum, key];
    } catch (error) {
      alert(error);
    }
};

const createDatasetNFT = (iexec, filename, input_multiaddr, input_checksum) => async () => {
    try {
      const owner = await iexec.wallet.getAddress();
      const name = filename;
      const multiaddr = input_multiaddr;
      const checksum = input_checksum;
      const { address } = await iexec.dataset.deployDataset({
        owner,
        name,
        multiaddr,
        checksum
      });
      console.log(`Dataset deployed at address ${address}`);
      refreshUser(iexec)();
      return address; 
    } catch (error) {
      alert(error);
    }
};

const pushSecret = (iexec, address, input_key) => async () => {
    try {
      const datasetAddress = address;
      const key = input_key;
      await iexec.dataset.pushDatasetSecret(datasetAddress, key);
      console.log(`Encryption key pushed for datastet ${datasetAddress}`);
      return true; 
    } catch (error) {
      alert(error);
    }
  };


const refreshUser = (iexec) => async () => {
  const userAddress = await iexec.wallet.getAddress();
  /*const [wallet, account] =  await Promise.all([iexec.wallet.checkBalances(userAddress),
    iexec.account.checkBalance(userAddress)]); */
  return userAddress;
}; 

const checkStorage = (iexec) => async () => {
  try {
    const isStorageInitialized = await iexec.storage.checkStorageTokenExists(
      await iexec.wallet.getAddress()
    );
    if(!isStorageInitialized) {
        alert('Please initialize your iExec storage');
        initStorage(iexec)();
    }
  } catch (error) {
    uploadFailed(error);
  }
};

const initStorage = (iexec) => async () => {
  try {
    const storageToken = await iexec.storage.defaultStorageLogin();
    await iexec.storage.pushStorageToken(storageToken, { forceUpdate: true });
    checkStorage(iexec)();
  } catch (error) {
    uploadFailed(error);
  }
};

const init = async () => {
  try {
    let ethProvider;
    if (window.ethereum) {
      console.log("using default provider");
      ethProvider = window.ethereum;
      ethProvider.on("chainChanged", (_chainId) => window.location.reload());
      ethProvider.on("accountsChanged", (_accounts) =>
        window.location.reload()
      );
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x86",
            chainName: "Bellecour (iExec sidechain)",
            nativeCurrency: {
              name: "xRLC",
              symbol: "xRLC",
              decimals: 18
            },
            rpcUrls: ["https://bellecour.iex.ec"],
            blockExplorerUrls: ["https://blockscout-bellecour.iex.ec"]
          }
        ]
      });
    }

    const { result } = await new Promise((resolve, reject) =>
      ethProvider.sendAsync(
        {
          jsonrpc: "2.0",
          method: "net_version",
          params: []
        },
        (err, res) => {
          if (!err) resolve(res);
          reject(Error(`Failed to get network version from provider: ${err}`));
        }
      )
    );
    const networkVersion = result;

    if (networkVersion !== "134") {
      const error = `Unsupported network ${networkVersion}, please switch to Bellecour (iExec Sidechain)`;
      //networkOutput.innerText = "Switch to the iExec Sidechain";
      throw Error(error);
    }

    //networkOutput.innerText = networkOutput.innerText = "Connected to Bellecour (iExec Sidechain)";
    const iexec = new IExec({
      ethProvider
    });

    await refreshUser(iexec)();
    await checkStorage(iexec)();

    console.log("initialized");
    return iexec;
  } catch (e) {
    console.error(e.message);
  }
};

export {init, refreshUser, encryptDataset, createDatasetNFT, pushSecret, checkName, claimUsername, setUsername, bearertokenSet};