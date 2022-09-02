import React, { useEffect, useState } from 'react';
import '../css/UserInfo.css';
import {gql, useQuery, useSubscription} from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { checkName, claimUsername } from './iexec';
import toast from 'react-hot-toast';
import { copyToClipBoard, loadingNotif, uploadFailed, uploadSuccessful } from './Notifications';
import NameSetup from './NameSetup';

const ORDER_PAGE_LENGTH = 3;

const GetDatasets = gql`
query getDatasets($id: String, $length: Int = 6, $skip: Int = 0) {
    account(id: $id) {
        datasets(first: 3, orderBy:timestamp, orderDirection: desc){
            name
            timestamp
            id
            usages {
                datasetPrice
            }
        }
        dealBeneficiary(first: $length, skip:$skip, orderBy: timestamp, orderDirection: desc, where: {datasetOwner: $id}) {
            id
            dataset {
                id
                name
            }
            datasetPrice
            app {
                name
            }
            timestamp

        }
    }
}`;
const GetOrders = gql`
query getDatasets($id: String, $length: Int = 6, $skip: Int = 0) {
    account(id: $id) {
        dealBeneficiary(first: $length, skip:$skip, orderBy: timestamp, orderDirection: desc, where: {datasetOwner: $id}) {
            id
            dataset {
                id
                name
            }
            datasetPrice
            app {
                name
            }
            timestamp

        }
    }
}`;

const AccountInformation = gql`
query AccountInformation($id: String) {
    account(id: $id) {
        datasets {
            id
        }
        balance
    }
}`; 

//Return the welcome text, depending on the current time
function WelcomeText(time) {
    var hours = time.getHours();
    if(hours < 12) return 'Good Morning, ';
    else if(hours < 18) return 'Good Afternoon, ';
    return 'Good Evening, ';
}

export default function UserInfo(props) {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(null);
    const [nameBox, setNameBox] = useState(false);
    const [page, setPage] = useState(0);

    //Execute the subscriptions for account information and datasets information
    const sub = useQuery(GetDatasets, {
        variables: { id: props.id },
    });
    const orders_sub = useQuery(GetOrders, {
        variables: { skip: ORDER_PAGE_LENGTH * page, length: ORDER_PAGE_LENGTH, id: props.id },
    });
    const datasets = !sub.loading && sub.data && sub.data.account && sub.data.account.datasets;
    const deals = !orders_sub.loading && orders_sub.data && orders_sub.data.account && orders_sub.data.account.dealBeneficiary;
    
    const userInfo = useQuery(AccountInformation, {
        variables: { id: props.id },
    });
    const userinfo = !userInfo.loading && userInfo.data && userInfo.data.account;

    //Shorten addresses to only display a few characters of the string
    function Shorten(text) {
        return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
    }
    async function copyText(text) {
        copyToClipBoard('Copied to clipboard!');
        navigator.clipboard.writeText(text);
    }

    function nextPage(length) {
        console.log(length);
        if(length  < ORDER_PAGE_LENGTH) return;
        setPage(page + 1);
    }
    function prevPage() {
        if(page === 0) return; 
        setPage(page - 1);
    }

    function totalPrice(usages) {
        let sum = 0; 
        if(usages.length === 0) return 0;
        for(let i = 0; i < usages.length; i++) {
            sum = sum + parseInt(usages[i].datasetPrice); 
        } 
        return sum;
    } 

    function tasksCompleted(length) {
        return `${length} usages`;
    }

    useEffect(() => {
        async function introName() {
            const name = await checkName(props.iexec, props.id)();
            if(name) setDisplayName(name);
        }
        introName();
    }, []);
    
    return(
        <>
            <div className='wallet-display'>
                <div className='welcome-text'>
                    <h1>{WelcomeText(new Date())} {displayName && displayName.split('.')[0]} {!displayName && Shorten(props.id)}</h1>
                </div>
                <div className='your-datasets'>
                    <div className='section-header'>
                        <h3>Your most recent NFTs</h3>
                        <button onClick={() => {navigate('/manage-nft')}}>View All</button>
                    </div>
                    <div className="boxes">
                        {datasets &&
                            datasets.map(({ timestamp, name, id, usages}) => 
                            <div className="box" id={id} key={id} onClick={() => {navigate(`/manage-nft/${id}`)}}>
                                <div className='toptext'>
                                    <p>{tasksCompleted(usages.length)} | {totalPrice(usages)} RLC Earned</p>
                                </div>
                                <div className="box-info">
                                    <h4>{name}</h4>
                                    <p className='useraddr' >{Shorten(id)}</p>
                                </div>
                                <div className="box-uploaded">
                                    <p><strong>Upload Date: </strong></p>
                                    <p>{(new Date(timestamp * 1000)).toLocaleString()}</p>
                                </div>
                                </div>)}
                                {!datasets && <p className='unavailable'>No NFTs uploaded yet...</p>}
                    </div>
                </div>
                <div className='your-datasets'>
                    <div className='section-header'>
                        <h3>Recent NFT Deals</h3>
                        <div className='grid-buttons'>
                            <button onClick={prevPage}>Previous</button>
                            <button onClick={() => nextPage(deals.length)}>Next</button>
                        </div>
                    </div>
                    <div className="activity-boxes">
                        {deals &&
                        deals.map(({id, dataset, datasetPrice, app, timestamp}) => 
                        <div className='activity-box' id={id} key={id} onClick={() => {navigate(`/manage-nft/${dataset.id}`)}}>
                            <div>
                                <h4>{dataset.name}</h4>
                                <h4 className="price">+{datasetPrice} RLC</h4>
                            </div>
                            <div>
                                <div>
                                    <p className="bottom-info">{app.name}</p>
                                </div>
                                <p className="bottom-info">{(new Date(timestamp * 1000)).toLocaleString()}</p>
                            </div>
                        </div>)}
                        {!deals && <p className='unavailable'>No recent deals available...</p>}
                    </div>
                </div>
            </div>
            <div className='user-display'>
                <div className='user-display-box'>
                    <p>Connected to iExec Sidechain</p>
                </div>
                {!displayName &&
                <div className='user-display-box'>
                    <p className='userdisplay-label'>Account ID</p>
                    <div className='user-addr'>
                        <p title={props.id}>{Shorten(props.id)}</p>
                        <span className="material-symbols-outlined" title="Click to Copy!" onClick={() => {copyText(props.id)}}>content_copy</span>
                    </div>
                </div>}
                
                {displayName && <div className='user-display-box'>
                    <p className='userdisplay-label'>Account Name</p>
                    <p>{displayName}</p>
                </div>}
                <button className="goto-nft" onClick={() => navigate('/create-nft')}>Create a NFT</button>
                <div className='user-display-box'>
                    <p className='userdisplay-label'>Account Balance</p>
                    <h2>{userinfo && userinfo.balance}</h2>
                    <h2>{!userinfo && '0'}</h2>
                </div>
                <div className='user-display-box'>
                    <p className='userdisplay-label'>NFTs uploaded:</p> 
                    <h2>{userinfo && userinfo.datasets.length}</h2>
                    <h2>{!userinfo && '0'}</h2>
                </div>
                <button className="username-button" onClick={() => setNameBox(true)}>Set Account Name</button>
            </div>
            {nameBox && <NameSetup iexec={props.iexec} id={props.id} setNameBox={setNameBox} setDisplayName={setDisplayName}/>}
            
        </>
    );
}