const apiCall = async (method, path, requestBody = null, token = null, authed = false) => {
  const config = {
    method,
    headers: {
      'Content-type': 'application/json',
      Authorization: authed ? `Bearer ${token}` : undefined,
    }
  }
  if (method === 'GET' || method === 'DELETE') {
    config.body = undefined;
  } else {
    config.body = JSON.stringify(requestBody);
  }

  const response = await fetch(`http://localhost:5005/${path}`, config);
  const data = await response.json();
  return data;
}

const fileToDataUrl = async (file) => {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  const dataUrlPromise = await new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  return dataUrlPromise;
}

// get booking list
const getBooking = async (id) => {
  const token = localStorage.getItem('token');
  const result = await apiCall('GET', 'bookings', {}, token, true);
  const filterBookings = result.bookings
    .filter((item) => item.listingId === id)
    .map((booking) => ({
      ...booking,
      dateRange: {
        from: new Date(booking.dateRange.from).toLocaleString().split(' ')[0],
        to: new Date(booking.dateRange.to).toLocaleString().split(' ')[0],
      },
    }))
    .sort((a, b) => {
      const dateA = new Date(a.dateRange.from);
      const dateB = new Date(b.dateRange.from);

      if (dateA < dateB) {
        return -1;
      }
      if (dateA > dateB) {
        return 1;
      }

      // if from are same, then sort to
      const toA = new Date(a.dateRange.to);
      const toB = new Date(b.dateRange.to);

      if (toA < toB) {
        return -1;
      }
      if (toA > toB) {
        return 1;
      }

      return 0;
    });
  return [...filterBookings];
}

export default apiCall;
export { apiCall, fileToDataUrl, getBooking };
