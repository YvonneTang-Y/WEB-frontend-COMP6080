import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../Basic/Header';
import Login from './Login';
import Register from './Register';
import Listings from './Listings';
import Hosted from './Hosted';
import Footer from '../Basic/Footer';
import CreateHosted from './CreateHosted';
import ListingDetail from './ListingDetail';
import BookingRequest from './BookingRequest';

import Box from '@mui/material/Box';

// const LandingPage = () => {
//   // const navigate = useNavigate();
//   // navigate('/login');
//   return <>Hi</>
// }

const PageList = () => {
  const [token, setToken] = React.useState(null);

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#ffffff',
          zIndex: 1000,
        }}
      >
        <Header token={token} setToken={setToken}/>
      </Box>
      <br />
      <br />
      <br />
      <Routes>
          <Route path="/" element={<Listings />} />
          <Route path="/register" element={<Register token={token} setToken={setToken} />} />
          <Route path="/login" element={<Login token={token} setToken={setToken}/>} />
          <Route path="/hosted" element={<Hosted token={token} setToken={setToken}/>} />
          <Route path="/create" element={<CreateHosted edit={false}/>} />
          <Route path="/edit/:id" element={<CreateHosted edit={true}/>} />
          <Route path="/listing/:id" element={<ListingDetail edit={true}/>} />
          <Route path="/hosted/:id/booking" element={<BookingRequest edit={true}/>} />
      </Routes>
      <br />
      <br />
      <br />
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#ffffff',
        }}
      >
        <hr />
        <Footer />
      </Box>
    </>
  );
}

export default PageList;
