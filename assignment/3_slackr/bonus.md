### Logo
* design a logo for this website

### Register
* check validation of name, email (can't be null but backend accepts)

### Logout button
* Add logout button and it can be accessed within 2 clicks.

### Pin
* If another user in the channel has pinned/unpinned a message, the current logged user will receive an alert to refresh the page when pin/unpin the same message.
* Pinned messages window with scrolling.
* Pinned messages have the same functions as messages in the normal message box: delete(2.3.4), edit(2.3.5), react(2.3.6), pin/unpin(2.3.7), and view photos in channels(only pinned photos)(2.5.2).

### Update user's own profile
* When updating authorised user's own profile, the messages will also be reloaded to get update user information.
* Check validation of name, email.

### Invite
* Show all the users, and set users who have been in this channel as disabled (and add a flag).

### User profiles
* If you click on user's name on a given message, the profile screen also shows the common channels of the user and the authorised user. Specially, when clicking on the authorised user, it will show all the channels joined.

### Show members in channel
* Add an icon (beside invite icon) to show the member list of the current channel.

### Show joined flag
* For each joined channel, there will be a flag after the channel name. Then users don't need to click ecah channel to check if they have joined. And it will be automatically updated within 5 seconds(polling).
