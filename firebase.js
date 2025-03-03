// Import Firebase App (the core Firebase SDK) and Firebase Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, update, set, get, child, query, orderByChild, equalTo, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as stoRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtLQVjaoh3I9yfSl66DSQicRUtBGNoE78",
    authDomain: "park-online-633b5.firebaseapp.com",
    databaseURL: "https://park-online-633b5-default-rtdb.firebaseio.com",
    projectId: "park-online-633b5",
    storageBucket: "park-online-633b5.appspot.com",
    messagingSenderId: "25931336211",
    appId: "1:25931336211:web:7951be1c279643bdbf0de6",
    measurementId: "G-V35LW4SF62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const storage = getStorage(app);
const database = getDatabase(app);

// Function to generate a unique account number
function generateAccountNumber() {
    return Math.floor(Math.random() * 1000000000); // Generates a random 9-digit number prefixed with 'ACC'
}

async function sendRegistrationEmail(name, email, accountNumber) {
    const data = {
        service_id: 'service_5oktdi2', // Your EmailJS service ID
        template_id: 'template_6ehapif', // Your EmailJS template ID, Create a new template ID
        user_id: '4LogJ6QMAPJI99HFE', // Your EmailJS user ID
        template_params: {
            to_name: name,
            to_email: email,
            from_name: 'NexcresT Bank',
            from_email: 'support@nexcress.com',
            account_number: accountNumber,
            instructions: 'Your registration was successful. Please use the following account number to log in: ' + accountNumber
        },
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    try {
        const req = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!req.ok) {
            throw new Error(`HTTP error! Status: ${req.status}`);
        }

        const contentType = req.headers.get('content-type');

        let res;
        if (contentType && contentType.includes('application/json')) {
            res = await req.json();
        } else {
            res = await req.text();
        }

        console.log('Email response:', res);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function send2FACodeEmail(name, email, code) {
    const data = {
        service_id: 'service_u4bxj8p', // Your EmailJS service ID
        template_id: 'template_z3c8l8d', // Your EmailJS template ID
        user_id: 'wFjLvmBKtil7JR8Bd', // Your EmailJS user ID
        template_params: {
            to_name: name,
            to_email: email,
            from_name: 'ApexTFB.com', // Your sender name
            from_email: 'support@apextfb.com', // Your sender email
            code: code // The 2FA code to be sent
        },
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    try {
        const req = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!req.ok) {
            throw new Error(`HTTP error! Status: ${req.status}`);
        }

        const contentType = req.headers.get('content-type');

        let res;
        if (contentType && contentType.includes('application/json')) {
            res = await req.json();
        } else {
            res = await req.text();
        }

        console.log('Response:', res);
    } catch (error) {
        console.error('Error:', error);
    }
}

function generate2FACode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate a token (JWT-like token)
function generateToken(accountNumber) {
    const payload = {
        accountNumber: accountNumber,
        exp: Date.now() + (60 * 60 * 1000) // Token expires in 1 hour
    };
    return btoa(JSON.stringify(payload)); // Base64 encode the payload
}

// Function to decode a token and get account number
function decodeToken(token) {
    const decodedString = atob(token);
    const payload = JSON.parse(decodedString);
    return payload;
}


// Function to handle form submission
async function register() {
    console.log('First top code working...')
    // Get form values
    // const title = document.getElementById('title').value;
    console.log('Breaking...');
    const fname = document.getElementById('fname').value;
    const oname = document.getElementById('oname').value;
    // const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const country = document.getElementById('country').value;
    // const nokName = document.getElementById('nok_name').value;
    // const nokPhone = document.getElementById('nok_phone').value;
    // const nokEmail = document.getElementById('nok_email').value;
    // const nokAddress = document.getElementById('nok_address').value;
    const password = document.getElementById('password').value;

    if (password === '') {
        return alert('Password is required');
    };

    if (email === '') {
        return alert('Email is required');
    };

    if (fname === '') {
        return alert('First name is required');
    };

    try {
        // Reference to the root of the users in Firebase
        const usersRef = ref(database, 'users');
        const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
        
        const snapshot = await get(emailQuery);

        if (snapshot.exists()) {
            // Email already exists
            alert('This email is already registered.');
            return; // Stop the registration process
        }

        // Generate a unique account number
        const accountNumber = generateAccountNumber();

        // Create an object with form data
        const formData = {
            accountNumber,
            // title,
            firstName: fname,
            otherNames: oname,
            // gender,
            dateOfBirth: dob,
            email,
            phone,
            country,
            // nextOfKin: {
            //     name: nokName,
            //     phone: nokPhone,
            //     email: nokEmail,
            //     address: nokAddress
            // },
            password // Add password to form data
        };

        // Save form data to Firebase
        const userRef = ref(database, 'users/' + accountNumber);
        await set(userRef, formData);

        // Send registration email
        await sendRegistrationEmail(fname, email, accountNumber);

        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
    }
}


// Function to handle login
// Function to handle login
async function login() {
    // Prevent default form submission

    // Get login form values
    const accountNumber = document.getElementById('accountNumber').value;
    const password = document.getElementById('password').value;

    // Reference to the user's data in the database
    const dbRef = ref(getDatabase());
    console.log(dbRef);

    console.log(accountNumber);

    const snapshot = await get(child(dbRef, `users/${accountNumber}`));
        console.log(snapshot);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log(userData);
            if (userData.password === password) {
                // console.log('Generating 2FA Code');
                // Generate 2FA code
                // const twoFACode = generate2FACode();

                // Send 2FA code to user's email
                // await send2FACodeEmail(userData.firstName, userData.email, twoFACode);

                // Store 2FA code in sessionStorage
                // sessionStorage.setItem('2faCode', twoFACode);
                // sessionStorage.setItem('accountNumber', userData.accountNumber);

                const token = generateToken(accountNumber);
                sessionStorage.setItem('token', token);

                // Redirect to 2FA verification page
                window.location.href = 'dash.html';
            } else {
                alert('Invalid password.');
            }
        } else {
            alert('Account number not found.');
        }
}

// Function to verify 2FA code
function verify2FACode() {
    // Prevent default form submission
    // event.preventDefault();

    // Get entered 2FA code
    const enteredCode = document.getElementById('2faCode').value;

    // Retrieve stored 2FA code from sessionStorage
    const storedCode = sessionStorage.getItem('2faCode');
    const accountNumber = sessionStorage.getItem('accountNumber');

    let url = sessionStorage.getItem('url');

    if (url === null) {
        url = 'dash.html';
    }

    if (enteredCode === storedCode) {
        // Clear sessionStorage
        const token = generateToken(accountNumber);
        sessionStorage.setItem('token', token);
        sessionStorage.removeItem('2faCode');
        sessionStorage.removeItem('accountNumber');

        alert('2FA code verified successfully!');
        // Proceed to the user's dashboard or home page
        window.location.href = url;
    } else {
        alert('Invalid 2FA code.');
    }
}

// Function to get user details from Firebase using the decoded token
async function getUserDetails() {
    sessionStorage.removeItem('url');
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        const url = window.location.href;
        sessionStorage.setItem('url', url)
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        const url = window.location.href;
        sessionStorage.setItem('url', url)
        window.location.href = 'login.html';
        return;
    }

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Retrieve user data from Firebase
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User Details:', userData);
            // Process or display user details
            // Find the element with the class 'user-name'
            const userNameElement = document.querySelector('.username');
            const justName = document.querySelector('.jname');
            const inputValue = document.querySelector('input[name="op"]');
            const phoneValue = document.querySelector('input[name="fgf"]');
            const nokName = document.querySelector('input[name="name"]');
            const nokEmail = document.querySelector('input[name="email"]');
            const nokPhone = document.querySelector('input[name="phone"]');
            const nokAddress = document.querySelector('input[name="address"]');
            const profileImages = document.querySelectorAll('.user-image');

            const fullName = document.getElementById('fullname');

            // Update the src attribute for each image
            profileImages.forEach(img => {
                img.src = userData.profileImage;
            });

            if (fullName) {
                fullName.textContent = `${userData.firstName} ${userData.otherNames}`
            }


            // Check if the element exists
            if (userNameElement) {
                // Display the user's first name
                userNameElement.textContent = `Welcome, ${userData.firstName}!`;
            }

            if (justName) {
                // Display the user's first name
                justName.textContent = userData.firstName;
            }

            if (inputValue) {
                // Display the user's first name
                inputValue.value = userData.email;
            }

            if (phoneValue) {
                // Display the user's first name
                phoneValue.value = userData.phone;
            }

            if (nokName) {
                // Display the user's first name
                nokName.value = userData.nextOfKin.name;
            }

            if (nokEmail) {
                // Display the user's first name
                nokEmail.value = userData.nextOfKin.email;
            }

            if (nokPhone) {
                // Display the user's first name
                nokPhone.value = userData.nextOfKin.phone;
            }

            if (nokAddress) {
                // Display the user's first name
                nokAddress.value = userData.nextOfKin.address;
            }

            let balance = userData.balance;

            if (balance === undefined) {
                balance = 0;
            } else {
                balance = balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            };

             // Mapping user data to HTML elements
             const userMapping = {
                '.user-title': userData.title,
                '.jname': userData.firstName,
                '.user-other-names': userData.otherNames,
                '.user-gender': userData.gender,
                '.user-dob': userData.dateOfBirth,
                '.user-email': userData.email,
                '.user-phone': userData.phone,
                '.user-country': userData.country,
                '.useraccount': userData.accountNumber,
                // '.nok-name': userData.nextOfKin.name,
                // '.nok-phone': userData.nextOfKin.phone,
                // '.nok-email': userData.nextOfKin.email,
                // '.nok-address': userData.nextOfKin.address,
                '.drop-name': userData.firstName,
                '.userbalance': balance,
            };

            // Update the HTML with user data
            for (const [selector, value] of Object.entries(userMapping)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = value;
                }
            }

            console.log('Done');

            return userData;
        } else {
            // Account number not found
            alert('User not found.');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        const url = window.location.href;
        sessionStorage.setItem('url', url)
        console.log(error);
        // Token verification failed
        alert('Error retrieving user details.');
        // window.location.href = 'login.html';
    }
}

async function updateEmailAndPassword() {
    try {
        // Get the new email and password from input fields
        const newEmail = document.getElementById('newEmailInput');
        // console.log(newEmail);
        const newPassword = document.getElementById('newPasswordInput');

        // console.log(newEmail);

        // Get the token from sessionStorage
        const token = sessionStorage.getItem('token');
        if (!token) {
            // Token is not present, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Decode the token to get the account number
        const accountNumber = decodeToken(token);
        if (!accountNumber) {
            // Token is invalid, redirect to login
            window.location.href = 'login.html';
            return;
        }

        console.log(accountNumber);

        // Reference to the user's data in Firebase
        const userRef = ref(database, 'users/' + accountNumber.accountNumber);
        let isEmail;
        
        // Get the current user data
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const updates = {};

            // Check if the email is not empty, then add it to the updates object
            if (newEmail !== '' && newEmail !== null) {
                updates.email = newEmail.value;
                isEmail = true;
            }

            // Check if the password is not empty, then add it to the updates object
            if (newPassword !== '' && newPassword !== null) {
                updates.password = newPassword.value;
                isEmail = false
            }

            // If there are any updates to be made, proceed to update the user's data
            if (Object.keys(updates).length > 0) {
                await update(userRef, updates);
                if (isEmail) {
                    alert('Email Successfully updated!');
                } else {
                    alert('Password Successfully updated!');
                }
                // console.log('User email and/or password updated successfully.');
            } else {
                console.log('No updates to be made.');
            }
        } else {
            console.error('User not found.');
        }
    } catch (error) {
        console.error('Error updating email and password:', error);
    }
}

// Validate PIN function
async function validatePin() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Reference to the PIN in Firebase
    const pinRef = ref(database, 'pins/' + accountNumber.accountNumber);

    try {
        // Retrieve PIN from Firebase
        const snapshot = await get(pinRef);
        if (snapshot.exists()) {
            const storedPin = snapshot.val();
            const enteredPin = document.querySelector('input[name="pin"]').value; // User-entered PIN
            
            // Decode the stored PIN
            // const storedPin = await decodeToken(storedEncodedPin);
            
            // Validate the PIN
            if (storedPin === enteredPin) {
                // Logic to process payment
                // alert('Your Payment is being processing');
                return true;
                // Additional actions on successful validation
            } else {
                alert('Invalid PIN. Please try again.');
                // Clear the PIN input field
                document.querySelector('input[name="pin"]').value = '';
                return false;
            }
        } else {
            // PIN not found in database
            alert('PIN not found. Please set your PIN.');
            window.location.href = 'change-pin.html'; // Redirect to set PIN page
            return false;
        }
    } catch (error) {
        console.error('Error during PIN validation:', error);
        alert('Error retrieving PIN details.');
        // window.location.href = 'login.html';
    }
}

// Save or update the PIN function
async function saveOrUpdatePin() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the PIN entered by the user
    const pinInput = document.querySelector('input[name="np"]');
    const pin = pinInput.value;

    if (!pin) {
        alert('Please enter a PIN.');
        return;
    }

    if (pin.length !== 4) {
        alert('PIN Must be 4 digit');
        return;
    };

    // Reference to the PIN in Firebase
    const pinRef = ref(database, 'pins/' + accountNumber.accountNumber);

    try {
        // Save or update the PIN in Firebase
        await set(pinRef, pin);
        alert('PIN saved/updated successfully!');
        // Optionally clear the PIN input field
        pinInput.value = '';
    } catch (error) {
        console.error('Error saving/updating PIN:', error);
        alert('Error saving/updating PIN.');
    }
}

async function updateUserName() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the new name entered by the user
    const nameInput = document.querySelector('input[name="newName"]');
    const newName = nameInput.value.trim();

    if (!newName) {
        alert('Please enter a new name.');
        return;
    }

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Update the user's name in Firebase
        await update(userRef, {
            firstName: newName
        });
        alert('Name updated successfully!');
        // Optionally clear the name input field
        nameInput.value = '';
    } catch (error) {
        console.error('Error updating name:', error);
        alert('Error updating name.');
    }
}

async function saveImage() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the file input element
    const fileInput = document.querySelector('input[name="image-upload"]');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image to upload.');
        return;
    }

    // Create a storage reference
    const storageRef = stoRef(storage, 'user-images/' + accountNumber.accountNumber + '/' + file.name);

    try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Save the image URL to Firebase Realtime Database
        const userRef = ref(database, 'users/' + accountNumber.accountNumber);
        await update(userRef, {
            profileImage: downloadURL
        });

        alert('Image uploaded and URL saved successfully!');
        // Optionally clear the file input field
        fileInput.value = '';
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image.');
    }
}


async function updateOrAddAddress() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the new address entered by the user
    const addressInput = document.querySelector('input[name="newAddress"]');
    const newAddress = addressInput.value.trim();

    if (!newAddress) {
        alert('Please enter a new address.');
        return;
    }

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Fetch the current user's data
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        // Update or add the address
        await update(userRef, {
            address: newAddress
        });

        alert('Address updated successfully!');
        // Optionally clear the address input field
        addressInput.value = '';
    } catch (error) {
        console.error('Error updating address:', error);
        alert('Error updating address.');
    }
}


async function updateOrAddDOB() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the new date of birth entered by the user
    const dobInput = document.querySelector('input[name="newDOB"]');
    const newDOB = dobInput.value.trim();

    if (!newDOB) {
        alert('Please enter your date of birth.');
        return;
    }

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Fetch the current user's data
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        // Update or add the DOB
        await update(userRef, {
            dateOfBirth: newDOB
        });

        alert('Date of Birth updated successfully!');
        // Optionally clear the DOB input field
        dobInput.value = '';
    } catch (error) {
        console.error('Error updating Date of Birth:', error);
        alert('Error updating Date of Birth.');
    }
}

async function saveTransaction() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get transaction details entered by the user
    const transactionDescriptionInput = document.querySelector('input[name="description"]');
    const transactionDescription = transactionDescriptionInput.value;

    const transactionAmountInput = document.querySelector('input[name="amountTrans"]');
    const transactionAmount = parseFloat(transactionAmountInput.value);

    const isCreditInput = document.querySelector('input[name="isCredit"]');
    const isCredit = isCreditInput.checked; // Boolean: true if credit, false if debit

    const dateInput = document.querySelector('input[name="dateTrans"]');
    const date = dateInput.value;

    // Validate inputs
    if (!transactionDescription || isNaN(transactionAmount)) {
        alert('Please enter a valid description and amount.');
        return;
    }

    if (!date) {
        alert('Please enter a valid date.');
        return;
    }

    // Reference to the transactions in Firebase
    const transactionRef = ref(database, 'transactions/' + accountNumber.accountNumber);

    // Create transaction object
    const transactionData = {
        date: date,
        description: transactionDescription,
        amount: transactionAmount,
        isCredit: isCredit
    };

    try {
        const newTransactionRef = push(transactionRef);
        await set(newTransactionRef, transactionData);
        alert('Transaction saved successfully!');
        // Optionally clear the input fields
        transactionDescriptionInput.value = '';
        transactionAmountInput.value = '';
        isCreditInput.checked = false;
        dateInput.value = '';
    } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Error saving transaction.');
    }
}


async function fetchTransactions() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Reference to the transactions in Firebase
    const transactionRef = ref(database, 'transactions/' + accountNumber.accountNumber);

    try {
        // Fetch the transactions from Firebase
        const snapshot = await get(transactionRef);

        if (snapshot.exists()) {
            const transactions = snapshot.val();
            console.log(transactions);
            displayTransactions(transactions); // Function to display the transactions
        } else {
            console.log('No transactions found.');
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        console.log('Error fetching transactions.');
    }
}


// Function to display transactions in the UI
function displayTransactions(transactions) {
    console.log(transactions);
    const transactionsBody = document.getElementById('transactionsBody');
    transactionsBody.innerHTML = ''; // Clear any existing rows

    for (const key in transactions) {
        if (transactions.hasOwnProperty(key)) {
            const transaction = transactions[key];
            const row = document.createElement('tr');

            // Create and append cells to the row

            // Action Cell (Print or View link)
            const actionCell = document.createElement('td');
            actionCell.innerHTML = `<a href="transactviewcredit.php?id_amt=${transaction.amount}&id_acc=${transaction.accountNumber}"><i class="fa fa-print" aria-hidden="true" style="color:#006699"></i></a>`;
            row.appendChild(actionCell);

            // Date Cell
            const dateCell = document.createElement('td');
            dateCell.textContent = transaction.date; // Format date if necessary
            row.appendChild(dateCell);

            // Description Cell
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = transaction.description;
            row.appendChild(descriptionCell);

            // Debit Cell
            const debitCell = document.createElement('td');
            debitCell.textContent = transaction.isCredit ? '' : `$${transaction.amount}`; // Show amount only if it's not a credit
            row.appendChild(debitCell);

            // Credit Cell
            const creditCell = document.createElement('td');
            creditCell.textContent = transaction.isCredit ? `$${transaction.amount}` : ''; // Show amount only if it's a credit
            row.appendChild(creditCell);

            // Status Cell (Example placeholder, adjust if you have a status)
            const statusCell = document.createElement('td');
            statusCell.innerHTML = `<span class="label label-success"><a style="color: white;" title="Completed!">success</a></span>`;
            row.appendChild(statusCell);

            // Optional: Any other cells if needed
            const emptyCell = document.createElement('td');
            row.appendChild(emptyCell);

            // Append the row to the table body
            transactionsBody.appendChild(row);
        }
    }
}



async function updateNextOfKin() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the new Next of Kin information entered by the user
    const nokNameInput = document.querySelector('input[name="nokName"]');
    const nokPhoneInput = document.querySelector('input[name="nokPhone"]');
    const nokEmailInput = document.querySelector('input[name="nokEmail"]');
    const nokAddressInput = document.querySelector('input[name="nokAddress"]');

    const newNokName = nokNameInput.value.trim();
    const newNokPhone = nokPhoneInput.value.trim();
    const newNokEmail = nokEmailInput.value.trim();
    const newNokAddress = nokAddressInput.value.trim();

    // Check if all required fields are filled
    if (!newNokName || !newNokPhone || !newNokEmail || !newNokAddress) {
        alert('Please fill out all Next of Kin fields.');
        return;
    }

    // Reference to the user's Next of Kin data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Update the user's Next of Kin information in Firebase
        await update(userRef, {
            'nextOfKin': {
                name: newNokName,
                phone: newNokPhone,
                email: newNokEmail,
                address: newNokAddress
            }
        });
        alert('Next of Kin information updated successfully!');
        // Optionally clear the Next of Kin input fields
        nokNameInput.value = '';
        nokPhoneInput.value = '';
        nokEmailInput.value = '';
        nokAddressInput.value = '';
    } catch (error) {
        console.error('Error updating Next of Kin information:', error);
        alert('Error updating Next of Kin information.');
    }
}

async function updateUserBalance() {
    // Get the account number and new balance from the form inputs
    const accountNumber = document.getElementById('accountNumber').value;
    const newBalance = document.getElementById('newBalance').value;

    // Validate inputs
    if (!accountNumber || !newBalance) {
        alert('Both Account Number and Balance are required.');
        return;
    }

    // Reference to the specific user's account in Firebase
    const userRef = ref(database, `users/${accountNumber}`);

    try {
        // Check if the account number exists
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            // Account exists, proceed to update the balance
            const userBalanceRef = ref(database, `users/${accountNumber}/balance`);
            await set(userBalanceRef, Number(newBalance));
            alert(`Balance updated successfully! New balance is ${newBalance}.`);
        } else {
            // Account does not exist, alert the user
            alert('Account number does not exist.');
        }
    } catch (error) {
        console.error('Error updating balance:', error);
        alert('Error updating balance.');
    }
}

async function processWithdrawal() {
    sessionStorage.removeItem('url');
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        const url = window.location.href;
        sessionStorage.setItem('url', url);
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        const url = window.location.href;
        sessionStorage.setItem('url', url);
        window.location.href = 'login.html';
        return;
    }

    // Get the withdrawal amount from the form input
    const withdrawalAmount = parseFloat(document.getElementById('withdrawalAmount').value);

    // Validate the withdrawal amount
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        alert('Please enter a valid withdrawal amount.');
        return;
    }

    // Reference to the user's main data in Firebase
    const userRef = ref(database, `users/${accountNumber.accountNumber}`);

    try {
        // Retrieve user data, including balance, from Firebase
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            let currentBalance = userData.balance || 0;

            // Check if there are sufficient funds for the withdrawal
            if (currentBalance < withdrawalAmount) {
                alert('Insufficient balance for this withdrawal.');
                return;
            }

            // Deduct the withdrawal amount and update the balance in Firebase
            const newBalance = currentBalance - withdrawalAmount;
            await update(userRef, { balance: newBalance });

            alert(`Withdrawal of ${withdrawalAmount} successful. New balance is ${newBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`);
        } else {
            alert('User data not found.');
        }
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        alert('Error processing withdrawal.');
    }
}










// Expose the login function to the global scope
window.login = login;

// Expose the verify2FACode function to the global scope
window.verify2FACode = verify2FACode;

// Expose the register function to the global scope
window.register = register;

window.getUserDetails = getUserDetails;

window.updateEmailAndPassword = updateEmailAndPassword;

window.validatePin = validatePin;

window.saveOrUpdatePin = saveOrUpdatePin;

window.updateUserName = updateUserName;

window.saveImage = saveImage;

window.updateOrAddAddress = updateOrAddAddress;

window.updateOrAddDOB = updateOrAddDOB;

window.saveTransaction = saveTransaction;

window.updateNextOfKin = updateNextOfKin;

window.updateUserBalance = updateUserBalance;

window.processWithdrawal = processWithdrawal;

// window.fetchTransactions = fetchTransactions;

// Call the fetchTransactions function on page load
// if (document.location.pathname !== '/login.html' && document.location.pathname !== '/verification.html') {
//     console.log(document.location.pathname);
//     // Get the token from sessionStorage
//     const token = sessionStorage.getItem('token');
//     if (!token) {
//         // Token is not present, redirect to login
//         window.location.href = 'login.html';
//         // return;
//     }

//     // Decode the token to get the account number
//     const accountNumber = decodeToken(token); // Assuming decodeToken function is available
//     if (!accountNumber) {
//         // Token is invalid, redirect to login
//         window.location.href = 'login.html';
//         // return;
//     }
//     document.addEventListener('DOMContentLoaded', fetchTransactions);
// };

// console.log('Closing the cookie');
