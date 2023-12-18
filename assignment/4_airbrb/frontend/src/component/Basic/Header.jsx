import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RegisterIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import HostedIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';

const getIconForPage = (page) => {
  switch (page) {
    case 'Register':
      return <RegisterIcon />;
    case 'Login':
      return <LoginIcon />;
    case 'Logout':
      return <LogoutIcon />;
    case 'Hosted':
      return <HostedIcon />;
    default:
      return <HomeIcon />;
  }
};

const Header = (props) => {
  const { token, setToken } = props;
  const navigate = useNavigate();

  // when loading page
  React.useEffect(() => {
    const checkToken = localStorage.getItem('token');
    if (checkToken) {
      setToken(checkToken);
    }
  }, [])

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const pages = token
    ? ['Listings', 'Hosted', 'Logout']
    : ['Listings', 'Register', 'Login']

  const icons = pages.map((page, idx) => getIconForPage(page));
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', height: 'auto', justifyContent: 'space-around' }}>
        <div style={{ flex: 2 }}>
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="logo" width='125vw'/>
        </div>
        <BottomNavigation
          sx={{ flex: 1 }}
          showLabels
          onChange={(event, newValue) => {
            if (pages[newValue] === 'Logout') {
              logout();
            } else if (pages[newValue] === 'Listings') {
              navigate('/');
            } else {
              navigate(`/${pages[newValue].toLowerCase()}`);
            }
          }}
        >
          {pages.map((page, idx) => {
            return (
              <BottomNavigationAction id={page} key={idx} label={page} icon={icons[idx]} />
            )
          })}
        </BottomNavigation>
      </Box>
      <hr />
    </>
  )
}

export default Header;
