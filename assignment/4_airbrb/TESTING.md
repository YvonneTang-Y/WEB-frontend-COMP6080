UI Testing: frontend/src/cypress/e2e

Component Testing: frontend/src/componentTesting

There are some linting error about Cypress. I think they should be ignored. 

### 1. Registers successfully
* Check form completeness: click on 'register' button and the page should contain the pop up error message.
* Check password unmatched: type unmatched password and the page should contain the error message.
* Check if register successfully: click on 'register' button and the header should contain 'Hosted' button.

### 2. Creates a new listing successfully
* Check navigation to create listing page: click on 'create' button on the hosted page and check the url should contain 'localhost:3000/create'
* Fill in the form.
* A problem: when uploading images, it cannot been shown successfully, but when I upload manually, it works.
    - The reason should be that when using 'cy.fixture', it can't get the same file content as file input.
* Check if created successfully: click on 'submit' button, check navigation to hosted page and check there should be a listing containing the exact name.

### 3. Updates the thumbnail and title of the listing successfully
* Check navigation to edit listing page: click on the 'edit' button on the hosted page and check the url changed.
* On edit listing page, the information of listing will be shown, therefore, we can check if the thumbnail exist.
* Check deleting the original thumbnail successfully: click on the delete button, the selected thumbnai will not exist.
    - This step can be skipped, we can just click on the upload button and the original thumbnail will be replaced since thumbnail only needs one image.
* Check uploaing a thumbnail again: the thumbnail image will exist.
* Check if updating successfully: find the updated title on the hosted page.

### 4. Publish a listing successfully
* Click on the unpublished link, type the date range and submit, then check if the unpublished link content is changed to 'Published'.

### 5. Unpublish a listing successfully
* Click on the published link, and check if the published link content is changed to 'Unpublished'.

### 6. Make a booking successfully
* Preparation work (6.1 & 6.2): publish the listing again, register and login a new account.
* Choose the listing created previously and check navigation of the selected listing.
* Check if booking successfully: type a valid date range, click on the booking button and check if there is a booking record contains the date range.

### 7. Logs out of the application successfully
* Check navigation to the login page: click on logout button and check the url.

### 8. Logs back into the application successfully
* Check navigation to the root url page: type account information correctly, click on the login submit button and check the url.