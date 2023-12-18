import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCall, deleteAllChild} from './helpers.js';
import {chooseChannelPage, showChannelPage} from './main.js';
import {loadMoreMessages, showProfile} from './message.js'


// add listener for different URL
window.addEventListener('hashchange', handleHashChange);

// load different page for different URL
function handleHashChange() {
  const hash = window.location.hash;
  const globalToken = localStorage.getItem('token');
  let userId;
  let channelName;
  if (hash.startsWith('#channel=')) {
    const channelId = hash.substring(9);
    apiCall('GET', 'channel', {}, globalToken, true)
    .then((channelList) => {
      for (const channel of channelList.channels) {
        if (parseInt(channelId) === channel.id) {
            channelName = channel.name;
            break;
        }
      }
      localStorage.setItem('channelId', channelId);
      showChannelPage(channelId, channelName);
    });
  } else if (hash === '#profile') {
    userId = localStorage.getItem('userId');
    showProfile(userId);
  } else if (hash.startsWith('#profile=')) {
    console.log(userId);
    userId = hash.substring(9);
    showProfile(userId);
  }
}

handleHashChange();