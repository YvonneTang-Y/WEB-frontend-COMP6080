import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Textarea from '@mui/joy/Textarea';
import IconButton from '@mui/joy/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import apiCall from '../../helper';
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

const Reviews = (props) => {
  const { id } = useParams();
  const { booking } = props;
  const [reviews, setReviews] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [text, setText] = React.useState('');
  const addEmoji = (emoji) => () => setText(`${text}${emoji}`);
  const [snackbarContent, setSnackbarContent] = React.useState('');
  const [alertType, setAlertType] = React.useState('error');

  const token = localStorage.getItem('token');
  const poster = localStorage.getItem('email');
  React.useEffect(() => {
    getListingDetail();
  });

  const getListingDetail = async () => {
    try {
      const result = await apiCall('GET', `listings/${id}`);
      setReviews([...result.listing.reviews]);
    } catch (error) {
      console.error('Error during showing reviews:', error);
    }
  };

  // open modal
  const handleOpenModal = () => {
    const hasAcceptedBooking = booking.some(row => row.status === 'accepted' && row.owner === poster);
    if (hasAcceptedBooking) {
      setOpenModal(true);
    } else {
      setAlertType('error');
      setSnackbarContent('No accepeted bookings');
      setOpenAlert(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false)
  };

  // close alert
  const handleCloseAlert = () => {
    setOpenAlert(false)
  };

  // submit review
  const submitReview = async () => {
    const acceptedBooking = booking.find(row => row.status === 'accepted' && row.owner === poster);
    console.log('booking list', booking);
    const currentDate = new Date().toLocaleString().split(' ')[0];
    if (acceptedBooking) {
      try {
        const requestBody = {
          review: {
            rating,
            text,
            postedOn: currentDate,
            poster,
          }
        }
        // console.log('requestBody', requestBody, token);
        await apiCall('PUT', `listings/${id}/review/${acceptedBooking.id}`, requestBody, token, true);
        setRating(5);
        setText('');
        handleCloseModal();
      } catch (error) {
        console.error('Error during submitting reviews:', error);
      }
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Reviews</Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          aria-label="Click me to open a review modal"
        >
          <DriveFileRenameOutlineIcon />{'\u00A0'}
          Write a review
        </Button>
      </div>
      {/* alert message */}
      <MessageAlert open={openAlert} alertType={alertType} handleClose={handleCloseAlert} snackbarContent={snackbarContent}/>
      {/* show reviews */}
      {reviews.map((review, idx) => (
        <Card key={'review' + idx} sx={{ margin: '2vh 0' }}>
          <CardContent>
            <Typography variant="h7" gutterBottom sx={{ marginBottom: '1vh', fontWeight: 'bold' }}>
              {review.poster}{'\u00A0'}
            </Typography>
            <br />
            <small style={{ display: 'flex', height: 'auto', alignItems: 'center', marginTop: '1vh' }}>
              <Typography variant="h7" gutterBottom color="text.secondary">
                <Rating size="small" value={review.rating} readOnly />
              </Typography>
              <Typography variant="h7" gutterBottom color="text.secondary">
                {'\u00A0'}{review.postedOn}
              </Typography>
            </small>
            <Typography variant="h7" gutterBottom>
              {review.text}
            </Typography>
          </CardContent>
        </Card>
      ))

      }
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableScrollLock={true}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
          Write a review
          </Typography>
          <Rating
            name="simple-controlled"
            sx={{ margin: '2vh 0' }}
            value={rating}
            onChange={(event, newValue) => {
              const adjustedValue = newValue < 1 ? 1 : newValue;
              setRating(adjustedValue);
            }}
          />
        <Textarea
          placeholder="Write a review here…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          minRows={2}
          maxRows={4}
          startDecorator={
            <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
              <IconButton variant="outlined" color="neutral" onClick={addEmoji('👍')}>
                👍
              </IconButton>
              <IconButton variant="outlined" color="neutral" onClick={addEmoji('🏖')}>
                🏖
              </IconButton>
              <IconButton variant="outlined" color="neutral" onClick={addEmoji('😍')}>
                😍
              </IconButton>
            </Box>
          }
          endDecorator={
            <Typography level="body-xs" sx={{ ml: 'auto' }}>
              {text.length} character(s)
            </Typography>
          }
          sx={{ minWidth: 300 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={submitReview}
            sx={{ marginTop: '2vh', marginLeft: 'auto' }}
            aria-label="Click me to submit a review"
          >
            Submit
          </Button>
        </div>
        </Box>
      </Modal>
    </>
  )
}

export default Reviews;
