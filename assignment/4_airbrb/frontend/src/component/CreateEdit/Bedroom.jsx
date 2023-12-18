import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';

// bed type text field component
const BedroomTextField = (props) => {
  const { label, value, onChange } = props;
  return (
    <TextField
    label={label}
    value={value}
    onChange={onChange}
    size='small'
    type="number"
    InputLabelProps={{
      shrink: true,
    }}
    style={{ width: '10vw', margin: '0.5vh 0.5vw' }}
  />
  )
}

const Bedroom = (props) => {
  const { bedroom, idx, bedrooms, setBedrooms } = props;

  // update the beds in a bedroom
  const updateBedroom = (e, index, label) => {
    const newBedrooms = [...bedrooms];
    const newValue = parseInt(e.target.value, 10) || 0;
    newBedrooms[index] = { ...bedrooms[index], [label]: newValue };
    setBedrooms(newBedrooms);
  }

  // delete a bedroom
  const deleteBedroom = (index) => {
    const newBedrooms = [...bedrooms];
    newBedrooms.splice(index, 1);
    setBedrooms(newBedrooms);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
    Bedroom {idx + 1}:
    <BedroomTextField
      label="single"
      value={Math.max(0, bedroom.single)}
      onChange={(event) => { updateBedroom(event, idx, 'single') }}
    />
    <BedroomTextField
      label="double"
      value={Math.max(0, bedroom.double)}
      onChange={(event) => { updateBedroom(event, idx, 'double') }}
    />
    <BedroomTextField
      label="queen"
      value={Math.max(0, bedroom.queen)}
      onChange={(event) => { updateBedroom(event, idx, 'queen') }}
    />
    <BedroomTextField
      label="king"
      value={Math.max(0, bedroom.king)}
      onChange={(event) => { updateBedroom(event, idx, 'king') }}
    />
    <DeleteIcon
      sx={{
        color: 'red',
        '&:hover': {
          cursor: 'pointer',
        }
      }}
      onClick={() => { deleteBedroom({ idx }) }}
      aria-label="Click me to delete a bedroom"
    />
    </div>
  )
}

export default Bedroom;
