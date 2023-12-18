import React from 'react';
// import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';

import SingleListing from '../Basic/SingleListing';
import apiCall from '../../helper';
import SearchBar from '../Listings/SearchBar';
import MessageAlert from '../Basic/MessageAlert';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Listings = (props) => {
  const [allPublishedListings, setAllPublishedListings] = React.useState([]);
  const [publishedListings, setPublishedListings] = React.useState([]);
  const [searchedListings, setSearchedListings] = React.useState([]);
  const [search, setSearch] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [keywords, setKeywords] = React.useState('');
  const [bedrooms, setBedrooms] = React.useState([0, 15]);
  const [price, setPrice] = React.useState([0, 10000]);
  const [reviewSort, setReviewSort] = React.useState('desc');
  const [availabilities, setAvailabilities] = React.useState({ from: '', to: '' });

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

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

  React.useEffect(() => {
    published();
  }, []);

  React.useEffect(() => {
    if (search) {
      setPublishedListings([...searchedListings]);
    } else {
      setPublishedListings([...allPublishedListings]);
    }
  }, [searchedListings, allPublishedListings]);

  // get publised listings list
  const published = async () => {
    localStorage.setItem('to', '');
    localStorage.setItem('from', '');
    try {
      const data = await apiCall('GET', 'listings');
      if (data.error) {
        setSnackbarContent(data.error);
        setAlertType('error');
        setOpenAlert(true);
      } else if (data.listings) {
        const filterListings = await Promise.all(
          data.listings.map(async (listing) => {
            const result = await apiCall('GET', `listings/${listing.id}`);
            // Check if the listing is published
            if (result.listing.published) {
              const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
              const avgRating = (totalRating / listing.reviews.length).toFixed(1);
              const updatedListing = {
                ...listing,
                metadata: result.listing.metadata,
                availability: result.listing.availability,
                avgRating: parseFloat(avgRating) || 0,
              };
              return updatedListing;
            }
            return null; // Filter out unpublished listings
          })
        );
        const filteredListings = filterListings.filter((listing) => listing !== null);
        // sort in alphabetical order
        const sortedListings = filteredListings.sort((a, b) => a.title.localeCompare(b.title));
        // sorted by booking status
        if (token) {
          const bookings = await apiCall('GET', 'bookings', {}, token, true);
          const bookedListings = sortedListings.map((listing) => {
            const hasAcceptedOrPendingBooking = bookings.bookings.some((booking) => {
              return booking.listingId === listing.id.toString() && (booking.status === 'accepted' || booking.status === 'pending') && booking.owner === email;
            });
            const updatedListing = {
              ...listing,
              booking: hasAcceptedOrPendingBooking,
            };
            return updatedListing;
          })
          bookedListings.sort((a, b) => (b.booking - a.booking));
          setAllPublishedListings([...bookedListings]);
        } else {
          setAllPublishedListings([...sortedListings]);
        }
      }
    } catch (error) {
      console.error('Error during showing published listings:', error);
    }
  }

  const bedroomsChange = (event, newValue) => {
    setBedrooms(newValue);
  };
  const valuetext = (value) => {
    return `${value}`;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // date
  const updateAvailabilities = (e, label) => {
    const newDate = new Date(e).toLocaleString().split(' ')[0];
    setAvailabilities({ ...availabilities, [label]: newDate });
  }

  // price
  const priceChange = (event, newValue) => {
    setPrice(newValue);
  }

  // sort
  const sortChange = (event) => {
    setReviewSort(event.target.value);
  }

  // button 'search' function
  const searchFilter = () => {
    let temp = [...allPublishedListings];
    let flag = true;
    if ((availabilities.from !== '' && availabilities.to === '') ||
          (availabilities.to !== '' && availabilities.from === '') ||
          availabilities.from > availabilities.to) {
      flag = false;
      setSnackbarContent('Invalid date range');
      setAlertType('error');
      setOpenAlert(true);
    }
    if (flag) {
      setSearch(true);
      // keywords
      if (keywords) {
        const lowerCaseKeywords = keywords.toLowerCase().split(/ +/);
        temp = temp.filter((listing) => {
          const lowerCaseTitle = listing.title.toLowerCase();
          const lowerCaseStreet = listing.address.street.toLowerCase();
          const lowerCaseCity = listing.address.city.toLowerCase();
          const lowerCaseState = listing.address.state.toLowerCase();
          const lowerCasePostcode = listing.address.postcode.toLowerCase();
          const lowerCaseCountry = listing.address.country.toLowerCase();
          console.log(lowerCaseStreet, lowerCaseCity, lowerCaseState, lowerCasePostcode, lowerCaseCountry);
          const keywordExistsInTitleOrCity = lowerCaseKeywords.every(keyword => {
            return lowerCaseTitle.includes(keyword) ||
            lowerCaseStreet.includes(keyword) ||
            lowerCaseCity.includes(keyword) ||
            lowerCaseState.includes(keyword) ||
            lowerCasePostcode.includes(keyword) ||
            lowerCaseCountry.includes(keyword);
          });
          return keywordExistsInTitleOrCity;
        });
        console.log('keywords', temp);
      }
      // bedrooms
      temp = temp.filter((listing) => {
        if (listing.metadata.bedrooms.length >= bedrooms[0] && listing.metadata.bedrooms.length <= bedrooms[1]) {
          return listing;
        }
        return null
      });
      // date range
      if (availabilities.from && availabilities.to) {
        console.log('data range', availabilities);
        temp = temp.filter((listing) => {
          return listing.availability.some((availability) => {
            const from = new Date(availability.from);
            const to = new Date(availability.to);
            const fromDate = new Date(availabilities.from);
            const toDate = new Date(availabilities.to);
            return from <= fromDate && to >= toDate;
          });
        });
      }

      // price
      temp = temp.filter((listing) => listing.price >= price[0] && listing.price <= price[1]);
      // review
      if (reviewSort === 'desc') {
        temp.sort((a, b) => b.avgRating - a.avgRating);
      } else {
        temp.sort((a, b) => a.avgRating - b.avgRating);
      }
      setSearchedListings([...temp]);
      localStorage.setItem('from', availabilities.from);
      localStorage.setItem('to', availabilities.to);
      setOpen(false);
    }
  }

  // button 'reset' function
  const resetFilter = () => {
    setKeywords('');
    setBedrooms([0, 15]);
    setPrice([0, 10000]);
    setReviewSort('desc');
    setAvailabilities({ from: '', to: '' });
  }

  return (
    <>
      <div style={{ margin: '2vh 8vw' }}>
        {/* search filters */}
        <SearchBar openModal={handleOpen} />
        {/* display published listings */}
        {publishedListings.length > 0
          ? (
            <Grid container wrap="wrap" style={{ display: 'flex' }}>
              {publishedListings.map((listing) => {
                return (
                  <SingleListing
                    key={listing.id}
                    listing={listing}
                    hosted={false}
                    onDelete={published}
                  />
                )
              })}
            </Grid>
            )
          : (
              <>
              No listings
              </>
            )
        }
      </div>

      {/* search modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Search Filter
          </Typography>
          {/* keywords */}
          <div style={{ display: 'flex', alignItems: 'center', height: 'auto', paddingBottom: '2vh' }}>
            <span style={{ fontWeight: 'bold', marginRight: '2vw', flex: '2' }}>Keywords </span>
            <TextField
              value={keywords}
              variant="outlined"
              sx={{ flex: '5' }}
              onChange={(e) => setKeywords(e.target.value)}
              label='title, city location'
            />
          </div>
          <div>
            {/* bedroom */}
            <div style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
              <span style={{ fontWeight: 'bold', marginRight: '2vw', flex: '2' }}>Bedroom </span>
              <Slider
                sx={{ flex: '5' }}
                getAriaLabel={() => 'Bedrooms range'}
                value={bedrooms}
                onChange={bedroomsChange}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
                max={15}
              />
            </div>
            {/* date */}
            <div style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
              <span style={{ fontWeight: 'bold', marginRight: '2vw', flex: '2' }}>Date </span>
              <div style={{ flex: '5' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label='From'
                    value={dayjs(availabilities.from)}
                    sx={{ width: '20vw', padding: '1vh 1vw' }}
                    onChange={(event) => { updateAvailabilities(event, 'from') }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label='To'
                    value={dayjs(availabilities.to)}
                    sx={{ width: '20vw', padding: '1vh 1vw' }}
                    onChange={(event) => { updateAvailabilities(event, 'to') }}
                  />
                </LocalizationProvider>
              </div>
            </div>
            {/* price */}
            <div style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
              <span style={{ fontWeight: 'bold', marginRight: '2vw', flex: '2' }}>Price </span>
              <Slider
                sx={{ flex: '5' }}
                getAriaLabel={() => 'Bedrooms range'}
                value={price}
                onChange={priceChange}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
                max={10000}
              />
            </div>
            {/* review rating */}
            <div style={{ display: 'flex', alignItems: 'center', height: 'auto', paddingBottom: '2vh' }}>
              <span style={{ fontWeight: 'bold', marginRight: '2vw', flex: '2' }}>Review </span>
              <Select
                sx={{ flex: '5' }}
                value={reviewSort}
                onChange={sortChange}
              >
                <MenuItem value='desc'>From highest to lowest</MenuItem>
                <MenuItem value='asec'>From lowest to highest</MenuItem>
              </Select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={resetFilter} aria-label="Click me to reset filter">Reset</Button>
            <Button variant="contained" onClick={searchFilter} aria-label="Click me to submit filter">Submit</Button>
          </div>
        </Box>
      </Modal>
      <MessageAlert open={openAlert} alertType={alertType} handleClose={handleCloseAlert} snackbarContent={snackbarContent}/>
    </>
  )
}

export default Listings;
