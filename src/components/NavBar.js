import React from 'react';
import '../css/NavBar.css';
import logo from '../assets/logo-white.svg';
import { Link, NavLink } from 'react-router-dom';

export default function NavBar() {
    return(
        <div className='navbar'>
            <h1 className='logotitle'>Data NFT Vault</h1>
            <ul>
                        <li className="nav-option"><NavLink to="/">Wallet</NavLink></li>
                        <li className="nav-option"><NavLink to="/manage-nft">Manage NFT</NavLink></li>
                        <li className="nav-option"><NavLink to="/create-nft">Create NFT</NavLink></li>
            </ul>
            <div className='powered-box'>
                <p className='powered-by'>Powered by</p>
                <Link to="/"><img className="logo" alt="logo" src={logo}/></Link>
            </div>
        </div>
    );
}