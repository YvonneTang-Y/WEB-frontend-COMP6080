import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import * as React from 'react';
import Header from '../component/Basic/Header';

/**
 * for Header: const { token, setToken } = props;
 * different buttons will be shown with different user status(logged in or not)
 * click on different button, will navigate to different page
 */

// simulate useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Header Test', () => {
  /**
   * for user logded in
   * check the header content and click hosted button
   */
  it('renders Header component with a logged in user', () => {
    const setToken = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValueOnce((url) => {
      expect(url).toBe('/hosted');
    });
    render(
      <Router>
        <Header token="testToken" setToken={setToken} />
      </Router>
    );
    // check header content
    expect(screen.getByText('Hosted')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // click on hosted button
    userEvent.click(screen.getByText('Hosted'));
  })

  /**
   * for user logded in
   * check when click on logout button
   * the page should navigate to login page
   */
  it('log out', () => {
    const setToken = jest.fn();
    // const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValueOnce((url) => {
      expect(url).toBe('/login');
    });
    render(
      <Router>
        <Header token="testToken" setToken={setToken} />
      </Router>
    );
    // click on logout button
    userEvent.click(screen.getByText('Logout'));
    expect(setToken).toHaveBeenCalledWith(null);
  })
  /**
   * for user not logged in
   * check the header content
   */
  it('check header content for unlogged in user', () => {
    const setToken = jest.fn();
    // const mockNavigate = jest.fn();
    render(
      <Router>
        <Header token="" setToken={setToken} />
      </Router>
    );
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  })

  /**
   * for user not logged in
   * check when click on register button
   * the page should navigate to register page
   */
  it('check when click on register button', () => {
    const setToken = jest.fn();
    // const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValueOnce((url) => {
      expect(url).toBe('/register');
    });
    render(
      <Router>
        <Header token="" setToken={setToken} />
      </Router>
    );
    // click on register button
    userEvent.click(screen.getByText('Register'));
  })

  /**
   * for user not logged in
   * check when click on login button
   * the page should navigate to login page
   */
  it('check when click on login button', () => {
    const setToken = jest.fn();
    // const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValueOnce((url) => {
      expect(url).toBe('/login');
    });
    render(
      <Router>
        <Header token="" setToken={setToken} />
      </Router>
    );
    // click on register button
    userEvent.click(screen.getByText('Login'));
  })
})
