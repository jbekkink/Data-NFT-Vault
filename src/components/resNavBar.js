import React, { useEffect, useState } from 'react';
import '../css/resNavBar.css';
import logo from '../assets/logo-white.svg';
import { Link, NavLink } from 'react-router-dom';

const Sidebar = () => {
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
            <div className='navbar'>
                <div className="top-section">
                    <h1 className='logotitle' >Data NFT Vault</h1>
                </div>
                <div className='menu-items'>
                {
                    menuItem.map((item, index) => (
                        <NavLink to={item.path} key={index} className="nav-option">
                            <div className='menu-icon'>{item.icon}</div>
                            <div className="link-text">{item.name}</div>
                        </NavLink>

                    ))
                }
                </div>
                <div className='powered-box' >
                    <p className='powered-by'>Powered by</p>
                    <Link to="/"><img className="logo" alt="logo" src={logo}/></Link>
                </div>
            </div>
        </div>

    );

}

export default Sidebar;