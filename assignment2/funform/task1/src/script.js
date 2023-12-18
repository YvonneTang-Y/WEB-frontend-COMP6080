console.log('Hello world - view me in the Console of developer tools');
const street = document.getElementById('street-name');
const suburb = document.getElementById('suburb');
const postcode = document.getElementById('postcode');
const dob = document.getElementById('dob');
const build = document.getElementById('building-type');
const features = document.getElementsByName('features');
const selectAll = document.getElementById('select-all-btn');
const reset = document.getElementById('reset-form');

const output = document.getElementById('form-result');
let featuresList = [];

/*
define all checked function
*/
const allChecked = () => {
  return Array.from(features).every(checkbox => checkbox.checked);
}

/*
define the output function
*/ 
const updateOutput = () =>{
  const streetInput = street.value;
  const suburbInput = suburb.value;
  const postcodeInput = postcode.value;
  const dobInput = dob.value;
  const buildingSelect = build.value.slice(0, 1).toUpperCase() + build.value.slice(1);
  
  const isStreetValid = streetInput.length >= 3 && streetInput.length <= 50;
  const isSuburbValid = suburbInput.length >= 3 && suburbInput.length <= 50;
  const isPostcodeValid = /^\d{4}$/.test(postcodeInput);
  const isDobValid = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/.test(dobInput);
  const parts = dobInput.split('/');
  // checkbox
  featuresList = [];
  features.forEach(checkbox => {
    if (checkbox.checked) {
      featuresList.push(checkbox.value);
    }
  });

  if (allChecked()){
    selectAll.value = 'Deselect All';
  } else {
    selectAll.value = 'Select All';
  }

  if (!isStreetValid) {
    output.value = 'Please input a valid street name';
  } else if (!isSuburbValid) {
    output.value = 'Please input a valid suburb';
  } else if (!isPostcodeValid){
    output.value = 'Please input a valid postcode';
  } else if (!isDobValid || !isDateValid(parts)) {
    output.value = 'Please enter a valid date of birth';
  } else {
    // caculate age
    let age = caculateAge(parts);
    output.value = `You are ${age} years old, and your address is ${streetInput} St, ${suburbInput}, ${postcodeInput}, Australia. Your building is`;
    // building type
    if (buildingSelect === 'Apartment'){
      output.value += ` an ${buildingSelect}`;
    } else {
      output.value += ` a ${buildingSelect}`;
    }

    // features
    if (featuresList.length === 0) {
      output.value += ', and it has no features';
    } else if (featuresList.length === 1){
      output.value += `, and it has ${featuresList[0]}`;
    } else if (featuresList.length === 2) {
      output.value += `, and it has ${featuresList[0]}, and ${featuresList[1]}`;
    } else {
      output.value += `, and it has ${featuresList.slice(0, -2).join(', ')}, ${featuresList.slice(-2).join(', and ')}`
    }
  }
}

/*
define the vaild date check function
*/ 
const isDateValid = (parts) => {
  if (parts.length !== 3) {
    return false;
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return(date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day);
}

/*
define age caculation function
*/ 
const caculateAge = (parts) => {
  const current = new Date();
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const currentYear = current.getUTCFullYear();
  const currentMonth = current.getUTCMonth() + 1;
  const currentDay = current.getUTCDate();

  console.log(currentYear, currentMonth, currentDay);

  let age = currentYear - year;
  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    age -= 1;
  }
  return age;
}

/* 
define all the addEventListeners
*/
const elementList = [street, suburb, postcode, dob];
elementList.forEach(element => {
  element.addEventListener('blur', updateOutput);
});
build.addEventListener('change', updateOutput);
features.forEach(checkbox => {
  checkbox.addEventListener('change', updateOutput);
});

// "select all" button
selectAll.addEventListener('click', () => {
  // all 4 features are selected, the text now should be 'Deselect all', after clicked, the following actions will be taken...
  if (allChecked()){
    features.forEach(checkbox => {
      checkbox.checked = false;
    });
    selectAll.value = 'Select All';
  } else{ 
    // less than 4 features are selected, the text now should be 'Select all', after clicked, the following actions will be taken...
    features.forEach(checkbox => {
      checkbox.checked = true;
    });
    selectAll.value = 'Deselect All';
  }
  updateOutput();
});

// "reset" button
reset.addEventListener('click', () => {
  // text
  const texts = document.querySelectorAll('input[type="text"]');
  texts.forEach(input => {
    input.value = '';
  });
  // dropdown
  build.selectedIndex = 0;
  // checkbox
  features.forEach(checkbox => {
    checkbox.checked = false;
  });
  // select all button
  selectAll.value = 'Select All';
  // textarea
  output.value = '';
});