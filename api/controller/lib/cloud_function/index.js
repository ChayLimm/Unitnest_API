// require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = require("../../../../config/serviceAccountKey.json");  // get account key to access to firebase project

// /// Testing to access firebase sdk
// const serviceAccount = {
//   type: process.env.SERVICE_ACCOUNT_TYPE,
//   project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
//   private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
//   private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
//   client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
//   client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
//   auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
//   token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
//   auth_provider_x509_cert_url: process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
//   client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
// };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



const db = admin.firestore();

/**
 * Function to store a notification in a subcollection of a document in the "system" collection.
 * @param {string} systemID - The ID of the document in the "system" collection. // systemId
 * @param {object} notificationData - The notification data to store in the "Notification" subcollection.
 */

async function storeNotification(systemID, notificationData) {
  try {
    // Reference to the "system" collection and the specific document by ID
    const systemDocRef = db.collection('system').doc(systemID);

    // Check if the document exists
    const doc = await systemDocRef.get();
    if (!doc.exists) {
      console.log(`Document with ID ${systemID} does not exist in the "system" collection.`);
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


async function checkTenantsRegistered(systemID, chatId) {
  try {
    console.log(`Checking registration for ChatID: ${chatId} in system: ${systemID}`);

    const systemDocRef = db.collection('system').doc(systemID);
    const doc = await systemDocRef.get();

    if (!doc.exists) {
      console.log(`Document with ID ${systemID} does not exist in the "system" collection.`);
      return false;
    }

    const notificationRef = systemDocRef.collection('notificationList');
    const query = await notificationRef
      .where('dataType', '==', 'registration') 
      .where('chatID', '==', chatId.toString()) 
      .get();

    console.log(`Query executed. Found ${query.docs.length} matching documents.`);

    if (query.empty) {
      console.log(`Tenant with this ChatID ${chatId} has NOT registered under system ${systemID}`);
      
      // Debug: Print all documents in notificationList
      const allDocs = await notificationRef.get();
      console.log(`All notificationList documents for system ${systemID}:`);
      allDocs.forEach(doc => console.log(doc.id, " => ", doc.data()));

      return false;
    } else {
      console.log(`Tenant with this ChatID ${chatId} is already registered under system ${systemID}`);
      
      // Debug: Print out the first found document for further analysis
      console.log("Matching document data:", query.docs[0].data());
      
      return true;
    }
  } catch (error) {
    console.error('Error checking notification:', error);
  }
}





module.exports = { storeNotification, checkTenantsRegistered }



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
// const stringID = 'exampleSystemID'; // Replace with the actual document ID
// const notificationData = {
//   message: 'This is a test notification',
//   timestamp: new Date(),
//   read: false,
// };

// storeNotification(stringID, notificationData);
