const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');  // Ensure the correct path here

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Function to store a notification in a subcollection of a document in the "system" collection.
 * @param {string} stringID - The ID of the document in the "system" collection.
 * @param {object} notificationData - The notification data to store in the "Notification" subcollection.
 */

async function storeNotification(stringID, notificationData) {
  try {
    // Reference to the "system" collection and the specific document by ID
    const systemDocRef = db.collection('system').doc(stringID);

    // Check if the document exists
    const doc = await systemDocRef.get();
    if (!doc.exists) {
      console.log(`Document with ID ${stringID} does not exist in the "system" collection.`);
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

// // Example usage
// const stringID = 'exampleSystemID'; // Replace with the actual document ID
// const notificationData = {
//   message: 'This is a test notification',
//   timestamp: new Date(),
//   read: false,
// };

// storeNotification(stringID, notificationData);
