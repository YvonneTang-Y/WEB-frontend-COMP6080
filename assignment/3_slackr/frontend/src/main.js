import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCall, apiCallGet, apiCallPost, apiCallPut } from './helpers.js';
import {loadMoreMessages} from './message.js'

console.log('Let\'s go!');

let globalToken = null;
let globalUserId = null;
let currentChannelId = null;
let currentChannelName = null;

// function to join a channel
export const joinChannel = (channelId, channelName) => {
  apiCall('POST', `channel/${channelId}/join`, {}, globalToken, true)
  .then(() => {
    apiCall('GET', `channel/${channelId}`, {}, globalToken, true)
    // get channel page
    .then(body => {
      chooseChannelPage(channelId, channelName, body, true);
    })
  })
  .catch(msg => {
    alert(msg);
  })
}

// the correct channel page to show
export const chooseChannelPage = (channelId, channelName, channelInformation, flag) => {
  for (const page of document.querySelectorAll('.channel-page-block')) {
    page.style.display = 'none';
  }
  let element;
  if (flag) {
    for (const message of document.querySelectorAll('.single-message')) {
      message.style.display = 'none';
    }
    for (const message of document.querySelectorAll(`.message-${channelId}`)) {
      message.style.display = 'block';
    }
    localStorage.setItem('msgStart', 0);
    document.getElementById('channel-page-layout').style.display = 'block';

    apiCall('GET', `user/${channelInformation.creator}`, {}, globalToken, true)
    .then(user => {

      const element = document.getElementById('channel-page-header');
      let channelType = 'public';
      if (channelInformation.private) {
        channelType = 'private';
      }
      // show channel details
      element.querySelector('.show-channel-name').textContent = `# ${channelInformation.name}`;

      document.querySelector('.show-channel-name-modal').textContent = `${channelInformation.name}`;
      document.querySelector('.show-channel-type').textContent = `${channelType}`;
      document.querySelector('.show-channel-time').textContent = `${validDate(channelInformation.createdAt)}`;
      document.querySelector('.show-channel-creator').textContent = `${user.name}(${user.email})`;
      
      if (channelInformation.description.trim() !== '') {
        document.querySelector('.show-channel-description').textContent = `${channelInformation.description}`;
      } else {
        document.querySelector('.show-channel-description').textContent = 'default';
      }
      
      loadMoreMessages();
      const channelLink = document.getElementById(`${channelId}`);
      channelLink.querySelector('.bi-check-circle-fill').style.display = 'inline'
      })
  } else{
    document.getElementById('channel-join-page').style.display = 'block';
    element = document.getElementById('channel-join-page');
    const contentElement = element.querySelector('.inaccessible-content');
    contentElement.textContent = `Authorised user is not a member of this channel: ${channelName}`;
    const channelLink = document.getElementById(`${channelId}`);
    channelLink.querySelector('.bi-check-circle-fill').style.display = 'none'
  }
}

// generate valid date
const validDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
  return formattedDate;
}

// show channel page
export const showChannelPage = (channelId, channelName) => {
  let channelInformation;
  apiCall('GET', `channel/${channelId}`, {}, globalToken, true)
  // get channel page
  .then(body => {
    channelInformation = body;
    chooseChannelPage(channelId, channelName, channelInformation, true);
  })
  .catch((msg) => {
    console.log(msg);
    chooseChannelPage(channelId, channelName, null, false);
  })

}

// 2.2.1 Viewing a list of channels
const deleteChannels = (channelTypeName) => {
  let channelType;
  let childElements;
  channelType = document.getElementById(channelTypeName);
  childElements = channelType.children;
  for (let i = childElements.length - 1; i >= 1; i--) {
    channelType.removeChild(childElements[i]);
  }
}

/*
load channel sidebar and add listener to show associated channel detailed page
*/
const loadChannels = (userId) => {
  apiCall('GET', 'channel', {}, globalToken, true)
  .then(body => {
    deleteChannels('private-channel');
    deleteChannels('public-channel');

    for (const channel of body.channels) {
      addChannelCatalog(channel, userId);
    }

  });
}

/**
 * add one channel to the catalog
 */
export const addChannelCatalog = (channel, userId) => {
  const privateChannles = document.getElementById('private-channel');
  const publicChannles = document.getElementById('public-channel');
  const element = document.getElementById('channel-template').cloneNode(true);
  element.querySelector('a').textContent = `# ${channel.name}`;
  element.querySelector('a').href = `#channel=${channel.id}`;
  console.log(element.querySelector('a'));
  element.id = `${channel.id}`;
  if (channel.private) {
    const isMemberInList = channel.members.includes(parseInt(userId));
    // console.log(channel.name, userId, isMemberInList, channel.members);
    if (isMemberInList) {
      privateChannles.appendChild(element);
    }
  } else {
    publicChannles.appendChild(element);
  }
  element.addEventListener('click', () => {
    localStorage.setItem('channelId', channel.id);
    currentChannelId = channel.id;
    currentChannelName = channel.name;
    showChannelPage(channel.id, channel.name);
  });
}


// control which whole page to show (register, login, channel)
const showPage = (pageName) => {
  for (const page of document.querySelectorAll('.page-block')) {
    page.style.display = 'none';
  }
  document.getElementById(`page-${pageName}`).style.display = 'block';
  if (pageName === 'dashboard') {
    loadChannels(globalUserId);
  }
}

/*
add listerner for 'register submit button'
*/
document.getElementById('register-submit').addEventListener('click', () => {
  const email = document.getElementById('register-email').value;
  const name = document.getElementById('register-name').value;
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;

  // check the completeness of the register form
  if (email === "" || name === "" || password === "" || passwordConfirm === "") {
    alert('Please fill in the register form');
  } else if (password !== passwordConfirm) {
    alert('Passwords need to match');
  } else {
    console.log(email, name, password, passwordConfirm);

    apiCall('POST', 'auth/register', {
      email: email,
      name: name,
      password: password,
    })
    .then((body) => {
      console.log(body);
      const { token, userId } = body;
      globalToken = token;
      globalUserId = userId;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      showPage('dashboard');
      const form = document.getElementById('register-form');
      form.reset();
    })
    .catch((msg) => {
      alert(msg);
    });
  }
});

/*
add listerner for 'login submit button'
*/
document.getElementById('login-submit').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // check the completeness of the register form
  if (email === ""|| password === "") {
    alert('Please fill in the login form');
  } else {
  
    apiCall('POST', 'auth/login', {
      email: email,
      password: password,
    })
    .then((body) => {
      const { token, userId } = body;
      globalToken = token;
      globalUserId = userId;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      apiCall('GET', `user/${userId}`, {}, globalToken, true)
      .then((body) => {
        localStorage.setItem('userName', body.name);
      })
      showPage('dashboard');
      const form = document.getElementById('login-form');
      form.reset();
    })
    .catch((msg) => {
      alert(msg);
    });
  }
});

document.getElementById('logout').addEventListener('click', () => {
  apiCall('POST', 'auth/logout', {}, globalToken, true)
  .then(() => {
    localStorage.removeItem('token');
    showPage('register');
  })
});

/*
add listener for 'channel leave'
*/
document.getElementById('channel-leave').addEventListener('click', () => {
  apiCall('POST', `channel/${currentChannelId}/leave`, {}, globalToken, true)
  .then(() => {
    chooseChannelPage(currentChannelId, currentChannelName, false);
  });
});

for (const redirect of document.querySelectorAll('.redirect')) {
  const newPage = redirect.getAttribute('redirect');
  redirect.addEventListener('click', () => {
    showPage(newPage);
  })
}

/**
 * add listener to edit channel
 */
document.getElementById('channel-edit').addEventListener('click', () => {
  const channelName = document.querySelector('.show-channel-name').textContent.substring(2);
  const channelDescription = document.querySelector('.show-channel-description').textContent;
  document.getElementById('edit-channel-name').value = channelName;
  document.getElementById('edit-channel-description').value = channelDescription;
})


/**
 * add listener to edit submit
 */
document.getElementById('edit-channel-submit').addEventListener('click', () => {
  const editName = document.getElementById('edit-channel-name').value;
  let editDescription = document.getElementById('edit-channel-description').value;
  if (editName === '') {
    alert('Please fill in the channel name')
  } else {
    if (editDescription === '') {
      editDescription = 'default';
    }
    console.log(editName, editDescription);
    apiCall('PUT', `channel/${currentChannelId}`, {
      name: editName,
      description: editDescription
    }, globalToken, true)
    .then(() => {

      const channelSidebar = document.getElementById(`${currentChannelId}`);
      const channelPage = document.getElementById('channel-page-header');
      const form = document.getElementById('edit-channel-modal-form');
      channelSidebar.querySelector('a').textContent = `# ${editName}`;
      channelPage.querySelector('.show-channel-name').textContent = `# ${editName}`;
      document.querySelector('.show-channel-description').textContent = `${editDescription}`;
      // hide modal
      alert('Success!');
    });
  }
});

/*
add listener for join button
*/
document.getElementById('join-channel-button').addEventListener('click', () => {
  joinChannel(currentChannelId, currentChannelName);
});

// login
const localStorageToken = localStorage.getItem('token');
const localStorageUserId = localStorage.getItem('userId');

if (localStorageToken !== null) {
  globalToken = localStorage.getItem('token');
  globalUserId = localStorage.getItem('userId');
}

if (globalToken === null) {
  showPage('register');
} else {
  showPage('dashboard');
}

/*
add listerner for 'create a new channel'
*/
document.getElementById('create-channel-submit').addEventListener('click', () => {
  const form = document.getElementById('create-channel-modal-form');
  const channelName = document.getElementById('create-channel-name').value;
  const channelType = document.getElementById('create-channel-type').value;
  let channelDescription = document.getElementById('create-channel-description').value;
  apiCall('GET', 'channel', {}, globalToken, true)
  .then(body => {
    if (channelName === "") {
      alert('Please fill in the channel name');
    } else {
      if (channelDescription === "") {
        channelDescription = 'default';
      }
      console.log(channelDescription)
      let privateFlag = false;
      if (channelType === 'private') {
        privateFlag = true;
      }
    
      apiCall('POST', 'channel', {
        name: channelName,
        private: privateFlag,
        description: channelDescription,
      }, globalToken, true)
      .then(() => {
        alert('Success!');
        loadChannels(globalUserId);
        form.reset();
      })
      .catch((msg) => {
        alert(msg);
      });
    }
  })  
});