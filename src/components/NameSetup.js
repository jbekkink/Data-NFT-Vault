import { useState } from 'react';
import '../css/NameSetup.css';
import { claimUsername, setUsername } from './iexec';
import {uploadFailed, uploadSuccessful, loadingNotif} from './Notifications';
import toast from 'react-hot-toast';

let loading;
const delay = ms => new Promise(res => setTimeout(res, ms));

export default function NameSetup(props) {
    const [name, setName] = useState("");
    const [changeAvailable, setChangeAvailable] = useState(false);

    async function claimName() {
        loading = loadingNotif('Claiming username...');
        const res = await claimUsername(props.iexec, props.id, name.toLowerCase())();
        if(res === 0) {
            toast.dismiss(loading);
            uploadFailed('Username already taken');
        }
        else {
            await delay(15000);
            setChangeAvailable(true);
            toast.dismiss(loading);
        }
    }

    async function changeName() {
        
        const username = await setUsername(props.iexec, name)();
        if(username) {
            uploadSuccessful('Name changed successfully');
            props.setDisplayName(name + '.users.iexec.eth');
        }
    }

    return(
        <div className="name-box">
            <button className="close-button" onClick={() => props.setNameBox(false)}>Close</button>
            <div>
                <h2>Set Account Name</h2>
            </div>
            <div className='input-row'>
                <input type="text" placeholder="Enter name" onChange={(e) => setName(e.target.value)}></input>
                <button className='username-button' onClick={async () => claimName()}>Claim name</button>
            </div>
            <div className='input-row'>
                {changeAvailable && 
                <>
                    <input type="text" placeholder={name}onChange={(e) => setName(e.target.value)}></input> 
                    <button className='username-button'  onClick={async () => changeName()}>Set Account Name</button>
                </>}
            </div>
        </div>
    ); 
}