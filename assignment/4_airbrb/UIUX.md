### MessageAlert component
* The MessageAlert component is created to prompt users when they click on the corresponding button but the input content does not meet the requirements, and the messages will be changed depend on different error conditions.
* such as when clicking on the 'Booking' button of the selected listing page, for the following conditions, the alert will show from the button. 
    - the date range is not valid (start date > end date): 'Invalid date range'
    - the date range is unavailable: 'Unavailable date range'
    - the user hasn't logged in: 'Login to make your booking'
    - the user is the hoster: 'You can\'t book your own listing'
* for different types, different alert types are used. For all the error conditions, we use 'error' type and for all the successful conditions, we use 'success' type.

### Listing Availabilities
* The Listing Availabilities are shown on the selected listing page for user to check which slot they prefer.

### Images Viewer
* The thumbnail list of all the images (include the listing thumbnail) is provided on the selected listing page for users to pick the images they are interested in.

### Booked Flag
* For 2.3.1, "In terms of ordering of displayed published listings: Listings that involve bookings made by the customer with status accepted or pending should appear first in the list (if the user is logged in)." All the booked listings will be added a booked flag on the right top position.

### Booking status
* On the selected listing page and the booking management page, the booking status are shown with different color:
    - accepted: green
    - declined: red
    - pending: yellow

### Tooltip
* The Tooltip tool is used to prompt users for the purpose of corresponding icons.
* such as icons on the hosted page, when the mouse hovers, there will be corresponding prompts.