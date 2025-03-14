require('dotenv').config();
const admin = require('firebase-admin');

// const serviceAccount = require("../../../config/serviceAccountKey.json");  // get account key to access to firebase project

// Convert the PRIVATE_KEY properly (because \n must be replaced with actual newlines)
const serviceAccount = {
  type: process.env.SERVICE_ACCOUNT_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newlines
  client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
  token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
  universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN
};

// console.log(serviceAccount); debug

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Function to store a notification in a subcollection of a document in the "system" collection.
 * @param {string} systemId - The ID of the document in the "system" collection. // systemId
 * @param {object} notificationData - The notification data to store in the "Notification" subcollection.
 */

async function storeNotification(systemId, notificationData) {
  try {
    // Reference to the "system" collection and the specific document by ID
    const systemDocRef = db.collection('system').doc(systemId);

    // Check if the document exists
    const doc = await systemDocRef.get();
    if (!doc.exists) {
      console.log(`Document with ID ${systemId} does not exist in the "system" collection.`);
      return;
    }

    // Add a new document to the "Notification" subcollection
    const notificationRef = systemDocRef.collection('notificationList').doc();
    await notificationRef.set(notificationData);

    console.log(`Notification added to subcollection with ID: ${notificationRef.id}`);
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}


async function checkTenantsRegistered(systemId, chatId) {
  try {
    console.log(`Checking registration for ChatID: ${chatId} in system: ${systemId}`);

    const systemDocRef = db.collection('system').doc(systemId);
    const doc = await systemDocRef.get();

    if (!doc.exists) {
      console.log(`Document with ID ${systemId} does not exist in the "system" collection.`);
      return false;
    }

    const notificationRef = systemDocRef.collection('notificationList');
    const query = await notificationRef
      .where('dataType', '==', 'registration') 
      .where('chatID', '==', chatId.toString())
      .where('isApprove', '==', true)
      .get();


    console.log(`Query executed. Found ${query.docs.length} matching documents.`);

    if (query.empty) {
      console.log(`Tenant with this ChatID ${chatId} has NOT registered under system ${systemId}`);
      
      // Debug: Print all documents in notificationList
      // const allDocs = await notificationRef.get();
      // console.log(`All notificationList documents for system ${systemId}:`);
      // allDocs.forEach(doc => console.log(doc.id, " => ", doc.data()));

      return false;
    } else {
      console.log(`Tenant with this ChatID ${chatId} is already registered under system ${systemId}`);
      
      // Debug: Print out the first found document for further analysis
      // console.log("Matching document data:", query.docs[0].data());
      
      return true;
    }
  } catch (error) {
    console.error('Error checking notification:', error);
  }
}

// function to fetch rule data from firestore by specific systemId
async function fetchRule(systemID) {
  try {
    // Reference the specific system document
    const systemRef = db.collection('system').doc(systemID);
    // const systemDoc = await systemRef.get(); // get all doc

    const systemDoc = await systemRef.get({ fieldMask: ['landlord.settings.rule'] });
    console.log(systemDoc.data());  // Retrieves ONLY landlord.settings.rule

    if (!systemDoc.exists) {
      return "System ID not found.";
    }

    // Extract the landlord settings
    const data = systemDoc.data();
    const rule = data.landlord?.settings?.rule || "No rule found.";

    return `-> Here The Rule: \n\n${rule}`;
  } catch (error) {
    console.error("Error fetching rule:", error);
    return "Error fetching data.";
  }
}

// function to fetch contact from system in firestore
async function fetchContact(systemID) {
  try {
    // Reference the specific system document
    const systemRef = db.collection('system').doc(systemID);

    const systemDoc = await systemRef.get({ fieldMask: ['landlord.phoneNumber'] });
    console.log(systemDoc.data());  // Retrieves ONLY landlord.phoneNumber

    if (!systemDoc.exists) {
      return "System ID not found.";
    }

    // Extract the landlord contact
    const data = systemDoc.data();
    const contact = data.landlord?.phoneNumber || "No contact found.";

    return `Please contact landlord through this contact: \n\n${contact}`;
  } catch (error) {
    console.error("Error fetching contact:", error);
    return "Error fetching data.";
  }
  
}


module.exports = { storeNotification, checkTenantsRegistered, fetchRule, fetchContact }



// // function to check if register or not yet
// async function checkTenantsRegistered(stringID,chatId) {
//   try {

//     // Reference to the "system" collection and the specific document by ID
//     const systemDocRef = db.collection('system').doc(stringID);

//     // Check if the document exists
//     const doc = await systemDocRef.get();
//     if (!doc.exists) {
//       console.log(`Document with ID ${stringID} does not exist in the "system" collection.`);
//       return false;
//     }

//     const notificationRef = systemDocRef.collection('notificationList');
//     const query = await notificationRef
//     .where ('dataType', '==', 'registration')
//     .where ('chatID', '==', chatId.toString())
//     .get();

//     if (query.empty) {
//       console.log(`Tenant with this ChatID ${chatId} has not registered under system ${stringID}`);
//       return false;   // tenant not registered yet
//     }else{
//       console.log(`Tenant with this ChatID ${chatId} already registered under system ${stringID}`);
//       return true;    // tenant registered 
//     }

    
//   } catch (error) {
//     console.error('Error checking notification:', error);
//   }
// }




// // Example usage
// const stringID = 'examplesystemId'; // Replace with the actual document ID
// const notificationData = {
//   message: 'This is a test notification',
//   timestamp: new Date(),
//   read: false,
// };

// storeNotification(stringID, notificationData);
