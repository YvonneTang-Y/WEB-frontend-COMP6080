import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from '@mui/material/Link';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Tooltip from '@mui/material/Tooltip';
import Rating from '@mui/material/Rating';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { makeStyles } from '@material-ui/core/styles';

import apiCall from '../../helper';
import MessageAlert from './MessageAlert';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const useStylesText = makeStyles((theme) => ({
  ellipsis: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
}));

const SingleListing = (props) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { listing, hosted, onDelete } = props;
  const [title, setTitle] = React.useState('');
  const [thumbnail, setThumbnail] = React.useState('');
  const [beds, setBeds] = React.useState(0);
  const [type, setType] = React.useState('');
  const [bathroom, setBathroom] = React.useState(0);
  const [reviews, setReviews] = React.useState([]);
  const [price, setPrice] = React.useState('');
  const [published, setPublished] = React.useState(false);
  const [availabilities, setAvailabilities] = React.useState([{ from: '', to: '' }]);
  const [open, setOpen] = React.useState(false);
  const [averageRating, setAverageRating] = React.useState(0.0);

  const handleClose = () => setOpen(false);
  const textClasses = useStylesText();
  // alert message
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

  const useStyles = makeStyles({
    container: {
      marginRight: '1vw',
      marginTop: '1vh',
      my: 5,
      '@media (max-width: 600px)': {
        width: '37vw',
      },
      '@media (min-width: 601px)': {
        width: '23vw',
      },
      '&:hover': {
        cursor: !hosted ? 'pointer !important' : undefined,
      },
    },
    thumbnailContainer: {
      overflow: 'hidden',
      position: 'relative',
      '@media (max-width: 600px)': {
        width: '37vw',
        height: '37vw',
      },
      '@media (min-width: 601px)': {
        width: '23vw',
        height: '23vw',
      },
      '&:hover': {
        cursor: 'pointer !important',
      },
    },
  });

  const classes = useStyles();
  // fetch detail with listing id
  React.useEffect(() => {
    const fetchListingDetail = async () => {
      try {
        const result = await apiCall('GET', `listings/${listing.id}`)
        if (result.error) {
          setSnackbarContent(result.error);
          setAlertType('error');
          setOpenAlert(true);
          return;
        } else {
          setTitle(result.listing.title);
          setThumbnail(result.listing.thumbnail);
          setBeds(result.listing.metadata.bedrooms.reduce((accumulator, bedroom) => {
            const bedsInBedroom = Object.values(bedroom).reduce((sum, bedCount) => sum + parseInt(bedCount), 0);
            return accumulator + bedsInBedroom;
          }, 0))
          setBathroom(Math.max(0, parseInt(result.listing.metadata.bathroom)));
          const lowercaseType = result.listing.metadata.type;
          const capitalizedType = lowercaseType.charAt(0).toUpperCase() + lowercaseType.slice(1);
          setType(capitalizedType);
          setReviews(result.listing.reviews);
          setPrice(result.listing.price);
          setPublished(result.listing.published);
          setAvailabilities([{ from: '', to: '' }]);
          const totalRating = result.listing.reviews.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = (totalRating / result.listing.reviews.length).toFixed(1);
          setAverageRating(parseFloat(avgRating));
        }
      } catch (error) {
        console.error('Error during getting exact hosted listing:', error);
      }
    }
    fetchListingDetail();
  }, [listing.id])

  // function for delete icon
  const deleteListing = async () => {
    try {
      const result = await apiCall('DELETE', `listings/${listing.id}`, null, token, true);
      if (result.error) {
        setSnackbarContent(result.error);
        setAlertType('error');
        setOpenAlert(true);
        return;
      }
    } catch (error) {
      console.error('Error during getting exact hosted listing:', error);
    }
    if (onDelete) {
      onDelete();
    }
  }

  // function for edit icon
  const editListing = () => {
    navigate(`/edit/${listing.id}`);
  }

  // function for booking icon
  const bookingListing = () => {
    navigate(`/hosted/${listing.id}/booking`);
  }

  // function for publishing listing
  const publishedChange = async () => {
    // click and unpublish the listing
    if (published) {
      await apiCall('PUT', `listings/unpublish/${listing.id}`, {}, token, true);
      setPublished(!published);
    } else {
      setOpen(true);
    }
  }

  // submit listing availability
  const submitAvailable = async () => {
    let flag = true;
    if (availabilities.length <= 0) {
      setSnackbarContent('Availability can\'t be empty');
      setAlertType('error');
      setOpenAlert(true);
      flag = false;
    } else {
      // Check for date range overlap
      const sortedAvailabilities = availabilities.slice().sort((a, b) => {
        return new Date(a.from) - new Date(b.from);
      });
      for (let i = 0; i < sortedAvailabilities.length - 1; i++) {
        const currentRange = sortedAvailabilities[i];
        const nextRange = sortedAvailabilities[i + 1];
        const currentEndDate = new Date(currentRange.to);
        const nextStartDate = new Date(nextRange.from);
        if (currentEndDate >= nextStartDate) {
          setSnackbarContent('Date ranges can\'t overlap');
          setAlertType('error');
          setOpenAlert(true);
          flag = false;
          break;
        }
      }
    }
    availabilities.some((availability, idx) => {
      if (availability.from > availability.to || availability.from === '' || availability.to === '') {
        setSnackbarContent(`Invalid date range in Slot ${idx + 1}`);
        setAlertType('error');
        setOpenAlert(true);
        flag = false;
        return true;
      }
      return false;
    })

    if (flag) {
      const requestBody = {
        availability: availabilities,
      };
      try {
        await apiCall('PUT', `listings/publish/${listing.id}`, requestBody, token, true);
        setPublished(true);
        setOpen(false);
      } catch (error) {
        console.error('Error in sumbit availability: ', error);
      }
    }
  }

  const addDate = () => {
    const isEveryDateRangeComplete = availabilities.every(
      (availability) => availability.from !== '' && availability.to !== ''
    );
    if (isEveryDateRangeComplete) {
      const newAvailabilities = [...availabilities, { from: '', to: '' }];
      setAvailabilities([...newAvailabilities]);
    } else {
      setSnackbarContent('Complete the current date ranges first');
      setAlertType('error');
      setOpenAlert(true);
    }
  }

  const deleteDate = (index) => {
    const newAvailabilities = [...availabilities];
    newAvailabilities.splice(index, 1);
    setAvailabilities([...newAvailabilities]);
  }

  const updateAvailabilities = (e, index, label) => {
    const newAvailabilities = [...availabilities];
    const newDate = e.toDate();
    newAvailabilities[index] = { ...availabilities[index], [label]: newDate };
    setAvailabilities([...newAvailabilities]);
  }

  const listingPage = () => {
    navigate(`/listing/${listing.id}`);
  }

  return (
    <>
      <Box
        key={'listing' + listing.id}
        className={classes.container}
        onClick={!hosted ? () => listingPage(listing.id) : undefined}
        id={'card-' + listing.title.replace(/\s/g, '')}
      >
        {/* thumbnail */}
        <div className={classes.thumbnailContainer}>
          <img
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={title}
            src={thumbnail}
            onClick={() => listingPage(listing.id)}
          />
          {token && listing.booking && (
            <div style={{ position: 'absolute', top: 0, right: 0 }}>
              <div style={{ background: 'white', borderRadius: '50%', padding: '5px', boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' }}>
                {/* Add your symbol here */}
                <BookmarkAddedIcon fontSize='small' sx={{ color: '#1976D2' }} />
              </div>
            </div>
          )}
        </div>

        <Box sx={{ pr: '1vw' }}>
          {/* title & other details */}
          <Typography gutterBottom variant="body2" sx={{ pt: '0.5vh', fontWeight: 'bold' }}>
            {title}
          </Typography>

          <Typography display="block" variant="caption" color="text.secondary" className={textClasses.ellipsis}>
            {`${type}`}
            {beds > 0 &&
              <>
                {beds === 1
                  ? `, ${beds} bed`
                  : `, ${beds} beds`
                }
              </>
            }
            {bathroom > 0 &&
              <>
              {bathroom === 1
                ? `, ${bathroom} bathroom`
                : `, ${bathroom} bathrooms`
              }
            </>
            }
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 'auto' }}>
            {/* review and rate */}
            <div>
              <Typography variant="caption" color="text.secondary">
                {reviews.length <= 1
                  ? `${reviews.length} review`
                  : `${reviews.length} reviews`
                }
              </Typography>
              <br />
              <div style={{ display: 'flex', height: 'auto', alignItems: 'center' }}>
                <Rating size='small' value={averageRating} precision={0.1} readOnly/>
                <small>
                  {'\u00A0'}
                  { averageRating
                    ? Number(averageRating).toFixed(1)
                    : Number(0).toFixed(1)
                  }
                </small>
              </div>
              <Typography variant="caption" sx={{ textDecoration: 'underline' }}>
                {'$ ' + price + ' AUD/night'}
              </Typography>
            </div>
            {/* delete icon & edit icon */}
            {hosted &&
              <div>
                <Tooltip title="Delete" arrow placement="left">
                  <DeleteIcon
                    fontSize='small'
                    onClick={deleteListing}
                    sx={{
                      color: 'red',
                      '&:hover': {
                        cursor: 'pointer',
                      },
                    }}
                  />
                </Tooltip>
                <br />
                <Tooltip title="Edit" arrow placement="left">
                  <ModeEditIcon
                    fontSize='small'
                    onClick={editListing}
                    id={'editListing-' + listing.title.replace(/\s/g, '')}
                    sx={{
                      color: '#1976D2',
                      '&:hover': {
                        cursor: 'pointer',
                      }
                    }}
                  />
                </Tooltip>
                <br />
                <Tooltip title="Booking Requests" arrow placement="left">
                  <BookmarkIcon
                    fontSize='small'
                    onClick={bookingListing}
                    sx={{
                      color: '#1976D2',
                      '&:hover': {
                        cursor: 'pointer',
                      }
                    }}
                  />
                </Tooltip>
              </div>
            }

          </div>
          {/* published or not */}
          <Tooltip title="Click to publish/unpublish" arrow placement="right">
            {hosted &&
              <Link
                href="#"
                underline="hover"
                fontSize='small'
                onClick={publishedChange}
                color={ published ? '#0A7C00' : 'red'}
                id={'published-' + listing.title.replace(/\s/g, '')}
              >
                {published ? 'Published' : 'Unpublished'}
                {published}
              </Link>
            }
          </Tooltip>
          <br />
        </Box>
      </Box>
      {/* published modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Publish Listing
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'auto' }}>
            {availabilities.map((availability, idx) => {
              return (
                <div key={'availability' + idx} style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
                  <span style={{ fontWeight: 'bold', marginRight: '2vw' }}>Slot {idx + 1} </span>
                  <LocalizationProvider key={'availabilityFrom' + idx} dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label='From'
                      sx={{ width: '20vw', padding: '1vh 1vw' }}
                      onChange={(event) => { updateAvailabilities(event, idx, 'from') }}
                      id={'availableFrom-' + listing.title.replace(/\s/g, '')}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider key={'availabilityTo' + idx} dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label='To'
                      sx={{ width: '20vw', padding: '1vh 1vw' }}
                      onChange={(event) => { updateAvailabilities(event, idx, 'to') }}
                      id={'availableTo-' + listing.title.replace(/\s/g, '')}
                    />
                  </LocalizationProvider>
                  <DeleteIcon
                    sx={{
                      color: 'red',
                      '&:hover': {
                        cursor: 'pointer',
                      }
                    }}
                    onClick={() => { deleteDate(idx) }}
                  />
                </div>
              )
            })}
            <Button
              component="span"
              variant="outlined"
              onClick={addDate}
              aria-label="Click me to add a date range"
            >
                + Add date range
            </Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleClose}
              aria-label="Click me to close the search filter modal"
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={submitAvailable}
              aria-label="Click me to submit a search filter"
              id={'availableSubmit-' + listing.title.replace(/\s/g, '')}
            >
              Submit
            </Button>
          </div>
        </Box>
      </Modal>
      <MessageAlert open={openAlert} alertType={alertType} handleClose={handleCloseAlert} snackbarContent={snackbarContent}/>
    </>
  );
}

export default SingleListing;
