import { db } from "../firebase.js";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const addMessageToFirestore = async (ticketId, senderEmail, senderName, content) => {
  try {
    const messagesRef = collection(db, "messages");
    await addDoc(messagesRef, {
      ticketId: String(ticketId),
      senderEmail: senderEmail,
      senderName: senderName,
      content: content,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Błąd podczas dodawania wiadomości:", error);
  }
};

export const subscribeToTicketMessages = (ticketId, callback) => {
  const messagesRef = collection(db, "messages");
  
  const q = query(
    messagesRef, 
    where("ticketId", "==", String(ticketId)), 
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};