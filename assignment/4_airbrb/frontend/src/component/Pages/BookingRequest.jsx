import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Button from '@mui/material/Button';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import HistoryIcon from '@mui/icons-material/History';
import PaidIcon from '@mui/icons-material/Paid';

import { apiCall, getBooking } from '../../helper';
import MessageAlert from '../Basic/MessageAlert';

const bookingStatus = [
  { label: 'pending', color: '#FBA030' },
  { label: 'declined', color: '#F93E3E' },
  { label: 'accepted', color: '#49CC90' },
];

// get according color
const getStatusColor = (status) => {
  const statusObject = bookingStatus.find((item) => item.label === status);
  return statusObject ? statusObject.color : '';
};

const BookingRequest = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [bookingRequest, setBookingRequest] = React.useState([]);
  const [open, setOpen] = React.useState(false); // alert state
  const [snackbarContent, setSnackbarContent] = React.useState('');
  const [alertType, setAlertType] = React.useState('error');
  const [days, setDays] = React.useState(0);
  const [bookedDays, setBookedDays] = React.useState(0);
  const [profit, setProfit] = React.useState(0);

  React.useEffect(() => {
    getListing();
    getBookingList();
  }, []);

  // caculate some information for selected listing
  const getListing = async () => {
    const result = await apiCall('GET', `listings/${id}`)
    if (result.listing.postedOn === null) {
      setDays(0);
    } else {
      const postedOn = new Date(result.listing.postedOn);
      const currentDate = new Date();
      const timeDiff = currentDate - postedOn;
      const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      setDays(dayDiff);
    }
  }

  // get all the booking list
  const getBookingList = async () => {
    try {
      const result = await getBooking(id);
      setBookingRequest([...result]);
      // caculate booked days
      const accepteBooking = result.filter((booking) => booking.status === 'accepted');
      const currentYear = new Date().getFullYear();
      const totalDays = accepteBooking.reduce((totalTime, booking) => {
        const date1 = new Date(booking.dateRange.from);
        const date2 = new Date(booking.dateRange.to);
        if (date1.getFullYear() !== currentYear) {
          return totalTime;
        } else {
          const timeDiff = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
          const daysToAdd = Math.max(timeDiff, 1);
          return totalTime + daysToAdd;
        }
      }, 0)

      // caculate prodit
      const totalProfit = accepteBooking.reduce((totalProfit, booking) => {
        const date1 = new Date(booking.dateRange.from);
        if (date1.getFullYear() !== currentYear) {
          return totalProfit;
        } else {
          return totalProfit + booking.totalPrice;
        }
      }, 0);
      setBookedDays(totalDays);
      setProfit(totalProfit);
    } catch (error) {
      console.error('Error during getting booking list:', error);
    }
  }

  // booking functions
  const declineBooking = async (bookingId, index) => {
    if (bookingRequest[index].status === 'declined') {
      setSnackbarContent('This booking has been declined');
      setAlertType('error');
      setOpen(true);
    } else {
      try {
        await apiCall('PUT', `bookings/decline/${bookingId}`, {}, token, true);
        setSnackbarContent('Success to decline');
        setAlertType('success');
        setOpen(true);
        getBookingList();
      } catch (error) {
        console.error('Error during showing reviews:', error);
      }
    }
  };

  const acceptBooking = async (bookingId, index) => {
    if (bookingRequest[index].status === 'accepted') {
      setSnackbarContent('This booking has been accepted');
      setAlertType('error');
      setOpen(true);
    } else {
      try {
        await apiCall('PUT', `bookings/accept/${bookingId}`, {}, token, true);
        setSnackbarContent('Success to accept');
        setAlertType('success');
        setOpen(true);
        getBookingList();
      } catch (error) {
        console.error('Error during showing reviews:', error);
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div style={{ margin: '2vh 10vw' }}>
      <Typography variant="h5" component="h2" fontWeight='bold'>
        Booking Requests
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', }}>
        <Card sx={{ width: '24vw' }}>
            <CardContent>
              <div style={{ display: 'flex', height: 'auto', alignItems: 'center' }}>
                <HistoryIcon />
                <Typography fontWeight='bold'>{'\u00A0'}
                  Online
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1vh', color: '#FCA130' }}>
                {days === 1
                  ? `${days} day`
                  : `${days} days`
                }
              </div>
            </CardContent>
        </Card>
        <Card sx={{ width: '24vw' }}>
            <CardContent>
              <div style={{ display: 'flex', height: 'auto', alignItems: 'center' }}>
                <BookmarkAddedIcon />
                <Typography fontWeight='bold'>{'\u00A0'}
                  Booking
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1vh', color: '#FCA130' }}>
                {bookedDays === 1
                  ? `${bookedDays} day`
                  : `${bookedDays} days`
                }
              </div>
            </CardContent>
        </Card>
        <Card sx={{ width: '24vw' }}>
            <CardContent>
              <div style={{ display: 'flex', height: 'auto', alignItems: 'center' }}>
                <PaidIcon />
                <Typography fontWeight='bold'>{'\u00A0'}
                  Profit
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1vh', color: '#FCA130' }}>
                ${profit}
              </div>
            </CardContent>
        </Card>
      </div>
      <hr />
      {bookingRequest.map((booking, idx) => (
        <Card key={'booking' + booking.id} sx={{ margin: '2vh 0' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {new Date(booking.dateRange.from).toLocaleString().split(' ')[0]} - {new Date(booking.dateRange.to).toLocaleString().split(' ')[0]}
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography display="block" variant="h7" color="text.secondary">
                <div style={{ margin: '1vh 0', color: getStatusColor(booking.status), fontWeight: 'bold' }}>
                  {booking.status.toUpperCase()}
                </div>
                <div style={{ margin: '1vh 0' }}>
                  Client: {booking.owner}
                </div>
                <div style={{ margin: '1vh 0', borderBottom: '1px solid black' }}>
                Total Price: ${booking.totalPrice}
                </div>
              </Typography>
              {booking.status === 'pending' &&
                <div>
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      sx={{ color: '#F93E3E', borderColor: '#F93E3E' }}
                      onClick={() => declineBooking(booking.id, idx)}
                      aria-label="Click me to decline a booking"
                    >
                      <HighlightOffIcon />{'\u00A0'}Decline
                    </Button>
                  </div>
                  <div style={{ margin: '1vh 0', textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      sx={{ color: '#49CC90', borderColor: '#49CC90' }}
                      onClick={() => acceptBooking(booking.id, idx)}
                      aria-label="Click me to accept a booking"
                    >
                      <TaskAltIcon />{'\u00A0'}Accept
                    </Button>
                  </div>
                </div>
              }
            </div>
          </CardContent>
        </Card>
      ))}
    <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/>
    </div>
  )
}

export default BookingRequest;
