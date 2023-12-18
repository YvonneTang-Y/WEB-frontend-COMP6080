import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import useMediaQuery from '@mui/material/useMediaQuery';

const SearchBar = (props) => {
  const { openModal } = props;
  const [isHovered, setIsHovered] = React.useState(false);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const iconSize = isSmallScreen ? 'medium' : 'large';

  const magnifyStyle = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '6vw',
    height: '6vw',
    borderRadius: '50%',
    backgroundColor: isHovered ? '#6FB1F3' : '#1976D2',
    marginLeft: '1vw',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  });

  const searchStyle = () => ({
    display: 'flex',
    color: 'blue',
    alignItems: 'center',
    width: '50vw',
    height: '8vw',
    borderRadius: '20vh',
    border: '2px solid blue',
    borderColor: isHovered ? '#6FB1F3' : '#1976D2',
    margin: 'auto',
    cursor: 'pointer',
  });

  const handleClick = () => {
    if (openModal) {
      openModal();
    }
  }

  return (
    <>
      <div
        style={searchStyle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div style={{ flex: '1' }}>
          <div style={magnifyStyle()}>
            <SearchIcon
              fontSize={iconSize}
              sx={{ fontWeight: 'bolder', color: 'white' }}
            />
          </div>
        </div>
        <div style={{ flex: '10' }}></div>
      </div>
    </>
  )
}

export default SearchBar;
