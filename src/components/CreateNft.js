import React from 'react';
import '../css/createDataset.css';
import { encryptDataset, createDatasetNFT, pushSecret } from './iexec';
import toast from 'react-hot-toast';
import { uploadFailed, loadingNotif, uploadSuccessful } from './Notifications';
import {Link} from 'react-router-dom';

class CreateNft extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            filename: "",
            uploadStatus: false,
            NFTStatus: false,
            secretStatus: false,
            isSuccessful: false,
            fileTitle: "",
            NFTButton: <></>,
            createMore: <></>,
            submitted: false
        }
        this.displayStatus = this.displayStatus.bind(this);
        this.onSubmitTask = this.onSubmitTask.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.upload = this.upload.bind(this);
        this.refreshPage = this.refreshPage.bind(this);
        this.NFTAddress = "";
    }

    onFileChange = event => {
        this.setState({selectedFile: event.target.files[0], filename: event.target.files[0].name});
        event.preventDefault();
    }

    onTitleChange = event => {
        this.setState({fileTitle: event.target.value});
        event.preventDefault();
    }

    async displayStatus(input) {
       this.setState(input);
    }

    refreshPage() {
        window.location.reload(false)
    }

    async upload(iexec, file) {
        const loading = loadingNotif('Creating NFT...'); //Start loading notification
        try {
            const res = await encryptDataset(iexec, file)(); //res[0]: filename, res[1]: multiaddress, res[2]: checksum, res[3]: Encryption Key

            if(res) {
                await this.displayStatus({uploadStatus: true})
            }
            this.NFTAddress = await createDatasetNFT(iexec, this.state.fileTitle, res[1], res[2])();
            
            if(this.NFTAddress) {
                await this.displayStatus({NFTStatus: true})
            }
            const push = await pushSecret(iexec, this.NFTAddress, res[3])(); 
            toast.dismiss(loading); //Remove loading notification
            if(push) {
                this.displayStatus({secretStatus: true})
            }

        }
        catch(error) {
            this.refreshPage();
            this.setState({selectedFile: null, filename: "", uploadStatus: false, NFTStatus: false, secretStatus: false, fileTitle: ""}); //Reset state
        }
    }

    async onSubmitTask (event) {
        event.preventDefault();
        this.setState({ submitted: true});
        try {
            console.log(this.state.selectedFile);
            if(!this.state.selectedFile) throw Error('No file Selected');
            await this.upload(this.props.iexec, this.state.selectedFile);
            this.setState({selectedFile: null, filename: "", fileTitle: ""}); //Reset state
            this.setState({NFTButton: <Link to={`/manage-nft/${this.NFTAddress.toLowerCase()}`}><button className='goto-nft'>Continue</button></Link>});
            this.setState({createMore: <button className='goto-create' onClick={this.refreshPage}>Create Another NFT</button>});
            uploadSuccessful('NFT successfully created.'); //Notify the user the upload was successful 
            this.setState({isSuccessful: true}); 
        }
        catch(error) {
            this.refreshPage();
            this.NFTAddress = "";
            this.setState({selectedFile: null, filename: "", uploadStatus:false, NFTStatus: false, secretStatus: false, fileTitle: ""}); //Reset state
        }
    }

    render() {   
        return (
        <>
            <div className='dataset-upload'>
                <div className="upload-box">
                    <div className="dataset-title">
                        <h2>Create a NFT</h2>
                    </div>
                    <div className='upload-text'>
                        <p>Easily upload any file as a <strong>NFT</strong>. Your file will get encrypted and pushed to IPFS,
                            while the encryption key gets pushed to the iExec SMS (Secret Management Service). Only you, the NFT owner, 
                            is in control of the price of the NFT, the volume, and which Dapps have permission to use the NFT.
                        </p>
                    </div>
                    {!this.state.submitted && <form className="form">
                        <div className="title-input">
                            <label>Title</label>
                            <input id="title" type="text" name="title" placeholder="MyNFT.jpg" maxLength="20" minLength="1" onChange={this.onTitleChange} required/>
                        </div>
                        <label htmlFor="file-upload" className="dataset-button">Select File</label>
                        <input type="file" id="file-upload" onChange={this.onFileChange} />
                        {this.state.filename && <span>Selected File: {this.state.filename}</span>}
                        <button type="submit" onClick={async (event) => this.onSubmitTask(event)}>Create NFT</button>
                    </form>}
                    <div className="status-list">
                        <ul>
                        {this.state.uploadStatus && <li><p className="status"><span className="material-symbols-outlined">done</span>Encrypted File Uploaded</p></li>}
                        {this.state.NFTStatus && <li><p className="status"><span className="material-symbols-outlined">done</span>NFT successfully deployed</p></li>}
                        {this.state.secretStatus && <li><p className="status"><span className="material-symbols-outlined">done</span>Secret succesfully pushed to the SMS</p></li>}
                        </ul>
                    </div>
                    {this.state.isSuccessful && this.state.createMore && this.state.NFTButton && <div className="result-buttons">
                        {this.state.createMore}
                        {this.state.NFTButton}
                    </div>}
                </div>
            </div>
            <div className='credit'>
                <p className='credit-text'>Dapp created by <a href="https://twitter.com/joeybekkink">Joey Bekkink</a></p>
            </div>
        </>
        );

    }
}

export default CreateNft;