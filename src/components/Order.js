import React, { useState, useEffect } from "react";
import {gql, useSubscription} from '@apollo/client';
import {publishOrder, showOrderbook, unpublishOrder} from './iexecOrder';
import '../css/CreateDatasetOrder.css'
import { useParams } from "react-router-dom";
import { uploadSuccessful, uploadFailed, copyToClipBoard } from './Notifications';

const GET_ORDERS = gql`
subscription getOrders($id: String){
    dataset(id: $id) {
        usages(orderBy: timestamp, orderDirection: desc) {
            id
            timestamp
            app {
                id
            }
            datasetorder {
                datasetprice
            }
        }
    }
}`;

function Order(props) {
    const [usages, setUsages] = useState([]);
    const [display, setDisplay] = useState([]);
    const [price, setPrice] = useState(0);
    const [volume, setVolume] = useState(1);
    const [appRestrict, setAppRestrict] = useState("0x0000000000000000000000000000000000000000");
    const [orderHash, setOrderHash] = useState("");
    const [orderDisplay, setOrderDisplay] = useState([]);
    const [filledAppRestrict, setFilledAppRestrict] = useState("0x0000000000000000000000000000000000000000");
    const [filled, setFilled] = useState(false);

    const datasetAddress = useParams().id;

    function copyText(text) {
        copyToClipBoard('Copied to clipboard!');
        navigator.clipboard.writeText(text);
    }

    async function update() {
        let list = []
        for(let i = 0; i < usages.length; i++) {
            list.push(
                <tr key={i}>
                    <td>{new Date(usages[i].timestamp * 1000).toLocaleString()}</td>
                    <td>{usages[i].datasetorder.datasetprice}</td>
                    <td className="app-id" title={usages[i].app.id}>{Shorten(usages[i].app.id)} <span className="material-symbols-outlined" title="Click to Copy!" onClick={() => {copyText(usages[i].app.id)}}>content_copy</span></td>
                    <td className="deal-id" title={usages[i].id}>{Shorten(usages[i].id)} <span className="material-symbols-outlined" title="Click to Copy!" onClick={() => {copyText(usages[i].id)}}>content_copy</span></td>
                </tr>
            )
        }
        setDisplay(list);

    }
    function Shorten(text) {
        return text.substring(0,6) + '..' + text.substring((text.length - 3), text.length);
    }

    async function displayOpenOrders() {
        let order = [];
        const orders = await showOrderbook(props.iexec, datasetAddress, filledAppRestrict)();
        for(let i =  0; i < orders.count; i++) {
            var date = new Date(orders.orders[i].publicationTimestamp).toLocaleString();
            order.push(
                <tr key={i} title={`Restricted to: ${orders.orders[i].order.apprestrict}`}>
                    <td>{date}</td>
                    <td>{orders.orders[i].order.datasetprice}</td>
                    <td>{orders.orders[i].order.volume}</td>
                    <td>{orders.orders[i].remaining}</td>
                    <td><span className='action' onClick={(e) =>UnpublishOrder(e, orders.orders[i].orderHash)}>unpublish</span></td>
                </tr>
            )
        }
        setOrderDisplay(order);
    }

    async function PublishOrder() {
        const orderHash = await publishOrder(props.iexec, datasetAddress, price, volume, appRestrict)();
        if(orderHash) {
            setOrderHash(orderHash);
            uploadSuccessful('NFT Order Successfully Published!');
            await displayOpenOrders();
        }
    }

    async function UnpublishOrder(e, orderHash) {
        e.preventDefault();
        try {
            await unpublishOrder(props.iexec, orderHash)();
            uploadSuccessful('NFT Order Unpublished!');
            await displayOpenOrders();
        }
        catch(error) {
            uploadFailed('Could not unpublish order');
            console.error(error);
        }  
    }

    function changePrice(e) {
        setPrice(e.target.value);
    }

    function changeVolume(e) {
        setVolume(e.target.value);
    }

    function changeAppRestrict(e) {
        setAppRestrict(e.target.value);
    }

    function changeFilledAppRestrict(e) {
        setFilledAppRestrict(e.target.value);
    }

    
    const sub = useSubscription(
        GET_ORDERS, 
        {variables: {
            id: datasetAddress,
        },
        onSubscriptionData: (data) => {
                const message = data.subscriptionData.data.dataset.usages;
                
                if(message.length === usages.length) {
                    return;
                }
                setUsages(message);
                
                if(usages.length === 0) {
                    return;
                }
                setFilled(true);
                
        }
    });

    const firstusage = !sub.loading && sub.data && sub.data.dataset.usages;
    
    useEffect(() => {
        async function refresh() {
            await displayOpenOrders();
        }
        if(filled) {
            refresh();
            uploadSuccessful('Order Filled');
            setFilled(false);
        }
    }, [filled]);

    useEffect(() => {
        if(firstusage === false) return;
        update();
        async function display() {
            await displayOpenOrders();
        }
        display();
    }, [firstusage]);

    return (
<div className="display">
    <div className="cont_anime">
        <div className="rond_2"></div>
        <div className="rond_3"></div>
        <div className="rond_4"></div>
        <div className="rond_5"></div>
    </div>
    <div>
        <h2 className="title-rent">Rent your NFT</h2>
    </div>
    <div className="manage-container">
        <div className="create-order-box">
            <div className="order-title">
                <div>
                    <h2>Create Order</h2>
                </div>
            </div>
          <div className="create-order">
            <div className="order-price-vol">
                <div className="upload-text">
                    <p>By publishing a NFT order, you will be able to <strong>rent</strong> your NFT to other users. NFTs can be traded on the iExec Marketplace. Whenever
                        a user on the iExec Marketplace <strong>rents</strong> your NFT, you will get paid in RLC. The NFTs are encrypted and even during execution of the Dapp 
                        no one is able to see the underlying datasets of the NFTs. 
                    </p>
                </div>
                <div className="order-section">
                    <label>Price</label>
                    <input id="price" type="number" name="price" min="0" placeholder={price} onChange={changePrice}/>
                </div>
                <div className="order-section">
                    <label>Volume</label>
                    <input id="volume" type="number" name="volume" min="1" placeholder={volume} onChange={changeVolume}/>
                </div>
                <div className="order-section">
                    <label>Restrict to Dapp</label>
                    <input id="apprestrict" type="text" name="apprestrict" placeholder={appRestrict} onChange={changeAppRestrict}/>
                    <p>Enter the address of the Dapp that has the permission to use this NFT. 
                        Leaving this field blank will allow all Dapps to use this NFT. 
                    </p>
                </div>
                
                <button className="publish-button" onClick={PublishOrder}>Publish Order</button>
            </div>
          </div>
        </div>
        
        
        <div className="open-order-box">
            <div className="open-orders">
                <div className="order-title">
                    <div>
                        <h2>Open Orders</h2>
                    </div>
                </div>
                <div className="apprestrict-input">
                    <label>Include orders for dapp:</label>
                    <div>
                        <input id="apprestrict" type="text" name="apprestrict" placeholder={filledAppRestrict} onChange={changeFilledAppRestrict}/>
                        <button onClick={async () => displayOpenOrders()}>View</button>
                    </div>
                </div>
                  <div className="order-display">
                      <table className="table">
                          <thead>
                              <tr>
                                  <th>Time</th>
                                  <th>Price</th>
                                  <th>Volume</th>
                                  <th>Remaining</th>
                                  <th>Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              {orderDisplay}
                          </tbody>
                      </table>
                  </div>
              </div>
        </div>
    </div>
    <div className="filled-order-box">

          <div className='filled-orders'>
              <h2>Filled Orders</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Time</th>
                          <th>Dataset Price</th>
                          <th>App</th>
                          <th>Deal ID</th>
                      </tr>
                  </thead>
                  <tbody>
                      {display}
                  </tbody>
              </table>
          </div>
      </div>

        
</div>
    );
}

export default Order;