import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import apiCall from '../../helper';
import SingleListing from '../Basic/SingleListing';
import MessageAlert from '../Basic/MessageAlert';

const Hosted = (props) => {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const [hostedListings, setHostedListings] = React.useState([]);

  const [openAlert, setOpenAlert] = React.useState(false);
  const [snackbarContent, setSnackbarContent] = React.useState('');
  const [alertType, setAlertType] = React.useState('error');
  // close the alert
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert(false);
  };

  // if no token, go to login page
  React.useEffect(() => {
    if (!props.token) {
      navigate('/login');
    }
  }, [props.token]);

  // fetch hosted listing when loading the page
  React.useEffect(() => {
    if (props.token) {
      hosted();
    }
  }, []);

  const hosted = async () => {
    try {
      const data = await apiCall('GET', 'listings');
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType('error');
        setOpenAlert(true);
      } else if (data.listings) {
        setHostedListings([...data.listings].filter(listing => listing.owner === email && listing.title));
      }
    } catch (error) {
      console.error('Error during showing hosted listings:', error);
    }
  }

  const createHosted = () => {
    navigate('/create');
  }

  return (
    <>
      <div style={{ margin: '2vh 8vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginRight: '4vw' }}>
          <Typography variant="h5" component="h2" fontWeight='bold'>
            Hosted Listings
          </Typography>
          <Tooltip title="Create a new listing" arrow placement="top">
            <Button id='createHosted' size="small" variant="contained" onClick={createHosted} aria-label="Click me to create a listing">Create</Button>
          </Tooltip>
        </div>
        <hr />
        {hostedListings.length > 0
          ? (
            <Grid container wrap="wrap" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {hostedListings.map((listing) => {
                return <SingleListing key={listing.id} listing={listing} hosted={true} onDelete={hosted} />
              })}
            </Grid>
            )
          : (
              <></>
            )
        }
      </div>
      <MessageAlert open={openAlert} alertType={alertType} handleClose={handleCloseAlert} snackbarContent={snackbarContent}/>
    </>
  )
}

export default Hosted;
