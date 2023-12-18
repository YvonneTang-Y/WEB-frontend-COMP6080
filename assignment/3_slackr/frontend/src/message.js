import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCall, deleteAllChild } from './helpers.js';
import { addChannelCatalog } from './main.js';


let isLoading = false;
let messagePerPage = 0;
let scrollPosition = 0;
// react background color
let backgroundColor = 'rgb(238, 226, 172)';
const modal = document.getElementById('imageModal');
const imageModal = new bootstrap.Modal(modal);
const pinnedModal = document.getElementById('pinnedModal');
const pinnedNewModal = new bootstrap.Modal(pinnedModal);
const profileModal = document.getElementById('userProfile');
const profileNewModal = new bootstrap.Modal(profileModal);
const modalImage = document.getElementById('image-show');
const prevButton = document.getElementById('prev-image');
const nextButton = document.getElementById('next-image');
let imageList;

/**
 * function to convert ISO string into a vaild time
 */
const timeConvert = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
  return formattedDate;
};

/**
 * add listener for scrolling, when scrolling to top, load more messages
 */
document.getElementById('channel-page-message').addEventListener('scroll', () => {
  const element = document.getElementById('channel-page-message');
  
  if (element.scrollTop === 0) {
    if (!isLoading) {
      isLoading = true;
      scrollPosition = element.scrollHeight;
      showLoadingIndicator();
    }
  }
});

/**
 * fetch messages (about 25 messages one time)
 */
export const loadMoreMessages = () => {
  const channelId = localStorage.getItem('channelId');
  const globalToken = localStorage.getItem('token');
  let start = parseInt(localStorage.getItem('msgStart'));

  apiCall('GET', `message/${channelId}?start=${start}`, {}, globalToken, true)
  .then((body) => {
    if (body.messages.length > 0) {
      messagePerPage = body.messages.length;
      // body.messages.sort((a,b) => a.id - b.id);
      const fetchUserPromise = body.messages.map((message) => {
        return apiCall('GET', `user/${message.sender}`, {}, globalToken, true);
      });
      Promise.all(fetchUserPromise)
      .then((userDetails) =>  {
        if (start === 0) {
          deleteAllChild('channel-page-message');
        }
        for (let i = 0; i < body.messages.length; i++) {
          const message = body.messages[i];
          const userDetail = userDetails[i];

          const element = loadMessage(channelId, message, userDetail);
          const parentElement = document.getElementById('channel-page-message');
          parentElement.insertBefore(element, parentElement.firstChild);
        }

        for (const message of document.querySelectorAll(`.message-${channelId}`)) {
          message.style.display = 'block'
        }

        if (start === 0) {
          const scrollableContent = document.getElementById('channel-page-message');
          scrollableContent.scrollTop = scrollableContent.scrollHeight;
        }
        start += messagePerPage;
        localStorage.setItem('msgStart', start);
        const page = document.getElementById('channel-page-message');
        page.scrollTop = page.scrollHeight - scrollPosition;
        isLoading = false;
        isLoading = false;
      }); 
    } else {
      isLoading = false;
    }
  })
}

/**
 * show loading indicator
 */ 
const showLoadingIndicator = () => {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.textContent = 'Loading...';
  loadingIndicator.className = 'loading-indicator';
  const parentElement = document.getElementById('channel-page-message');
  parentElement.insertBefore(loadingIndicator, parentElement.firstChild);
  console.log('start');
  setTimeout(() => {
    hideLoadingIndicator();
    loadMoreMessages();
  }, 500);
  console.log('end');
}

// hide loading indicator
const hideLoadingIndicator = () => {
  const loadingIndicator = document.querySelector('.loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.parentNode.removeChild(loadingIndicator);
  }
}


/**
 * load one message
 */
const loadMessage = (channelId, message, userDetail) => {
  const globalToken = localStorage.getItem('token');
  let start = parseInt(localStorage.getItem('msgStart'));
  const element = document.getElementById('single-message-template').cloneNode(true);
  element.classList.add(`message-${channelId}`);
  element.id = `message-${channelId}-${message.id}`;
  if (userDetail.image !== null) {
    element.querySelector('.message-photo-image').src = userDetail.image
  }
  element.querySelector('.message-sender').textContent = userDetail.name;
  if (message.edited) {
    element.querySelector('.message-small-time').textContent = timeConvert(message.editedAt);
    element.querySelector('.message-small-edit').style.display = 'inline';
  } else {
    element.querySelector('.message-small-time').textContent = timeConvert(message.sentAt);
  }
  const messageContent = element.querySelector('.message-content');
  if (message.message !== undefined && message.message !== null && message.message !== '') {
    messageContent.querySelector('.message-text').textContent = message.message;
    messageContent.querySelector('.message-text').style.display = 'block';
  }
  const image = messageContent.querySelector('.message-img');
  if (message.image !== undefined && message.image !== null && message.image !== '') {  
    image.src = message.image;
    image.style.display = 'block';
    image.setAttribute('imgId', `image-${channelId}-${message.id}`);
  }

  // add listener for images, show image modal
  image.addEventListener('click', () => {
    imageList = getAllImages('message-img');
    localStorage.setItem('currentImgId', `image-${channelId}-${message.id}`);
    modalImage.src = image.src;
    prevButton.disabled = false;
    nextButton.disabled = false;
    if (imageList[0].id === `image-${channelId}-${message.id}`) {
      prevButton.disabled = true;
    }
    if (imageList[imageList.length - 1].id === `image-${channelId}-${message.id}`) {
      nextButton.disabled = true;
    }
    imageModal.show();
  })
  // for the user's own message, add two extra function: edit, delete
  const deleteMessage = element.querySelector('.message-delete');
  // add listener for delete message icon
  deleteMessage.addEventListener('click', () => {
    deleteAction(channelId, message.id, globalToken);
  });
  const editMessage = element.querySelector('.message-edit');
  // add listener for edit message icon
  editMessage.addEventListener('click', () => {
    messageTypeChange();
    messageLocalStorageUpdate(channelId, message.id);
  });
  if (message.sender === parseInt(localStorage.getItem('userId'))) {
    deleteMessage.style.display = 'block';
    editMessage.style.display = 'block';
  }

  // reacts
  updateReactNumber(element, message);

  const reactHeart = element.querySelector('.react-heart');
  const reactJoy = element.querySelector('.react-joy');
  const reactTears = element.querySelector('.react-tears');
  // add listener for react-heart icon
  reactHeart.addEventListener('click', () => {
    console.log(reactHeart.style.backgroundColor);
    if (reactHeart.style.backgroundColor === backgroundColor) {
      reactMessage(channelId, message.id, 'heart', globalToken, true);
    } else {
      reactMessage(channelId, message.id, 'heart', globalToken, false);
    }
  })
  // add listener for react-joy icon
  reactJoy.addEventListener('click', () => {
    if (reactJoy.style.backgroundColor === backgroundColor) {
      reactMessage(channelId, message.id, 'joy', globalToken, true);
    } else {
      reactMessage(channelId, message.id, 'joy', globalToken, false);
    }
  })
  // add listener for react-tears icon
  reactTears.addEventListener('click', () => {
    if (reactTears.style.backgroundColor === backgroundColor) {
      reactMessage(channelId, message.id, 'tears', globalToken, true);
    } else {
      reactMessage(channelId, message.id, 'tears', globalToken, false);
    }
  })

  // pinned or unpinned
  const pinnedElement = element.querySelector('.pinned');
  const unpinnedElement = element.querySelector('.unpinned');
  if (message.pinned) {
    pinnedElement.style.display = 'block';
    unpinnedElement.style.display = 'none';
  }

  // add listener for react-pin icons
  pinnedElement.addEventListener('click', () => {
    pinMessage(channelId, message.id, globalToken, true)
  });
  unpinnedElement.addEventListener('click',  () => {
    pinMessage(channelId, message.id, globalToken, false)
  });

  // add listener for user name of each message

  const profileSender = element.querySelector('.message-sender');
  profileSender.addEventListener('click', () => {
    showProfile(message.sender)
  });
  element.style.display = 'block';
  return element;
}


///////////////////////////////////////////////////////
// send
//////////////////////////////////////////////////////

/*
 * validate the message 
 * so that empty strings or messages containing only whitespace cannot be sent
 * disable the sent button 
 */
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("message-send");
messageInput.addEventListener('input', () => {
  const messageText = messageInput.value.trim();
  if (messageText === '') {
    sendButton.disabled = true;
  } else {
    sendButton.disabled = false;
  }
});


/*
 * send message when click the send button
 */
sendButton.addEventListener("click", () => {
  const channelId = localStorage.getItem('channelId');
  const globalToken = localStorage.getItem('token');
  let start = parseInt(localStorage.getItem('msgStart'));

  const message = messageInput.value;
  let channelMessage;
  let userDetail;
  if (!sendButton.disabled) {
    messageInput.value = "";
    sendButton.disabled = true;
    let request = {
      message: message
    }
    sendNewMessage(channelId, request, globalToken, start);
  }
});


/*
 * send image when click the image upload button
 */
const imageInput = document.getElementById('image-send');
imageInput.addEventListener('input', () => {
  const channelId = localStorage.getItem('channelId');
  const globalToken = localStorage.getItem('token');
  let start = parseInt(localStorage.getItem('msgStart'));
  const file = imageInput.files[0];
  imageInput.value = '';
  fileToDataUrl(file)
  .then((data) => {
    let request = {
      image: data
    }
    sendNewMessage(channelId, request, globalToken, start);
  })
})


/**
 * function for send a new message/image
 */
const sendNewMessage = (channelId, request, globalToken, start) => {
  apiCall('POST', `message/${channelId}`, request, globalToken, true)
  .then(() => {
    apiCall('GET', `message/${channelId}?start=0`, {}, globalToken, true)
    .then((body) => {
      let channelMessage = body.messages[0];
      apiCall('GET', `user/${channelMessage.sender}`, {}, globalToken, true)
      .then((body) => {
        const userDetail = body;
        const element = loadMessage(channelId, channelMessage, userDetail);
        const parentElement = document.getElementById('channel-page-message');
        // add element to page, update start, set scroll
        parentElement.appendChild(element);
        localStorage.setItem('msgStart', ++start);
        const scrollableContent = document.getElementById('channel-page-message');
        scrollableContent.scrollTop = scrollableContent.scrollHeight;
      })
    })
  })
}


///////////////////////////////////////////////////////
// user profile
//////////////////////////////////////////////////////

/**
 * load information on the profile screen(modal)
 * a little bit difference for the authorised user and the other users
 * show the common channels for authorised user and the other users
 */
export const showProfile = (sender) => {
  const globalToken = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  apiCall('GET', `user/${sender}`, {}, globalToken, true)
  .then((userDetail) => {
    const photo = document.getElementById('user-profile-photo');
    const name = document.getElementById('user-profile-name');
    const email = document.getElementById('user-profile-email');
    const bio = document.getElementById('user-profile-bio');
    const publicHeader = document.getElementById('public-header');
    const privateHeader = document.getElementById('private-header');
    if (userDetail.image !== undefined && userDetail.image !== null && userDetail.image !== '') {
      photo.src = userDetail.image;
    } else {
      photo.src = 'assets/default_profile_photo2.png';
    }
    name.textContent = userDetail.name;
    email.textContent = userDetail.email;
    if (userDetail.bio !== undefined && userDetail.bio !== null && userDetail.bio !== '') {
      bio.textContent = userDetail.bio;
    } else {
      bio.textContent = 'Hello! I\'m here to connect, share, and learn. Feel free to say hi! 😊';
    }

    if (parseInt(sender) === parseInt(userId)) {
      publicHeader.textContent = 'Your public channels';
      privateHeader.textContent = 'Your private channels';
    } else {
      publicHeader.textContent = 'Your common public channels';
      privateHeader.textContent = 'Your common private channels';
    }
    
    deleteAllChild('common-public');
    deleteAllChild('common-private');
    addcommonchannel(sender);
    profileNewModal.show();
  })
  .catch((msg) => {
    alert(msg);
  })
}
/**
 * add common channels for loggin user and another user
 */
const addcommonchannel = (userId) => {
  const commonChannelPublic = document.getElementById('common-public');
  const commonChannelPrivate = document.getElementById('common-private');
  const currentId = localStorage.getItem('userId');
  const globalToken = localStorage.getItem('token');
  apiCall('GET', 'channel', {}, globalToken, true)
  .then((channelList) => { 
    for (const channel of channelList.channels) {
      if (channel.members.includes(parseInt(userId)) && channel.members.includes(parseInt(currentId))) {
        const element = document.getElementById('template-common-channel').cloneNode(true);
        element.removeAttribute('id');
        element.textContent = channel.name;
        if (channel.private) {
          commonChannelPrivate.appendChild(element);
        } else {
          commonChannelPublic.appendChild(element);
        }
      }
    }
  })
}


///////////////////////////////////////////////////////
// channel photos
//////////////////////////////////////////////////////

// get all the shown images information
const getAllImages = (imageClass) => {
  const images = document.querySelectorAll(`.${imageClass}[style*="display: block;"]`);
  const imageInfoArray = [];
  images.forEach(image => {
    imageInfoArray.push({
      id: image.getAttribute('imgId'),
      src: image.src
    });
  });

  return imageInfoArray;
}

// get current image index from currentImgId
const getCurrentImage = (imageList, currentImgId) => {
  for (let i = 0; i < imageList.length; i++) {
    if (imageList[i].id === currentImgId) {
      return i; 
    }
  }
  return -1
}

// add listener for image modal arrow buttons
prevButton.addEventListener('click', () =>{
  let currentImgId = localStorage.getItem('currentImgId');
  
  let currentImgIndex = getCurrentImage(imageList, currentImgId);
  modalImage.src = imageList[--currentImgIndex].src;
  localStorage.setItem('currentImgId', imageList[currentImgIndex].id);
  prevButton.disabled = false;
  nextButton.disabled = false;
  if (currentImgIndex == 0) {
    prevButton.disabled = true;
  }
});

nextButton.addEventListener('click', () =>{
  let currentImgId = localStorage.getItem('currentImgId');
  let currentImgIndex = getCurrentImage(imageList, currentImgId);
  modalImage.src = imageList[++currentImgIndex].src;
  localStorage.setItem('currentImgId', imageList[currentImgIndex].id);
  prevButton.disabled = false;
  nextButton.disabled = false;
  if (currentImgIndex == imageList.length - 1) {
    nextButton.disabled = true;
  }
});

///////////////////////////////////////////////////////
// delete
//////////////////////////////////////////////////////

/**
 * delete messages from both message box and pinned modal
 */
const deleteAction = (channelId, messageId, globalToken) => {
  apiCall('DELETE', `message/${channelId}/${messageId}`, {}, globalToken, true)
  .then(() => {
    const element = document.getElementById(`message-${channelId}-${messageId}`);
    const pinnedElement = document.getElementById(`pinned-${channelId}-${messageId}`);
    if (element) {
      document.getElementById('channel-page-message').removeChild(element);
    }
    if (pinnedElement) {
      document.getElementById('pinned-message-body').removeChild(pinnedElement);
    }
    
  })
}

///////////////////////////////////////////////////////
// react
//////////////////////////////////////////////////////

/**
 * react/unreact request
 */
const reactMessage = (channelId, messageId, request, globalToken, flag) => {
  const element = document.getElementById(`message-${channelId}-${messageId}`);
  const reactElement = element.querySelector(`.react-${request}`);
  const value = reactElement.textContent;
  const count = parseInt(value.split(" ")[1]);
  const react = value.split(" ")[0];
  // for reacted messages
  if (flag) {
    apiCall('POST', `message/unreact/${channelId}/${messageId}`, {
      react: request
    }, globalToken, true)
    .then(() => {
      reactElement.style.backgroundColor = 'transparent';
      reactElement.textContent = `${react} ${count - 1}`;
    })
  } else {
    apiCall('POST', `message/react/${channelId}/${messageId}`, {
      react: request
    }, globalToken, true)
    .then(() => {
      reactElement.style.backgroundColor = backgroundColor;
      reactElement.textContent = `${react} ${count + 1}`;
    })
  }

  const elementPinned = document.getElementById(`pinned-${channelId}-${messageId}`);
  if (elementPinned) {
    const reactElementPinned = elementPinned.querySelector(`.react-${request}`);
    if (flag) {
      reactElementPinned.style.backgroundColor = 'transparent';
      reactElementPinned.textContent = `${react} ${count - 1}`;
    } else {
      reactElementPinned.style.backgroundColor = backgroundColor;
      reactElementPinned.textContent = `${react} ${count + 1}`;
    }
  }

}

/**
 * update react --- different background color and count number
 */
const updateReactNumber = (element, message) => {
  const reactHeart = element.querySelector('.react-heart');
  const reactJoy = element.querySelector('.react-joy');
  const reactTears = element.querySelector('.react-tears');
  const userId = parseInt(localStorage.getItem('userId'));
  const reacts = message.reacts;
  let heartCount = 0;
  let joyCount = 0;
  let tearsCount = 0;
  let heartFlag = false;
  let joyFlag = false;
  let tearsFlag = false;
  reacts.forEach((react) => {
    if (react.react === 'heart') {
      heartCount++;
      heartFlag = true;
    } else if (react.react === 'joy') {
      joyCount++;
      joyFlag = true;
    } else if (react.react === 'tears') {
      tearsCount++;
      tearsFlag = true;
    }
    if (react.user === userId) {
      element.querySelector(`.react-${react.react}`).style.backgroundColor = backgroundColor;
    }
  });

  reactHeart.textContent = `❤️ ${heartCount}`;
  reactJoy.textContent = `😄 ${joyCount}`;
  reactTears.textContent = `😂 ${tearsCount}`;
}

///////////////////////////////////////////////////////
// pin
//////////////////////////////////////////////////////

/**
 * send request to server with pinning/unpinning action
 */
const pinMessage = (channelId, messageId, globalToken, flag) => {
  // for message in the message box
  const element = document.getElementById(`message-${channelId}-${messageId}`);
  const pinnedElement = element.querySelector('.pinned');
  const unpinnedElement = element.querySelector('.unpinned');
  // for message in the pinned box
  const elementPinned = document.getElementById(`pinned-${channelId}-${messageId}`);
  const pinnedIcon = document.getElementById('pinned-message-body');
  if (flag) {
    apiCall('POST',`message/unpin/${channelId}/${messageId}`, {}, globalToken, true)
    .then(() => {
      console.log('unpinned');
      pinnedElement.style.display = 'none';
      unpinnedElement.style.display = 'block';
      pinnedIcon.removeChild(elementPinned);
    })
    .catch(() => {
      alert('The message has benn uppinned by another user, refresh the page to get the latest message.');
    })
  } else {
    apiCall('POST',`message/pin/${channelId}/${messageId}`, {}, globalToken, true)
    .then(() => {
      console.log('pinned');
      pinnedElement.style.display = 'block';
      unpinnedElement.style.display = 'none';
    })
    .catch(() => {
      alert('The message has benn pinned by another user, refresh the page to get the latest message.');
    })
  }
}

/**
 * add listener for pinned icon of the header, show all the pinned message
 */
const pinnedIcon = document.getElementById('channel-pinned');
pinnedIcon.addEventListener('click', () => {
  pinnedNewModal.show();
  // remove all the children
  deleteAllChild('pinned-message-body');
  // add new children 
  const pinnedBody = document.getElementById('pinned-message-body');
  const channelId = localStorage.getItem('channelId');
  const globalToken = localStorage.getItem('token');
  fetchAllPinned(channelId)
  .then((pinnedMessages) => {
    for (const pinnedMsg of pinnedMessages) {
      const pinnedElement = document.getElementById(`message-${channelId}-${pinnedMsg.id}`).cloneNode(true);
      pinnedElement.id = `pinned-${channelId}-${pinnedMsg.id}`;
      pinnedBody.insertBefore(pinnedElement, pinnedBody.firstChild);
      // add listener for pinned images, show image modal
      const pinnedImage = pinnedElement.querySelector('.message-img');
      console.log(pinnedElement, pinMessage);
      pinnedImage.classList.replace('message-img', 'pinned-message-img');
      pinnedImage.addEventListener('click', () => {
        imageList = getAllImages('pinned-message-img');
        console.log(imageList);
        localStorage.setItem('currentImgId', `image-${channelId}-${pinnedMsg.id}`);
        modalImage.src = pinnedImage.src;
        prevButton.disabled = false;
        nextButton.disabled = false;
        if (imageList[0].id === `image-${channelId}-${pinnedMsg.id}`) {
          prevButton.disabled = true;
        }
        if (imageList[imageList.length - 1].id === `image-${channelId}-${pinnedMsg.id}`) {
          nextButton.disabled = true;
        }
        imageModal.show();
      })

      // add listener for the pinned messages
      const pinned = pinnedElement.querySelector('.pinned');
      const image = pinnedElement.querySelector('.pinned-message-img');
      image.classList.add(`message-img-pinned`);
      const unpinned = pinnedElement.querySelector('.unpinned');
      // add listener for react-pin icons
      pinned.addEventListener('click', () => {
        pinMessage(channelId, pinnedMsg.id, globalToken, true)
      });
      // delete
      const deleteMessage = pinnedElement.querySelector('.message-delete');
      // add listener for delete message icon
      deleteMessage.addEventListener('click', () => {
        deleteAction(channelId, pinnedMsg.id, globalToken);
      });

      // edit
      const editMessage = pinnedElement.querySelector('.message-edit');
      editMessage.addEventListener('click', () => {
        messageTypeChange();
        messageLocalStorageUpdate(channelId, pinnedMsg.id);
      })

      // add listener for reacts
      const reactHeartPinned = pinnedElement.querySelector('.react-heart');
      const reactJoyPinned = pinnedElement.querySelector('.react-joy');
      const reactTearsPinned = pinnedElement.querySelector('.react-tears');
      // add listener for react-heart icon
      reactHeartPinned.addEventListener('click', () => {
        if (reactHeartPinned.style.backgroundColor === backgroundColor) {
          reactMessage(channelId, pinnedMsg.id, 'heart', globalToken, true);
        } else {
          reactMessage(channelId, pinnedMsg.id, 'heart', globalToken, false);
        }
      })
      // add listener for react-joy icon
      reactJoyPinned.addEventListener('click', () => {
        if (reactJoyPinned.style.backgroundColor === backgroundColor) {
          reactMessage(channelId, pinnedMsg.id, 'joy', globalToken, true);
        } else {
          reactMessage(channelId, pinnedMsg.id, 'joy', globalToken, false);
        }
      })
      // add listener for react-tears icon
      reactTearsPinned.addEventListener('click', () => {
        if (reactTearsPinned.style.backgroundColor === backgroundColor) {
          reactMessage(channelId, pinnedMsg.id, 'tears', globalToken, true);
        } else {
          reactMessage(channelId, pinnedMsg.id, 'tears', globalToken, false);
        }
      })
    }
    const scrollableContent = document.getElementById('pinned-message-body');
    scrollableContent.scrollTop = scrollableContent.scrollHeight;
  })
})




/**
 * get all the pinned message
 */
const fetchAllPinned = (channelId) => {
  return fetchAllMessages(channelId)
    .then((allMessages) => {
      const pinnedMessages = allMessages.filter((message) => message.pinned === true);
      return pinnedMessages;
    });
}


/**
 * get all the messages from server
 */
const fetchAllMessages = (channelId) => {
  const globalToken = localStorage.getItem('token');
  const messages = [];
  let start = 0;

  const recursive = (page) => {
      const messageArray = Array.from(page.messages);
      if (messageArray.length <= 0) {
          return messages;
      }
      messages.push(...messageArray);
      start += 25;
      return apiCall('GET', `message/${channelId}?start=${start}`, {}, globalToken, true).then(recursive);
  }

  return apiCall('GET', `message/${channelId}?start=${start}`, {}, globalToken, true).then(recursive);
}


///////////////////////////////////////////////////////
// edit
//////////////////////////////////////////////////////

/**
 * get the current type (image/text) and content of the message which is going to be edited
 */
const messageLocalStorageUpdate = (channelId, messageId) => {
  const element = document.getElementById(`message-${channelId}-${messageId}`);
  const messageContent = element.querySelector('.message-content');
  const textElement = messageContent.querySelector('.message-text');
  const imageElement = messageContent.querySelector('.message-img');

  if (textElement.style.display === 'block') {
    localStorage.setItem('messageType', 'Text');
    localStorage.setItem('messageText', textElement.textContent);
    localStorage.setItem('messageImage', null);
  } else if (imageElement.style.display === 'block') {
    localStorage.setItem('messageType', 'Image');
    localStorage.setItem('messageText', null);
    localStorage.setItem('messageImage', imageElement.src);
  }
  localStorage.setItem('messageId', messageId);
}


/**
 * function for edited type selection in edit modal
 *  */ 
const messageTypeChange = () => {
  const editMessageSelect = document.getElementById('edit-message-select');
  const editMessageText = document.getElementById('edit-message-input');
  const editMessageImage = document.getElementById('edit-image-input');
  if (editMessageSelect.value === 'Text') {
    editMessageText.style.display = 'block';
    editMessageImage.style.display = 'none';
  } else {
    editMessageText.style.display = 'none';
    editMessageImage.style.display = 'block';
  }
}
document.getElementById('edit-message-select').addEventListener('change', messageTypeChange);


/**
 * edit the value of message element 
 */
const elementValueEdit = (elementIdName, message, messageType) => {
  const element = document.getElementById(elementIdName);
  if (element) {
    if (messageType === 'Text') {
      element.querySelector('.message-text').textContent = message.message;
      element.querySelector('.message-text').style.display = 'block';
      element.querySelector('.message-img').style.display = 'none';
    } else {
      element.querySelector('.message-img').src = message.image;
      element.querySelector('.message-text').style.display = 'none';
      element.querySelector('.message-img').style.display = 'block';
    }
    element.querySelector('.message-small-edit').style.display = 'inline';
    element.querySelector('.message-small-time').textContent = timeConvert(message.editedAt);
  }

}

/**
 * function for complete the update of message: both backend and frontend
 */
const elementEdit = (channelId, messageId, globalToken, messageType, messageContent) => {
  const requestBody = (messageType === 'Text') ? {message:  messageContent} : {image: messageContent};
  apiCall('PUT', `message/${channelId}/${messageId}`, requestBody, globalToken, true)
  .then(() => {
    fetchAllMessages(channelId)
    .then((allMessages) => {
      for (const message of allMessages) {
        if (message.id === parseInt(messageId)) {
          elementValueEdit(`message-${channelId}-${messageId}`, message, messageType);
          elementValueEdit(`pinned-${channelId}-${messageId}`, message, messageType);
          const form = document.getElementById('edit-message-body-form');
          form.reset();
          alert('Success!');
          break;
        }
      }
    })
  })
}


/**
 * add listener for edit submit
 */
document.getElementById('edit-message-submit').addEventListener('click', () => {
  const editMessageSelect = document.getElementById('edit-message-select');
  const oldMessageType = localStorage.getItem('messageType');
  const oldMessageText = localStorage.getItem('messageText');
  const oldMessageImage = localStorage.getItem('messageImage');
  const editMessageText = document.getElementById('edit-message-input');
  const editMessageImage = document.getElementById('edit-image-input');
  const channelId = localStorage.getItem('channelId');
  const messageId = localStorage.getItem('messageId');
  const globalToken = localStorage.getItem('token');
  // check edited message type

  console.log(channelId, messageId);
  console.log(editMessageSelect.value, oldMessageType);
  console.log(editMessageText, oldMessageText);
  // console.log(editMessageText, oldMessageText);

  if (editMessageSelect.value === 'Text') {
    if (editMessageText.value.trim() === '') {
      alert('Message can\'t be null');
    } else if (oldMessageType === 'Text' && editMessageText.value === oldMessageText) {
      alert('Message hasn\'t been edited');
    } else {
      elementEdit(channelId, messageId, globalToken, editMessageSelect.value, editMessageText.value);
    }
  } else {
    if (editMessageImage.files.length === 0) {
      alert('Message can\'t fetchAllMsgbe null');
    } else {
      const file = editMessageImage.files[0];
      fileToDataUrl(file)
      .then((data) => {
        if (data === oldMessageImage) {
          alert('Message hasn\'t been edited');
        } else {
          elementEdit(channelId, messageId, globalToken, editMessageSelect.value, data);
        }
      })
    }
  }
})



///////////////////////////////////////////////////////
// notification
//////////////////////////////////////////////////////

/**
 * get all messages from the joined channel
 * add 'joined flag' for joined channels
 */
const getAllMessages = () => {
  const globalToken = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  return apiCall('GET', 'channel', {}, globalToken, true)
  .then((channels) => {
    const channelList = channels.channels;
    const filteredChannelList = Array.from(channelList).filter(channel => {
      // update channel name
      const element = document.getElementById(`${channel.id}`);
      if (element) {
        element.querySelector('a').textContent = `# ${channel.name}`;
        return channel.members.includes(parseInt(userId));
      }
    });
    // get all the messages
    const fetchMessages = filteredChannelList.map((channel) => {
      return fetchAllMessages(channel.id);
    });
    return Promise.all(fetchMessages)
      .then((channelMessages) => {
        const integratedList = filteredChannelList.map((channel, index) => {
          return {
            channelid: filteredChannelList[index].id,
            channelname: filteredChannelList[index].name,
            channelprivate: filteredChannelList[index].private,
            channelmembers: filteredChannelList[index].members,
            messages: channelMessages[index].map(message => {
              return message.id
            }),
            senders: channelMessages[index].map(message => {
              return message.sender;
            })
          };
        });
        // add join flag for channels
        const channelLinks = document.querySelectorAll('.channel-style');
        channelLinks.forEach((link) => {
          const channelId = parseInt(link.getAttribute('id'));
          const checkIcon = link.querySelector('.bi-check-circle-fill');
          if (integratedList.some((item) => item.channelid === channelId)) {
            checkIcon.style.display = 'inline';
          } else {
            checkIcon.style.display = 'none';
          }
        })
        return integratedList;
      })
  })
}


const pollingInterval = 5000;
let preMessages; 
const toastContainer = document.getElementById('toast-container');

/**
 * main function for polling, divide into: new channels, new messages
 */
const checkForNewMessages = () => {
  let newMessages;
  getAllMessages()
    .then((messages) => {
      newMessages = messages;
      // find new channels or new messages
      const newChannels = findNewChannels(preMessages, newMessages);
      const newMessagesInChannels = findNewMessagesInChannels(preMessages, newMessages);

      // generate new toasts
      
      generateToastForNewChannels(newChannels);
      generateToastForNewMessages(newMessagesInChannels);
      const toasts = toastContainer.querySelectorAll('.toast');
      toasts.forEach((toast) => {
        const toastInstance = new bootstrap.Toast(toast);
        toastInstance.show();
      });
      // update preMessages
      preMessages = newMessages;

      // next polling
      setTimeout(() => {
        deleteAllChild('toast-container');
        checkForNewMessages();
      }, pollingInterval);
    });
};

getAllMessages()
.then((integratedList) => {
  preMessages = integratedList;
  console.log(preMessages);
  checkForNewMessages();
})

/**
 * find all the new channels the authorised user has joined
 */
const findNewChannels = (preMessages, newMessages) => {
  const newChannels = [];
  // check if new channels
  newMessages
  // .filter((newChannel) => newChannel.messages.length > 0) //(push notification only when the new channel has messages)
  .forEach((newChannel) => {
    if (!preMessages.find((preChannel) => preChannel.channelid === newChannel.channelid)) {
      newChannels.push({
        id: newChannel.channelid,
        name: newChannel.channelname,
        private: newChannel.channelprivate,
        members: newChannel.channelmembers,
      });
    }
  });
  return newChannels;
};

/**
 * find all the new messages from the channels the authorised user has joined
 */
const findNewMessagesInChannels = (preMessages, newMessages) => {
  const newMessagesInChannels = [];
  newMessages.forEach((newChannel) => {
    const preChannel = preMessages.find((channel) => channel.channelid === newChannel.channelid);
    // check if new messages in a joined channel (only care about the latest messages)
    if (preChannel && newChannel.messages.length > 0) {
      const firstMessageId = newChannel.messages[0];
      const firstMessageSender = newChannel.senders[0];
      const currentUser = parseInt(localStorage.getItem('userId'));
      if (!preChannel.messages.includes(firstMessageId) && firstMessageSender !== currentUser) {
        newMessagesInChannels.push(newChannel.channelname);
      }
    }
  });
  return newMessagesInChannels;
};

// generate toast
const generateToastForNewChannels = (newChannels) => {
  newChannels.forEach((channel) => {
    const toast = createToast(channel, 'newChannel');
    toastContainer.appendChild(toast);
  });
};

const generateToastForNewMessages = (newMessagesInChannels) => {
  newMessagesInChannels.forEach((channel) => {
    const toast = createToast(channel, 'newMessage');
    toastContainer.appendChild(toast);
  });
};

/**
 * create the notification with a toast
 * if a new channel isn't shown on the catalog (especially for private channels)
 * a new link will be added to the catalog, the user don't need to refresh the page
 */
const createToast = (channel, type) => {
  const toast = document.getElementById('toast-template').cloneNode(true);
  let newContent;
  if (type === 'newChannel') {
    newContent = `You have joined channel: ${channel.name}.`;
    let element = document.getElementById(`${channel.id}`);
    const currentUser = parseInt(localStorage.getItem('userId'));
    if (!element) {
      addChannelCatalog(channel, currentUser);
    } else {
    }
  } else {
    newContent = `New message in ${channel}`;
  }
  toast.querySelector('.toast-body').textContent = newContent;
  return toast;
};