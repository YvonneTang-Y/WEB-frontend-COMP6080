import React from 'react';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const NewBox = styled(Box)`
  padding: 0.5vh 8vw;
`;

const BasicInformation = (props) => {
  const { title, setTitle, type, setType, price, setPrice } = props;

  // property type selection
  const SelectPropertyType = () => {
    const handleChange = (event) => {
      setType(event.target.value);
    };

    return (
      <FormControl fullWidth size="small">
        <Select
          labelId="demo-select-small-label"
          value={type}
          onChange={handleChange}
        >
          <MenuItem value={'apartment'}>Apartment</MenuItem>
          <MenuItem value={'house'}>House</MenuItem>
          <MenuItem value={'ensuite'}>Ensuite</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <NewBox>
      <Card>
        <CardContent>
          <p>Listing Title</p>
          <TextField
            id='createTitle'
            fullWidth
            size="small"
            type="text"
            value={title}
            onChange={(event) => { setTitle(event.target.value) }}
          /> <br />
          <p>Property Type</p>
          <SelectPropertyType />
          <p>Listing Price (per night)</p>
          <TextField
            id='createPrice'
            fullWidth
            size='small'
            type="number"
            value={price}
            onChange={(event) => { setPrice(parseInt(event.target.value, 10) || 0) }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </CardContent>
      </Card>
    </NewBox>
  )
}

export default BasicInformation;
