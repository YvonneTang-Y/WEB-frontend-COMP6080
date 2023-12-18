import React from 'react';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';

const NewBox = styled(Box)`
  padding: 0.5vh 8vw;
`;

const Address = (props) => {
  const { street, setStreet, city, setCity, state, setState, postcode, setPostcode, country, setCountry } = props;
  return (
    <NewBox>
      <Card>
        <CardContent>
          <p>Street</p>
          <TextField id='createStreet' fullWidth size="small" value={street} type="text" onChange={(event) => { setStreet(event.target.value) }}/>
          <p>City</p>
          <TextField id='createCity' fullWidth size="small" value={city} type="text" onChange={(event) => { setCity(event.target.value) }}/>
          <p>State</p>
          <TextField id='createState' fullWidth size="small" value={state} type="text" onChange={(event) => { setState(event.target.value) }}/>
          <p>Postcode</p>
          <TextField id='createPostcode' fullWidth size="small" value={postcode} type="text" onChange={(event) => { setPostcode(event.target.value) }}/>
          <p>Country</p>
          <TextField id='createCountry' fullWidth size="small" value={country} type="text" onChange={(event) => { setCountry(event.target.value) }}/>
        </CardContent>
      </Card>
    </NewBox>
  )
}

export default Address;
