import React, {useState} from 'react';
import '../css/manageDataset.css';
import {gql, useSubscription} from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const NFT_PAGE_LENGTH = 9;
const GetDatasets = gql`
subscription getDatasets($id: String, $length: Int, $skip: Int) {
    account(id: $id) {
        datasets(first: $length, orderBy:timestamp, skip: $skip, orderDirection: desc){
            name
            timestamp
            id
            usages {
                datasetPrice
            }
        }
    }
}`;

export default function ManageDataset(props) {
    const [page, setPage] = useState(0);
    const navigate = useNavigate();

    //Shorten addresses to only display a few characters of the string
    function Shorten(text) {
        return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
    }

    //Navigation for the Grid
    function nextPage(length) {
        console.log(length);
        if(length  < NFT_PAGE_LENGTH) return;
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
    
    //Display 9 NFTs per page
    const sub = useSubscription(GetDatasets, {
        variables: { skip: NFT_PAGE_LENGTH * page, length: NFT_PAGE_LENGTH, id: props.id },
    });
    const datasets = !sub.loading && sub.data && sub.data.account && sub.data.account.datasets;

    return (
    <div className='dataset-display'>
       <div className='your-nfts'>
            <div className="grid-title">
                <h3>Your NFTs</h3>
                <div className='grid-buttons'>
                    {datasets && <button onClick={() => prevPage()}>Previous</button>}
                    {datasets && <button onClick={() => nextPage(datasets.length)}>Next</button>}
                </div>
            </div>
            <div className="boxes">
                {datasets &&
                datasets.map(({ timestamp, name, id, usages }) => 
                <div className="box" key={id} onClick={() => {navigate(`/manage-nft/${id}`)}}>
                    <div className='toptext'>
                        <p>{tasksCompleted(usages.length)} | {totalPrice(usages)} RLC Earned</p>
                    </div>
                    <div className="box-info">
                        <h4>{name}</h4>
                        <p className='useraddr'>{Shorten(id)}</p>
                    </div>
                    <div className="box-uploaded">
                        <p><strong>Upload Date: </strong></p>
                        <p>{(new Date(timestamp * 1000)).toLocaleString()}</p>
                    </div>
                </div>)}
                {!datasets && <p className='unavailable'>No NFTs uploaded yet...</p>}
            </div>
        </div>
    </div>);
}