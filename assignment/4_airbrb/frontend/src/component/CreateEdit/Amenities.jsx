import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const NewBox = styled(Box)`
  padding: 0.5vh 8vw;
`;

const Amenities = (props) => {
  const { amenities, setAmenities } = props;

  // update amenities
  const handleAmenityChange = (event) => {
    const { name, checked } = event.target;
    setAmenities({ ...amenities, [name]: checked });
  };
  return (
    <NewBox>
      <Card>
        <CardContent>
          <FormGroup style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <FormControlLabel control={<Checkbox name="wifi" checked={amenities.wifi} onChange={handleAmenityChange}/>} label="Wifi" style={{ width: '28vw', margin: '0' }} />
            <FormControlLabel control={<Checkbox name="shower" checked={amenities.shower} onChange={handleAmenityChange}/>} label="Shower" style={{ width: '28vw', margin: '0' }} />
            <FormControlLabel control={<Checkbox name="lift" checked={amenities.lift} onChange={handleAmenityChange}/>} label="Lift" style={{ width: '28vw', margin: '0' }} />
            <FormControlLabel control={<Checkbox name="parking" checked={amenities.parking} onChange={handleAmenityChange}/>} label="Parking" style={{ width: '28vw', margin: '0' }} />
            <FormControlLabel control={<Checkbox name="gym" checked={amenities.gym} onChange={handleAmenityChange}/>} label="Gym" style={{ width: '28vw', margin: '0' }} />
            <FormControlLabel control={<Checkbox name="firstAid" checked={amenities.firstAid} onChange={handleAmenityChange}/>} label="First Aid" style={{ width: '28vw', margin: '0' }} />
          </FormGroup>
        </CardContent>
      </Card>
    </NewBox>
  )
}

export default Amenities;
