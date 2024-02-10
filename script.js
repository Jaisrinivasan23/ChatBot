const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');

let userPhoneNumber = '';
let isPhoneNumberVerified = false;
let isFullNameProvided = false;
let isEmailProvided = false;
let selectedPlace = '';
let selectedPlan = '';
let placeOptions = ['Wayanad', 'Thekkady', 'Vagamon', 'Ramakkal', 'Kolukkumalai', 'Munnar', 'Mankulam', 'Neyyar', 'Gavi', 'Moroe Island'];

// Generate a list of 50 random 4-digit numbers
const otpList = Array.from({ length: 50 }, () => Math.floor(1000 + Math.random() * 9000));

function addUserMessage(message) {
  const userMessage = document.createElement('div');
  userMessage.classList.add('message', 'user');
  userMessage.textContent = message;
  messagesContainer.appendChild(userMessage);
  // Auto-scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addChatbotMessage(message, options = []) {
  const chatbotMessage = document.createElement('div');
  chatbotMessage.classList.add('message', 'parker');
  chatbotMessage.innerHTML = message;
  messagesContainer.appendChild(chatbotMessage);
  // Auto-scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // If options are provided, create buttons
  if (options.length > 0) {
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options-container');

    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.textContent = option;
      button.addEventListener('click', () => handleOptionClick(option, index));
      optionsContainer.appendChild(button);
    });

    messagesContainer.appendChild(optionsContainer);
    // Auto-scroll to the bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

function handleOptionClick(option, index) {
  if (!selectedPlace) {
    selectedPlace = option;
    addChatbotMessage(`Great choice! You selected ${selectedPlace}.`, ['2 Days| 1 Night', '3 Days| 2 Night', 'Customize']);
  } else if (!selectedPlan) {
    selectedPlan = option;
    const bookingLink = generateBookingLink(selectedPlace, selectedPlan);
    addChatbotMessage(`Awesome! You selected ${selectedPlan} plan for ${selectedPlace}.`, [bookingLink]);
  }
  userInput.value = '';
}

function generateBookingLink(place, plan) {
  // Replace with your actual booking link generation logic
  // This is just a placeholder
  return `Booking link for ${place} - ${plan} will be generated here.`;
}

function sendOTP(phoneNumber) {
  const accountSid = 'AC47cec984684f6fcabb523a844b06dee6';
  const authToken = '318396ffd957323ba58e31dfa9328ac3';
  const twilioPhoneNumber = '+16149454183';
  const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const randomIndex = Math.floor(Math.random() * otpList.length);
  const otp = otpList[randomIndex];

  $.ajax({
    url: apiUrl,
    type: 'POST',
    data: {
      To: phoneNumber,
      From: twilioPhoneNumber,
      Body: `Your OTP for verification is: ${otp}`,
    },
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(accountSid + ':' + authToken));
    },
    success: function (data) {
      addChatbotMessage('SMS sent. Can you provide the OTP verification code');
    },
    error: function (error) {
      addChatbotMessage('Error sending OTP. Please try again later.');
    }
  });

  return otp;
}

// Function to ask for email after full name
function askForEmail() {
  addChatbotMessage('Please provide your email address:');
}

// Function to initiate the chat when the page loads
window.onload = function() {
  addChatbotMessage('Hello! Welcome to our travel agency.');
  setTimeout(() => {
    addChatbotMessage('May I have your phone number for better assistance?');
  }, 500);
}

function handleUserInput(event) {
  // Check if the Enter key (key code 13) is pressed
  if (event.keyCode === 13 || event.which === 13) {
    const userMessage = userInput.value.trim();
    if (userMessage !== '') {
      addUserMessage(userMessage);
      if (!userPhoneNumber) {
        if (/^\d{10}$/.test(userMessage)) {
          userPhoneNumber = '+91' + userMessage;
          const sentOTP = sendOTP(userPhoneNumber);
          // Store the OTP to verify later
          userOTP = sentOTP;
        } else {
          addChatbotMessage('I apologize, but I need a valid 10-digit phone number. Could you please provide it?');
        }
      } else if (!isPhoneNumberVerified) {
        const enteredOTP = userMessage;
        if (otpList.includes(parseInt(enteredOTP))) {
          isPhoneNumberVerified = true;
          addChatbotMessage('OTP verification successful!');
          setTimeout(() => {
            addChatbotMessage('Please provide your full name:');
          }, 500);
        } else {
          addChatbotMessage('Incorrect OTP. Please try again.');
        }
      } else if (!isFullNameProvided) {
        const fullName = userMessage;
        isFullNameProvided = true;
        addChatbotMessage(`Thank you, ${fullName}!`);
        setTimeout(() => {
          askForEmail(); // Ask for email after asking for full name
        }, 500);
      } else if (!isEmailProvided) {
        const email = userMessage;
        isEmailProvided = true;
        setTimeout(() => {
          addChatbotMessage(`Please select a place you want to explore.`, placeOptions);
        }, 500);
      } else if (!selectedPlan) {
          selectedPlan = userMessage;
          const bookingLink = generateBookingLink(selectedPlace, selectedPlan);
          addChatbotMessage(`Awesome! You selected ${selectedPlan} plan for ${selectedPlace}.`, [bookingLink]);
        }
      }
      // Clear the input field after processing user input
      userInput.value = '';
    }
  }


// Add an event listener for the Enter key press event
userInput.addEventListener('keypress', handleUserInput);
