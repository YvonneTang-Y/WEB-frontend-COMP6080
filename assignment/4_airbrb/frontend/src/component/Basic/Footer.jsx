import React from 'react';
import Typography from '@mui/material/Typography';
// import CopyrightIcon from '@mui/icons-material/Copyright';
import Tooltip from '@mui/material/Tooltip';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <div style={{ display: 'flex', height: 'auto', justifyContent: 'space-between', alignItems: 'center', padding: '1vh 3vw' }}>
      <Typography
        variant="caption"
        display="block"
        gutterBottom
      >
        ©️ 2023 AirBrB
      </Typography>
      <Typography
        variant="caption"
        display="block"
        gutterBottom
        sx={{ fontWeight: 'bold', display: 'flex', height: 'auto', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Contact us{'\u00A0'}
        <Tooltip title="Facebook" arrow placement="top">
          <FacebookIcon
            // onClick={deleteListing}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Tooltip>
        {'\u00A0'}
        <Tooltip title="GitHub" arrow placement="top">
          <GitHubIcon
            // onClick={deleteListing}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Tooltip>
        {'\u00A0'}
        <Tooltip title="LinkedIn" arrow placement="top">
          <LinkedInIcon
            // onClick={deleteListing}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Tooltip>
        {'\u00A0'}
        <Tooltip title="Twitter" arrow placement="top">
          <TwitterIcon
            // onClick={deleteListing}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Tooltip>
        {'\u00A0'}
      </Typography>
    </div>

  )
}

export default Footer;
