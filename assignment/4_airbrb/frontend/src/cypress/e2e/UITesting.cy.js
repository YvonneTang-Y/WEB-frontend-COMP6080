import { cyan } from "@mui/material/colors";
import 'cypress-file-upload';

describe('user happy path', () => {
  const email = `${Math.random() * 10}@gmail.com`;
  // const email = 'test15@gmail.com';
  const password = 'test';
  const passwordConfirmedWrong = 'wrong';
  const passwordConfirmedCorrect = 'test';
  const name = 'test';
  const email2 = `${Math.random() * 10}@gmail.com`;
  // const email2 = 'check15@gmail.com';
  const password2 = 'check';
  const passwordConfirmedWrong2 = 'wrong';
  const passwordConfirmedCorrect2 = 'check';
  const name2 = 'check'

  const listingName = 'test first8';
  const listingNameUpdate = 'test update8';
  const date = 12232023;
  const month = date.toString().substring(0, 2);
  const day = date.toString().substring(2, 4);
  const year = date.toString().substring(4);

	beforeEach(() => {
    cy.visit('http://localhost:3000/')
	})
  // 0. load page
  it('0. Navigate to the root URL(landing page) successfully', () => {
    cy.visit('http://localhost:3000/')
    cy.url().should('include', 'localhost:3000');
  })

  // 1. Registers successfully
  it('1. Registers successfully', () => {
    cy.get('#Register').click();
    cy.url().should('include', 'localhost:3000/register');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    // error pop up
    cy.get('#buttonRegister').click();
    cy.get('svg[data-testid="ErrorOutlineIcon"]');
    // check password matched
    cy.get('#passwordConfirmed').type(passwordConfirmedWrong);
    cy.get('#unmatchError').contains('Password unmatched');
    cy.get('#passwordConfirmed').clear().type(passwordConfirmedCorrect);
    cy.get('#unmatchError').should('not.exist');
    cy.get('#name').type(name);
    // register successfully
    cy.get('#buttonRegister').click();
    cy.url().should('include', 'localhost:3000');
    cy.get('#Hosted').should('exist');
  });

  // 2. Creates a new listing successfully
  it('2. Creates a new listing successfully', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    // navigate to hosted page
    cy.get('#Hosted');
    cy.get('#Hosted').click();
    cy.url().should('include', 'localhost:3000/hosted');
    cy.get('#createHosted').click();
    cy.url().should('include', 'localhost:3000/create');
    cy.get('#createTitle').type(listingName);
    cy.get('#createPrice').type('{selectall}1586');
    cy.get('#createStreet').type('28 george st');
    cy.get('#createCity').type('Sydney');
    cy.get('#createState').type('NSW');
    cy.get('#createPostcode').type('2048');
    cy.get('#createCountry').type('Australia');
    // upload thumbnail
    cy.fixture('th1.jpg').then(fileContent => {
      cy.log(fileContent);
      cy.get('#thumbnailInput').attachFile({
        fileContent:fileContent,
        fileName: 'th1.jpg',
        mimeType: 'image/jpeg'
      });
    });
    // check if the thumbnail is visable
    cy.get('img[alt="thumbnail0"]').should('be.visible');
    // update property images
    cy.fixture('img1.jpg').then(fileContent => {
      cy.get('#propertyImagesInput').attachFile({
        fileContent:fileContent,
        fileName: 'img1.jpg',
        mimeType: 'image/jpeg'
      });
    });
    // check if the property images is visable
    cy.get('img[alt="propertyImages0"]').should('be.visible');
    cy.wait(500);
    cy.get('#createBedroom').click();
    cy.get('#createBathroom').type('{selectall}3');
    cy.get('#createButton').click();
    cy.url().should('include', 'localhost:3000/hosted');
    cy.get(`p:contains(${listingName})`).should('exist');
  });

  // 3. Updates the thumbnail and title of the listing successfully
    it('3. Updates the thumbnail and title of the listing successfully', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    // navigate to hosted page
    cy.get('#Hosted')
    cy.get('#Hosted').click();
    cy.url().should('include', 'localhost:3000/hosted');
    // edit
    cy.get(`#editListing-${listingName.replace(/\s/g, '')}`).click();
    cy.url().should('include', 'localhost:3000/edit');
    // update thumbnail and title
    cy.get('#createTitle').type(`{selectall}${listingNameUpdate}`);
    
    // check if the thumbnail is visable
    cy.get('img[alt="thumbnail0"]').should('be.visible');
    // after click delete button, check if the thumnail has been deleted
    cy.get('#delete-thumbnail0').click()
    cy.get('img[alt="thumbnail0"]').should('not.exist');

    cy.fixture('th2.jpg').then(fileContent => {
      cy.log(fileContent);
      cy.get('#thumbnailInput').attachFile({
        fileContent,
        fileName: 'th2.jpg',
        mimeType: 'image/jpeg'
      });
    });
    // check if the thumbnail is visable
    cy.get('img[alt="thumbnail0"]').should('be.visible');
    // after updating the listing information
    cy.get('#createButton').click();
    cy.url().should('include', 'localhost:3000/hosted');
    cy.get(`p:contains(${listingNameUpdate})`).should('exist');
  });

  // 4. Publish a listing successfully
  it('4. Publish a listing successfully', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    // navigate to hosted page
    cy.get('#Hosted');
    cy.get('#Hosted').click();
    cy.url().should('include', 'localhost:3000/hosted');
    // click unpublished link and input
    cy.wait(1000);
    cy.get(`#published-${listingNameUpdate.replace(/\s/g, '')}`).click();
    cy.get('input[type="text"]').each(($input, idx) => {
      cy.wrap($input).type(date + 2 * idx);
    });
    cy.get(`#availableSubmit-${listingNameUpdate.replace(/\s/g, '')}`).click();
    // check status change
    cy.get(`#published-${listingNameUpdate.replace(/\s/g, '')}`).should('include.text', 'Published');
  });

  // 5. Unpublish a listing successfully
  it('5. Unpublish a listing successfully', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    // navigate to hosted page
    cy.get('#Hosted');
    cy.get('#Hosted').click();
    cy.url().should('include', 'localhost:3000/hosted');
    // click published link
    cy.wait(1000);
    cy.get(`#published-${listingNameUpdate.replace(/\s/g, '')}`).click();
    cy.get(`#published-${listingNameUpdate.replace(/\s/g, '')}`).should('include.text', 'Unpublished');
  });

  // 6.1. Publish the listing again
  it('6.1. Publish the listing again', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    // navigate to hosted page
    cy.get('#Hosted');
    cy.get('#Hosted').click();
    cy.url().should('include', 'localhost:3000/hosted');
    // click unpublished link and input
    cy.wait(1000);
    cy.get(`#published-${listingNameUpdate.replace(/\s/g, '')}`).click();
    cy.get('input[type="text"]').each(($input, idx) => {
      cy.wrap($input).type(date + 2 * idx);
    });
    cy.get(`#availableSubmit-${listingNameUpdate.replace(/\s/g, '')}`).click();
    // check status change
    cy.get(`#published-${listingNameUpdate.replace(/\s/g, '')}`).should('include.text', 'Published');
  });

  // 6.2. Register a new account
  it('6.2. Register a new account', () => {
    cy.get('#Register').click();
    cy.url().should('include', 'localhost:3000/register');
    cy.get('#email').type(email2);
    cy.get('#password').type(password2);
    // error pop up
    cy.get('#buttonRegister').click();
    cy.get('svg[data-testid="ErrorOutlineIcon"]');
    // check password matched
    cy.get('#passwordConfirmed').type(passwordConfirmedWrong2);
    cy.get('#unmatchError').contains('Password unmatched');
    cy.get('#passwordConfirmed').clear().type(passwordConfirmedCorrect2);
    cy.get('#unmatchError').should('not.exist');
    cy.get('#name').type(name2);
    // register successfully
    cy.get('#buttonRegister').click();
    cy.url().should('include', 'localhost:3000');
    cy.get('#Hosted');
  });

  // 6. Make a booking successfully
  it('6. Make a booking successfully', () => {
    // login another account
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email2);
    cy.get('#password').type(password2);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    // navigate to listings page
    cy.get('#Listings').click();
    // click published link
    cy.wait(1000);
    cy.get(`#card-${listingNameUpdate.replace(/\s/g, '')}`).click();
    cy.url().should('include', 'localhost:3000/listing/');
    cy.get('input[type="text"]').each(($input, idx) => {
      cy.wrap($input).type(date + idx);
    });
    cy.get('#buttonBooking').click();
    cy.get(`td:contains(${year}/${month}/${day})`).should('exist');
  });

  // 7. Logs out of the application successfully
  it('7. Logs out of the application', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    cy.get('#Logout').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#Hosted').should('not.exist');
  });

  // 8. Logs back into the application successfully
  it('8. Logs back into the application', () => {
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000');
    cy.get('#Logout').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#Hosted').should('not.exist');
    cy.get('#Login').click();
    cy.url().should('include', 'localhost:3000/login');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#buttonLogin').click();
    cy.url().should('include', 'localhost:3000/');
    cy.get('#Hosted').should('exist');
  });

})
