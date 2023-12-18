import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import MessageAlert from '../component/Basic/MessageAlert';

/**
 * for MessageAlert: const { open, alertType, handleClose, snackbarContent } = props
 * visible or not is determined by variable 'open'
 * different alertType will catch different popup type
 * 'handleClose' is a function used to change 'open' state to 'false'
 * the message content is defined by 'snackbarContent'
 */
describe('MessageAlert', () => {
  /**
   * check error alert
   */
  it('renders MessageAlert with "error" alertType and messageContent', () => {
    const props = {
      open: true,
      alertType: 'error',
      handleClose: jest.fn(),
      snackbarContent: 'Test error Message',
    };
    render(<MessageAlert {...props} />);

    // get error icon
    const errorIcon = screen.getByTestId('ErrorOutlineIcon');
    expect(errorIcon).toBeInTheDocument();

    // get error message
    const successMessage = screen.getByText(props.snackbarContent);
    expect(successMessage).toBeInTheDocument();
  })

  /**
   * check success alert
   */
  it('renders MessageAlert with "success" alertType and messageContent', () => {
    const props = {
      open: true,
      alertType: 'success',
      handleClose: jest.fn(),
      snackbarContent: 'Test success Message',
    };
    render(<MessageAlert {...props} />);

    // get success icon
    const errorIcon = screen.getByTestId('SuccessOutlinedIcon');
    expect(errorIcon).toBeInTheDocument();

    // get success message
    const successMessage = screen.getByText(props.snackbarContent);
    expect(successMessage).toBeInTheDocument();
  })

  /**
   * check manually closing
   */
  it('closes the alert manually', () => {
    const props = {
      open: true,
      alertType: 'success',
      handleClose: jest.fn(),
      snackbarContent: 'Test success Message',
    };
    render(<MessageAlert {...props} />);

    // click on 'x'
    const closeButton = screen.getByLabelText('Close');
    userEvent.click(closeButton);
    expect(props.handleClose).toHaveBeenCalledTimes(1);
  })
})
