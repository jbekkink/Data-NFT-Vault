import React from 'react';
import ManageDataset from './components/NftOverview';
import CreateNft from './components/CreateNft';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {init, refreshUser} from './components/iexec';
import NavBar from './components/NavBar';
import Userinfo from './components/Wallet';
import Order from './components/Order';
import { Toaster } from 'react-hot-toast';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      iexec: null, 
      isConnected: false,
      status: "Not Connected", 
      userAddress: ""
    }; 
  }

  async componentDidMount() {
    try {
      const iexec = await init();
      if(iexec) {
        const id = await refreshUser(iexec)().then(result => {
          return result.toString().toLowerCase();
        });

        this.setState({
          iexec: iexec,
          isConnected: true,
          status: "Connected to Bellecour (iExec Sidechain)",
          userAddress: id, 
        });
      }
    } catch(e) {
      console.error(e);
    }
  }
 
  render() {
    return (
    <>
      <Router>
        <div className='app-wrapper'>
          <Toaster />
          <NavBar />
          <Routes>
            {this.state.isConnected && <Route path="/" element={<Userinfo iexec={this.state.iexec} id={this.state.userAddress}/>} />}
            {this.state.isConnected && <Route path="/manage-nft" element={<ManageDataset iexec={this.state.iexec} id={this.state.userAddress} />} />}                      
            {this.state.isConnected && <Route path="/manage-nft/:id" element={<Order iexec={this.state.iexec} id={this.state.userAddress}/>} />}
            {this.state.isConnected && <Route path="/create-nft" element={<CreateNft iexec={this.state.iexec} />} />}
          </Routes>
        </div>
      </Router>
    </>
    );
  }
}


export default App;