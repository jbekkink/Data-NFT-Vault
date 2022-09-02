import React, { useEffect, useState } from 'react';
import '../css/resNavBar.css';
import logo from '../assets/logo-white.svg';
import { Link, NavLink } from 'react-router-dom';

const Sidebar = () => {
    const [isFull, setIsFull] = useState(true); 
    const toggle = () => {
        setIsFull (!isFull);
    }

    useEffect(() => {
        const items = [document.querySelector('.dataset-upload'), document.querySelector('.display'), document.querySelector('.dataset-display'),document.querySelector('.wallet-display')];

        if(!isFull) {
            for(let i = 0; items.length; i++) {
                if(items[i]) {
                    console.log(i);
                }
            }
        }
    }, [isFull]);

    const menuItem = [
    {
        path: "/",
        name: "Wallet",
        icon: <span class="material-symbols-outlined">
        account_balance_wallet
        </span>
    },
    {
        path: "/manage-nft",
        name: "Manage NFT",
        icon: <span class="material-symbols-outlined">
        settings
        </span>
    },
    {
        path: "/create-nft",
        name: "Create NFT",
        icon: <span class="material-symbols-outlined">
        add_box
        </span>
    },

    ];
    return (
        <div className='nav-container'>
            <div className='navbar' style={{width: isFull ? "18%" : "5%"}}>
                <div className="top-section">
                    <h1 className='logotitle' style={{display: isFull ? "block": "none"}}>Data NFT Vault</h1>
                </div>
                <div className='menu-items'>
                {
                    menuItem.map((item, index) => (
                        <NavLink to={item.path} key={index} className="nav-option">
                            <div className='menu-icon'>{item.icon}</div>
                            <div className="link-text" style={{display: isFull ? "block": "none"}}>{item.name}</div>
                        </NavLink>

                    ))
                }
                </div>
                <div className='powered-box' >
                    <p className='powered-by' style={{display: isFull ? "block": "none"}}>Powered by</p>
                    <Link to="/"><img style={{display: isFull ? "block": "none"}}className="logo" alt="logo" src={logo}/></Link>
                </div>
            </div>
        </div>

    );

}

export default Sidebar;