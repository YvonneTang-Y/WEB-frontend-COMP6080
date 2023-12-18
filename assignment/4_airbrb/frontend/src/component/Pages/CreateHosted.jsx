import * as React from 'react';
import Typography from '@mui/joy/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from 'react-router-dom';
import UploadImages from '../CreateEdit/UploadImages';
import apiCall from '../../helper';
import MessageAlert from '../Basic/MessageAlert';
import Bedroom from '../CreateEdit/Bedroom';
import Amenities from '../CreateEdit/Amenities';
import BasicInformation from '../CreateEdit/BasicInformation';
import Address from '../CreateEdit/Address';

const TitleTypography = styled(Typography)`
  padding: 2vw;
  color: #0D99FF;
  font-weight: bold;
  font-size: 1.5em;
  padding: 0vh 8vw;
`;

// upload file component
const FileCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: auto;
`;

const NewBox = styled(Box)`
  padding: 0.5vh 8vw;
`;

const CreateHosted = (props) => {
  const { edit } = props
  const { id } = useParams();
  const [bedrooms, setBedrooms] = React.useState([]);
  const [thumbnail, setThumbnail] = React.useState([]);
  const [images, setImages] = React.useState([]);
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState('apartment');
  const [price, setPrice] = React.useState('0');
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [postcode, setPostcode] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [bathroom, setBathroom] = React.useState('0');
  const [amenities, setAmenities] = React.useState({
    wifi: false,
    shower: false,
    lift: false,
    parking: false,
    gym: false,
    firstAid: false,
  });
  const [open, setOpen] = React.useState(false);
  const [snackbarContent, setSnackbarContent] = React.useState('');
  const [alertType, setAlertType] = React.useState('error');

  const navigate = useNavigate();

  // for edit page
  React.useEffect(() => {
    const fetchData = async () => {
      if (edit) {
        try {
          const fetchResult = await apiCall('GET', `listings/${id}`);
          const result = fetchResult.listing;
          console.log(result);
          // update listing information
          setBedrooms(result.metadata.bedrooms || []);
          setThumbnail(result.thumbnail || '');
          setImages(result.metadata.images || []);
          setTitle(result.title || '');
          setType(result.metadata.type || 'apartment');
          setPrice(result.price || '0');
          setStreet(result.address.street || '');
          setCity(result.address.city || '');
          setState(result.address.state || '');
          setPostcode(result.address.postcode || '');
          setCountry(result.address.country || '');
          setBathroom(parseInt(result.metadata.bathroom) || 0);
          setAmenities(result.metadata.amenities || {
            wifi: false,
            shower: false,
            lift: false,
            parking: false,
            gym: false,
            firstAid: false,
          });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [edit]);

  // change for thumbnail
  const handleThumbnailChange = (newThumbnail) => {
    setThumbnail(newThumbnail);
  };

  // change for property images
  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  // close the toast
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  // add a new line for bedroom
  const addBedroom = () => {
    const newBedrooms = [...bedrooms, {
      single: 0,
      double: 0,
      queen: 0,
      king: 0,
    }];
    setBedrooms(newBedrooms);
  }

  // post this listing to server
  const submitCreation = async () => {
    const requestBody = {
      title,
      address: { street, city, state, postcode, country, },
      price,
      thumbnail,
      metadata: { type, images, amenities, bathroom, bedrooms },
    };

    // input validation check
    if (!title || !price || !type) {
      setSnackbarContent('Please complete the basic information');
      setAlertType('error');
      setOpen(true);
    } else if (!street || !city || !state || !postcode || !country) {
      setSnackbarContent('Please complete the address');
      setAlertType('error');
      setOpen(true);
    } else if (!/^\d+$/.test(postcode)) {
      setSnackbarContent('Please enter a valid numeric postcode');
      setAlertType('error');
      setOpen(true);
    } else if (thumbnail.length <= 0) {
      setSnackbarContent('Please upload thumbnail');
      setAlertType('error');
      setOpen(true);
    } else if (images.length <= 0) {
      setSnackbarContent('Please upload images');
      setAlertType('error');
      setOpen(true);
    } else {
      try {
        const token = localStorage.getItem('token');
        let data;
        if (edit) {
          data = await apiCall('PUT', `listings/${id}`, requestBody, token, true);
        } else {
          data = await apiCall('POST', 'listings/new', requestBody, token, true);
        }
        if (data.error) {
          setSnackbarContent(data.error);
          setAlertType('error');
          setOpen(true);
        } else {
          navigate('/hosted');
        }
      } catch (error) {
        console.error('Error during register:', error);
      }
    }
  }

  // Check if the pressed key is Enter
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      submitCreation();
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex='0'>
    {/* Basic information */}
      <TitleTypography>Basic*</TitleTypography>
      <small style={{ padding: '1vh 8vw' }}>Basic information of your hosted listing</small>
      <BasicInformation title={title} setTitle={setTitle} type={type} setType={setType} price={price} setPrice={setPrice}/>
      {/* Address */}
      <TitleTypography>Address*</TitleTypography>
      <Address street={street} setStreet={setStreet} city={city} setCity={setCity} state={state} setState={setState} postcode={postcode} setPostcode={setPostcode} country={country} setCountry={setCountry}/>
      {/* Thumbnail */}
      <TitleTypography>Thumbnail*</TitleTypography>
      <NewBox>
        <Card>
          <FileCardContent>
            <UploadImages
              id='createThumbnail'
              multiple={false}
              selectedFiles={thumbnail}
              setSelectedFiles={handleThumbnailChange}
              name={'thumbnail'}
            />
          </FileCardContent>
        </Card>
      </NewBox>
      {/* Property Images */}
      <TitleTypography>Property Images*</TitleTypography>
      <NewBox>
        <Card>
          <FileCardContent id='createImages'>
            <UploadImages
              multiple={true}
              selectedFiles={images}
              setSelectedFiles={handleImagesChange}
              name={'propertyImages'}
            />
          </FileCardContent>
        </Card>
      </NewBox>
      {/* Bedrooms */}
      <TitleTypography>Bedrooms</TitleTypography>
      <NewBox>
        <Card>
          <FileCardContent>
            {bedrooms.map((bedroom, idx) => {
              return (
                <Bedroom key={'bedroom' + idx} bedroom={bedroom} idx={idx} bedrooms={bedrooms} setBedrooms={setBedrooms}/>
              )
            })}
            <Button
              id='createBedroom'
              component="span"
              variant="outlined"
              onClick={addBedroom}
              aria-label="Click me to add a bedroom"
            >+ Add Bedroom</Button>
          </FileCardContent>
        </Card>
      </NewBox>
      {/* Bathrooms */}
      <TitleTypography>Bathrooms</TitleTypography>
      <NewBox>
        <Card>
          <FileCardContent>
            <TextField
              id='createBathroom'
              fullWidth
              size='small'
              type="number"
              value={bathroom}
              onChange={(event) => { setBathroom(event.target.value) }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FileCardContent>
        </Card>
      </NewBox>
      {/* Amenities */}
      <TitleTypography>Amenities</TitleTypography>
      <Amenities amenities={amenities} setAmenities={setAmenities}/>
      <br />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '8vh' }}>
        <Button
          id='createButton'
          variant="contained"
          onClick={submitCreation}
          onKeyDown={handleKeyDown} // Add this line to handle key events
          aria-label="Click me to submit the edition/creation"
        >
          {edit ? 'Save' : 'Submit'}
        </Button>
      </div>
      <MessageAlert open={open} alertType={alertType} handleClose={handleClose} snackbarContent={snackbarContent}/>
    </div>
  );
}

export default CreateHosted;
