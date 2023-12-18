import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCall, deleteAllChild} from './helpers.js';
import {loadMoreMessages} from './message.js'

///////////////////////////////////////////////////////
// invite
//////////////////////////////////////////////////////

// add listener for invite icon, load all the users (not in channel) in alphabetical order
const inviteIcon = document.getElementById('channel-invite');
inviteIcon.addEventListener('click', () => {
  const globalToken = localStorage.getItem('token');
  const channelId = localStorage.getItem('channelId');
  const parentElement = document.getElementById('invite-body');
  deleteAllChild('invite-body');
  apiCall('GET', 'user', {}, globalToken, true)
  .then((userList) => {
    apiCall('GET', `channel/${channelId}`, {}, globalToken, true)
    .then((channelDetails) => {
      const members = channelDetails.members;
      const fetchUserPromise = userList.users.map((user) => {
        return apiCall('GET', `user/${user.id}`, {}, globalToken, true)
        .then((userDetail) => {
          userDetail.id = user.id;
          return userDetail;
        })
      });
      Promise.all(fetchUserPromise)
      .then((userDetails) => {
        
        orderUser(userDetails);
        // add user to invite modal 
        for (const user of userDetails) {
          const userElement = document.getElementById('user-template').cloneNode(true);
          userElement.id = `user-${user.id}-${user.name}`;
          const userBlock = userElement.querySelector('.user-block');
          const userCheck = userElement.querySelector('.user-check');
          const userContent = userElement.querySelector('.user-information');
          const userId = userElement.querySelector('.user-id');
          const userPhoto = userElement.querySelector('.user-photo');

          userCheck.id = `usercheck-${user.id}-${user.name}`;
          userBlock.htmlFor  = userCheck.id;
          userId.textContent = user.id;
          if (user.image !== undefined && user.image !== null && user.image !== '') {
            userPhoto.src = user.image;
          }
          userContent.textContent = `${user.name} (${user.email})`;
          if (members.includes(user.id)) {
            const checked = userElement.querySelector('.user-checked'); 
            checked.style.display = 'inline';
            userBlock.disabled = true;
            userCheck.disabled = true;
          }
          parentElement.appendChild(userElement);
        }
      })
    })

  })
})

// add listener to invite submit button
const inviteSubmit = document.getElementById('invite-submit');
inviteSubmit.addEventListener('click', () => {
  const globalToken = localStorage.getItem('token');
  const channelId = localStorage.getItem('channelId');
  // find all the checked users
  const userCheckboxes = document.querySelectorAll('.user-check');
  const selectedUsers = [];
  userCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const checkboxId = checkbox.id.split('-');
      const userId = checkboxId[1];
      const userName = checkboxId[2];
      selectedUsers.push(parseInt(userId));
    }
  });
  selectedUsers.forEach((user) => {
    apiCall('POST', `channel/${channelId}/invite`, {
      userId: user
    }, globalToken, true);
  })
  .then(() => {
    alert('Success');
  });
});

// sort userDetails
const orderUser = (userDetails) => {
  return userDetails.sort((a, b) => {
    // if name is null
    const name1 = a.name.toUpperCase();
    const name2 = b.name.toUpperCase();
    if (name1 < name2) {
      return -1;
    }
    if (name1 > name2) {
      return 1;
    }
    return 0
  })
}

///////////////////////////////////////////////////////
// member
//////////////////////////////////////////////////////

// add listener for member icon, load all the users (in channel) in alphabetical order
const memberIcon = document.getElementById('channel-member');
memberIcon.addEventListener('click', () => {
  const globalToken = localStorage.getItem('token');
  const channelId = localStorage.getItem('channelId');
  const parentElement = document.getElementById('member-body');
  deleteAllChild('member-body');
  apiCall('GET', 'user', {}, globalToken, true)
  .then((userList) => {
    apiCall('GET', `channel/${channelId}`, {}, globalToken, true)
    .then((channelDetails) => {
      const members = channelDetails.members;
      const fetchUserPromise = userList.users.map((user) => {
        return apiCall('GET', `user/${user.id}`, {}, globalToken, true)
        .then((userDetail) => {
          userDetail.id = user.id;
          return userDetail;
        })
      });
      Promise.all(fetchUserPromise)
      .then((userDetails) => {
        // order user list
        orderUser(userDetails);
        // add user to invite modal 
        for (const user of userDetails) {
          if (members.includes(user.id)) {
            const memberElement = document.getElementById('member-template').cloneNode(true);
            memberElement.id = `user-${user.id}-${user.name}`;
            const memberContent = memberElement.querySelector('.user-information');
            const memberPhoto = memberElement.querySelector('.user-photo');
  
            if (user.image !== undefined && user.image !== null && user.image !== '') {
              memberPhoto.src = user.image;
            }
            memberContent.textContent = `${user.name} (${user.email})`;
            parentElement.appendChild(memberElement);
          }
        }
      })
    })
  })
})


///////////////////////////////////////////////////////
// update user's own profile
//////////////////////////////////////////////////////

// add listener to 'view & update' profile button
const showProfile = document.getElementById('update-profile');
showProfile.addEventListener('click', () => {showOwnProfile();})
const showProfileBtn = document.getElementById('edit-own-profile');
showProfileBtn.addEventListener('click', () => {showOwnProfile();})

const showOwnProfile = () => {
  const form = document.getElementById('own-profile-form');
  form.reset();
  // set password hidden by default
  const eyeSlash = document.getElementById('password-eye-slash');
  const eyeNoSlash = document.getElementById('password-eye-noslash');
  eyeSlash.style.display = 'none'; 
  eyeNoSlash.style.display = 'inline'; 
  const userId = localStorage.getItem('userId');
  const globalToken = localStorage.getItem('token');
  // get form elements
  const photo = document.getElementById('own-profile-photo');
  const name = document.getElementById('own-profile-name');
  const email = document.getElementById('own-profile-email');
  const nameCurrent = document.getElementById('own-profile-current-name');
  const emailCurrent = document.getElementById('own-profile-current-email');
  const bio = document.getElementById('own-profile-bio');


  // show user's own detail
  apiCall('GET', `user/${userId}`, {}, globalToken, true)
  .then((user) => {
    console.log(user);
    if (user.image !== undefined && user.image !== null && user.image !== '') {
      photo.src = user.image;
    }
    name.value = user.name;
    nameCurrent.value = user.name;
    email.value = user.email;
    emailCurrent.value = user.email;
    bio.value = user.bio;
  })
}

// add listener to 'view & update' submit button
const updateProfile = document.getElementById('own-profile-submit');
updateProfile.addEventListener('click', () => {
  const globalToken = localStorage.getItem('token');
  // get form elements
  const name = document.getElementById('own-profile-name').value.trim();
  const email = document.getElementById('own-profile-email').value.trim();
  const nameCurrent = document.getElementById('own-profile-current-name').value.trim();
  const emailCurrent = document.getElementById('own-profile-current-email').value.trim();
  const bio = document.getElementById('own-profile-bio').value.trim();
  const uploadImage = document.getElementById('photo-file').files;
  const password = document.getElementById('own-profile-password').value;
  const form = document.getElementById('own-profile-form');
  let request = {};
  request.bio = bio;
  // check input validation
  if (name !== '' && email !== '') {
    if (name !== nameCurrent ) {
      request.name = name;
    }

    if (email !== emailCurrent) {
      request.email = email;
    }
    if (password !== '') {
      request.password = password;
    }
    
    if (uploadImage.length > 0) {
      fileToDataUrl(uploadImage[0])
      .then((data) => {
        request.image = data;
        apiCall('PUT', `user`, request, globalToken, true)
        .then(() => {
          localStorage.setItem('userName', name);
          localStorage.setItem('msgStart', 0);
          loadMoreMessages();
          form.reset();
        })
      })
    } else {
      apiCall('PUT', `user`, request, globalToken, true)
      .then(() => {
        localStorage.setItem('userName', name);
        localStorage.setItem('msgStart', 0);
        loadMoreMessages();
        form.reset();
      })
      .catch((msg) => {
        alert(msg);
      })
    }
  } else {
    alert('Invalid name or email');
  }
})

// show or hide password
const passwordInput = document.getElementById('own-profile-password');
const eyeSlash = document.getElementById('password-eye-slash');
const eyeNoSlash = document.getElementById('password-eye-noslash');

eyeNoSlash.addEventListener('click', () => {
  passwordInput.type = 'text';  
  eyeSlash.style.display = 'inline';  
  eyeNoSlash.style.display = 'none';  
});

eyeSlash.addEventListener('click', () => {
  passwordInput.type = 'password'; 
  eyeSlash.style.display = 'none'; 
  eyeNoSlash.style.display = 'inline'; 
});