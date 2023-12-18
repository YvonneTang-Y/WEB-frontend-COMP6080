import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LocalHotelIcon from '@mui/icons-material/LocalHotel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import WifiIcon from '@mui/icons-material/Wifi';
import ShowerIcon from '@mui/icons-material/Shower';
import ElevatorIcon from '@mui/icons-material/Elevator';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { DemoItem } from '@mui/x-date-pickers/internals/demo';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonIcon from '@mui/icons-material/Person';

import { apiCall, getBooking } from '../../helper';
import Reviews from '../ListingDetail/Review';
import MessageAlert from '../Basic/MessageAlert';
import ImageViewer from '../ListingDetail/ImageViewer';

const amenitiesList = [
  { key: 'wifi', label: 'wifi', icon: WifiIcon },
  { key: 'shower', label: 'shower', icon: ShowerIcon },
  { key: 'lift', label: 'lift', icon: ElevatorIcon },
  { key: 'parking', label: 'parking', icon: LocalParkingIcon },
  { key: 'gym', label: 'gym', icon: FitnessCenterIcon },
  { key: 'firstAid', label: 'First Aid', icon: MedicalServicesIcon },
];

const bookingStatus = [
  { label: 'pending', color: '#FBA030' },
  { label: 'declined', color: '#F93E3E' },
  { label: 'accepted', color: '#49CC90' },
];

const ListingDetail = () => {
  const { id } = useParams();
  const [title, setTitle] = React.useState('');
  // const [thumbnail, setThumbnail] = React.useState('');
  const [images, setImages] = React.useState([]);
  const [bedroom, setBedroom] = React.useState(0);
  const [beds, setBeds] = React.useState(0);
  const [type, setType] = React.useState('');
  const [bathroom, setBathroom] = React.useState(0);
  const [address, setAddress] = React.useState({});
  const [reviews, setReviews] = React.useState([]);
  const [price, setPrice] = React.useState(0);
  const [availabilities, setAvailabilities] = React.useState([{ from: '', to: '' }]);
  const [amenities, setAmenities] = React.useState({});
  const from = localStorage.getItem('from');
  const to = localStorage.getItem('to');
  const [nights, setNights] = React.useState(0);
  const currentDate = dayjs();
  const [booking, setBooking] = React.useState({ from: currentDate, to: currentDate });
  const token = localStorage.getItem('token');
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [open, setOpen] = React.useState(false); // alert state
  const [snackbarContent, setSnackbarContent] = React.useState('');
  const [alertType, setAlertType] = React.useState('error');
  const [bookingList, setBookingList] = React.useState([]);
  const [owner, setOwner] = React.useState(''); // owner cann't book their holded listings
  const email = localStorage.getItem('email');
  console.log(reviews);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // get according color
  const getStatusColor = (status) => {
    const statusObject = bookingStatus.find((item) => item.label === status);
    return statusObject ? statusObject.color : '';
  };

  const getDatail = async () => {
    // caculate price
    if (from && to) {
      const date1 = new Date(from);
      const date2 = new Date(to);
      const timeDiff = Math.abs(date2.getTime() - date1.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      setNights(daysDiff >= 1 ? daysDiff : 1);
    }
    try {
      const result = await apiCall('GET', `listings/${id}`)
      if (result.error) {
        setSnackbarContent(result.error);
        setAlertType('error');
        setOpen(true);
      } else {
        setTitle(result.listing.title);
        console.log('images', [result.listing.thumbnail[0], ...result.listing.metadata.images]);
        setImages([result.listing.thumbnail[0], ...result.listing.metadata.images]);
        setBedroom(result.listing.metadata.bedrooms.length);
        setBeds(result.listing.metadata.bedrooms.reduce((accumulator, bedroom) => {
          const bedsInBedroom = Object.values(bedroom).reduce((sum, bedCount) => sum + parseInt(bedCount), 0);
          return accumulator + bedsInBedroom;
        }, 0))
        setBathroom(Math.max(0, parseInt(result.listing.metadata.bathroom)));
        setAddress(result.listing.address);
        const lowercaseType = result.listing.metadata.type;
        const capitalizedType = lowercaseType.charAt(0).toUpperCase() + lowercaseType.slice(1);
        setType(capitalizedType);
        setReviews(result.listing.reviews);
        setPrice(result.listing.price);
        setTotalPrice(result.listing.price);
        // convert date range
        const convertedAvailabilities = result.listing.availability.map(availability => ({
          from: new Date(availability.from).toLocaleString().split(' ')[0],
          to: new Date(availability.to).toLocaleString().split(' ')[0]
        }));
        convertedAvailabilities.sort((a, b) => new Date(a.from) - new Date(b.from));
        setAvailabilities([...convertedAvailabilities]);
        setAmenities({ ...result.listing.metadata.amenities });
        setOwner(result.listing.owner);
      }
    } catch (error) {
      console.error('Error during showing published listings:', error);
    }
  }

  React.useEffect(() => {
    getDatail();
    getBookingList();
  }, [])

  // book date
  const updateBooking = (e, label) => {
    const date1 = label === 'from' ? new Date(e) : new Date(booking.from);
    const date2 = label === 'to' ? new Date(e) : new Date(booking.to);

    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (date1 > date2) {
      setTotalPrice(0);
    } else {
      setTotalPrice(daysDiff >= 1 ? daysDiff * price : price);
    }
    setBooking({ ...booking, [label]: e.toDate() });
  }

  // submit booking
  const submitBooking = async () => {
    let flag = true;
    if (booking.from > booking.to) {
      setSnackbarContent('Invalid date range');
      setAlertType('error');
      setOpen(true);
      flag = false;
    } else {
      const isRangeValid = availabilities.some(availability => {
        const from = new Date(availability.from);
        const to = new Date(availability.to);
        const bookingFrom = new Date(booking.from);
        const bookingTo = new Date(booking.to);

        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        bookingFrom.setHours(0, 0, 0, 0);
        bookingTo.setHours(0, 0, 0, 0);

        return (
          bookingFrom >= from &&
          bookingTo <= to
        );
      });
      if (!isRangeValid) {
        setSnackbarContent('Unavailable date range');
        setAlertType('error');
        setOpen(true);
        flag = false;
      }
    }
    if (!token) {
      setSnackbarContent('Login to make your booking');
      setAlertType('error');
      setOpen(true);
    } else if (email === owner) {
      setSnackbarContent('You can\'t book your own listing');
      setAlertType('error');
      setOpen(true);
      flag = false;
    }

    if (flag) {
      // client not login
      if (!token) {
        setSnackbarContent('Login first');
        setAlertType('error');
        setOpen(true);
      } else {
        const requestBody = {
          dateRange: {
            from: booking.from,
            to: booking.to,
          },
          totalPrice,
        };
        try {
          await apiCall('POST', `bookings/new/${id}`, requestBody, token, true);
          setSnackbarContent('Success booking');
          setAlertType('success');
          setOpen(true);
          // get new booking list
          getBookingList();
        } catch (error) {
          console.error('Error during submit bookings:', error);
        }
      }
    }
  }

  // get booking list
  const getBookingList = async () => {
    if (token) {
      const result = await getBooking(id);
      setBookingList([...result]);
    }
  }

  const deleteBooking = async (bookingId, index) => {
    try {
      await apiCall('DELETE', `bookings/${bookingId}`, {}, token, true);
      const newBookings = [...bookingList];
      newBookings.splice(index, 1);
      setBookingList(newBookings);
    } catch (error) {
      console.error('Error during delete bookings:', error);
    }
  }

  return (
    <div style={{ margin: '2vh 10vw' }}>
      <ImageViewer images={images}/>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>{title}</Typography>
        <Typography display="block" variant="h7" color="text.secondary">
          <div style={{ display: 'flex', alignContent: 'center', height: 'auto', marginBottom: '1vh' }}>
            <HomeIcon />
            {`\u00A0${type}`}{'\u00A0\u00A0'}
          </div>
        </Typography>
        <Typography display="block" variant="h7" color="text.secondary">
          <div style={{ display: 'flex', alignContent: 'center', height: 'auto', marginBottom: '1vh' }}>
            <LocalHotelIcon />
            {'\u00A0'}
            {bedroom > 0 &&
              <>
                {bedroom === 1
                  ? ` ${bedroom} bedroom`
                  : ` ${bedroom} bedrooms`
                }
              </>
            }
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
          </div>
        </Typography>
        <Typography display="block" variant="h7" color="text.secondary">
          <div style={{ display: 'flex', alignContent: 'center', height: 'auto', marginBottom: '1vh' }}>
            <LocationOnIcon />{'\u00A0'}
            {`${address.street}, ${address.city}, ${address.state}, ${address.postcode}, ${address.country}`}
          </div>
        </Typography>
        <Typography display="block" variant="h7" color="text.secondary">
          <div style={{ display: 'flex', alignContent: 'center', height: 'auto' }}>
            <PersonIcon />{'\u00A0'}
            {owner}
          </div>
        </Typography>
        <br />
        <Typography sx={{ fontWeight: 'bold', ml: '0.7vh' }}>
          {nights
            ? `$${nights * price} total for ${nights} ${nights === 1 ? 'night' : 'nights'} (${from} -  ${to})`
            : `$${price} per night`
          }
        </Typography>

      <hr />
      {/* Date Availability */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Date Availability</Typography>
      <TableContainer component={Paper} sx={{ margin: '2vh 0' }}>
        <Table size="small" aria-label="a dense table">
          <TableHead sx={{ bgcolor: '#699DD1', fontWeight: 'bold' }}>
            <TableRow>
              <TableCell align="left">Id</TableCell>
              <TableCell align="left">Start</TableCell>
              <TableCell align="left">End</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {availabilities.map((row, idx) => (
              <TableRow key={'available' + idx + 1}>
                <TableCell component="th" scope="row">{idx + 1}</TableCell>
                <TableCell align="left">{row.from}</TableCell>
                <TableCell align="left">{row.to}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <hr />
      {/* Amenities */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Amenities</Typography>
      <div style={{ marginLeft: '10vw' }}>
        <Grid style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: '2vh' }}>
          {amenitiesList.map((amenity) => (
            amenities[amenity.key] && (
              <div key={amenity.key} style={{ display: 'flex', alignItems: 'center', height: 'auto', width: '20vw', margin: '2vh 0' }}>
                <amenity.icon />{'\u00A0'}
                <span>{amenity.label}</span>
              </div>
            )
          ))}
        </Grid>
      </div>
      <hr />
      {/* Bookings */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Your Bookings</Typography>
      <TableContainer component={Paper} sx={{ margin: '2vh 0' }}>
        <Table size="small" aria-label="a dense table">
          <TableHead sx={{ bgcolor: '#699DD1', fontWeight: 'bold' }}>
            <TableRow>
              <TableCell align="left">Start</TableCell>
              <TableCell align="left">End</TableCell>
              <TableCell align="left">Total Price</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {bookingList.map((row, idx) => (
              (row.owner === email &&
                <TableRow key={'booking' + row.id}>
                <TableCell align="left">{row.dateRange.from}</TableCell>
                <TableCell align="left">{row.dateRange.to}</TableCell>
                <TableCell align="left">${'\u00A0'}{row.totalPrice}</TableCell>
                <TableCell align="left" style={{ color: getStatusColor(row.status) }}>{row.status.toUpperCase()}</TableCell>
                <TableCell align="left">
                  <Tooltip title="Delete" arrow placement="right">
                    <DeleteIcon
                      sx={{
                        color: 'red',
                        '&:hover': {
                          cursor: 'pointer',
                        }
                      }}
                      onClick={() => deleteBooking(row.id, idx)}
                      aria-label="Click me to delete a booking"
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
              )
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '2vh 0', justifyContent: 'space-around' }}>
          <DemoItem label="Start Date">
            <DatePicker
              defaultValue={currentDate}
              minDate={currentDate}
              onChange={(value) => updateBooking(value, 'from')}
              id={'bookFrom-' + title.replace(/\s/g, '')}
            />
            {/* <DateCalendar
              defaultValue={currentDate}
              minDate={currentDate}
              onChange={(value) => updateBooking(value, 'from')}
              id={'bookFrom-' + title.replace(/\s/g, '')}
            /> */}
          </DemoItem>
          <DemoItem label="End Date">
            <DatePicker
              defaultValue={currentDate}
              minDate={currentDate}
              onChange={(value) => updateBooking(value, 'to')}
              id={'bookTo-' + title.replace(/\s/g, '')}
            />
          </DemoItem>
        </div>
      </LocalizationProvider>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '1vh 0', fontWeight: 'bold', color: '#FBBE49', textDecoration: 'underline' }}>
        ${totalPrice} total
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={submitBooking}
          aria-label="Click me to make a booking"
          id='buttonBooking'
        >
          Booking
        </Button>
      </div>
      <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/>
      <hr />
      {/* review */}
      <Reviews booking={bookingList}/>
    </div>
  )
}
export default ListingDetail;
