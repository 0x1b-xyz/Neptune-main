<template>
  <div>
    <!-- Wrap the form fields in a form element -->
    <form @submit.prevent="register" @keyup.enter="submitForm">
      <div class="header">
        <h4 style="color: white; font-size: 32px; font-weight: bold; font-family: 'Verdana', sans-serif;">Neptune</h4>
      </div>
      <label>Email:</label>
      <!-- Updated label to specify Email -->
      <input type="email" v-model="email" required> <!-- Use type="email" for email validation -->

      <label>Password:</label>
      <div class="password-field">
        <input :type="passwordVisibility ? 'text' : 'password'" v-model="password" required>
      </div>

      <label>Confirm Password:</label>
      <div class="password-field">
        <input :type="passwordVisibility ? 'text' : 'password'" v-model="confirmPassword" required>
      </div>

      <div v-if="loading" class="loading-indicator">
        Generating Key Pair...
      </div>

      <div class="bottomForm">
        <p>Already have an account? <button @click="navigateToLogin" class="btn btn-link">Login</button></p>
        <!-- Mark the "Register" button as type="submit" and add a name attribute -->
        <button :disabled="loading" type="submit" class="btn btn-primary mt-3" name="registerButton">Register</button>
      </div>
    </form>
  </div>
</template>


<script>
import { ref, inject } from 'vue';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import DOMPurify from 'dompurify';
import forge from 'node-forge';
import { provideUser } from '@/userStore';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const passwordVisibility = ref(false);
    const handleNavigate = inject('handleNavigate');
    const handleRegistered = inject('handleRegistered');
    const auth = getAuth();

    const generateKeyPair = async () => {
      try {
        loading.value = true;
        console.log('Generating keys with the following data:');

        console.log('Email:', email.value);
        console.log('Password:', password.value);

        // Generate an RSA key pair
        const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        const publicKey = forge.pki.publicKeyToPem(keys.publicKey);
        const privateKey = forge.pki.privateKeyToPem(keys.privateKey);

        console.log('publicKey', publicKey);

        if (!publicKey) {
          console.error('Key pair generation returned an empty public key.');
          throw new Error('Key pair generation returned an empty public key.');
        }

        loading.value = false;

        console.log('Generated key pair successfully:', publicKey);

        

        // Store the public key on the server
        return {
          publicKey, // Send the public key to the server
          privateKey, // Keep the private key for local storage
        };
      } catch (error) {
        loading.value = false;
        console.error('Key pair generation error:', error);
        throw error;
      }
    };

    const savePrivateKeyLocally = (privateKey) => {
      try {
        // Parse the PEM private key
        const parsedPrivateKey = forge.pki.privateKeyFromPem(privateKey);

        // Convert the private key to JWK format
        const privateKeyJWK = {
          kty: 'RSA',
          n: forge.util.encode64(parsedPrivateKey.n.toString()),
          e: forge.util.encode64(parsedPrivateKey.e.toString()),
          d: forge.util.encode64(parsedPrivateKey.d.toString()),
        };

        // Store the private key as a JWK in local storage
        localStorage.setItem('privateKey', JSON.stringify(privateKeyJWK));
      } catch (error) {
        console.error('Error saving private key:', error);
        // Handle the error as needed
        throw error
      }
    };

    const togglePasswordVisibility = () => {
      passwordVisibility.value = !passwordVisibility.value;
    };

    const register = async () => {
      try {
        if (password.value !== confirmPassword.value) {
          alert('Passwords do not match.');
          return;
        }
        if (!email.value || !password.value || !confirmPassword.value) {
          alert('Please fill in all the fields.');
          return;
        }
        // Generate an asymmetric key pair
        const userKeyPair = await generateKeyPair();

        // Store the private key securely on the user's device
        savePrivateKeyLocally(userKeyPair.privateKey);

        const sanitizedEmail = DOMPurify.sanitize(email.value);
        const sanitizedPassword = DOMPurify.sanitize(password.value);

        const authUserCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        const authUser = authUserCredential.user;

        const db = getDatabase();
        const userKeyRef = dbRef(db, `userKeys/${authUser.uid}`);
        await set(userKeyRef, {
          publicKey: userKeyPair.publicKey,
          // ...other user information...
        });

        alert('Registration successful!');
        handleRegistered(true);
      } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
      }
    };

    const navigateToLogin = () => {
      // Trigger a page transition to the login page
      handleNavigate('login');
    };

    

    const submitForm = (event) => {
      // Check the name attribute of the submitted button
      if (event.submitter.name === 'registerButton') {
        // Manually trigger the form submission for the "Register" button
        event.target.submit();
      }
    };

    provideUser();
    
    return {
      email,
      password,
      confirmPassword,
      loading,
      register,
      togglePasswordVisibility,
      navigateToLogin,
      submitForm, 
    };
  },
};
</script>

<style>
/* Add styling for the clickable eye icon */
.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none; /* Prevent text selection when clicking */
  color: #555; /* Adjust color as needed */
  font-size: 20px; /* Adjust font size as needed */
}

/* Style the eye icon as a button */
.toggle-password:hover {
  color: #333; /* Change color on hover */
}
form {
  max-width: 500px;
  margin: 185px auto;
  background: #25222B;
  text-align: left;
  padding: 40px;
  border-radius: 10px;
}

label {
  color: white;
  display: inline-block;
  margin: 25px 0 15px;
  font-size: 1em;
  text-transform: capitalize;
  letter-spacing: 1px;
  font-weight: bold;
}

input,
select {
  display: block;
  padding: 10px 6px;
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #ddd;
  color: #343434;
}

.passwordreset p {
  margin: 0px !important;
  padding: 5px !important;
  padding-left: 0px !important;
  color: rgb(172, 16, 16);
  margin-left: 10px;
  font-size: 0.8em;
  font-weight: bold;
}

.bottomForm {
  display: flex;
  justify-content: space-between;
}

.bottomForm p {
  padding-top: 5%;
  margin: 0px;
  color: rgb(253, 244, 243);
  font-size: 1em;
  font-weight: bold;
}

.header {
  display: flex;
  justify-content: center;
  font-family: 'Roboto', sans-serif; /* Apply the "Roboto" font */
}

/* Loading indicator style */
.loading-indicator {
  text-align: center;
  color: #1874a5;
  /* Oceanic blue */
  margin-top: 10px;
}
</style>
