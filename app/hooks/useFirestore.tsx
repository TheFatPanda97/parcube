import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";

import type { Firestore } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";

type DocData = DocumentData & { id: string };

/**
 * Custom firestore class for performing CRUD operations on firestore
 */
class CustomFirestore {
  private db: Firestore;

  constructor(firebaseApp: FirebaseApp) {
    this.db = getFirestore(firebaseApp);
  }

  /**
   * method to read from firestore
   * @param path path to read document(s) from
   * @param uid document id
   * @returns an object of the document if uid is passed in, or a list of objects if the path points to a collection
   */
  async read(path: string): Promise<DocData[]>;
  async read(path: string, uid: string): Promise<DocumentData>;
  async read(path: string, uid?: string) {
    // path points to a document
    if (uid) {
      const docRef = doc(this.db, path, uid);
      return (await getDoc(docRef)).data();
    } else {
      // path points to a collection
      const res = await getDocs(collection(this.db, path));
      return res.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
  }

  /**
   * method to create a document in firestore
   * @param path path to collection to add a document
   * @param data object containing data to add
   * @param uid document id
   */
  create(path: string, data: object, uid?: string) {
    // custom document id
    if (uid) {
      return setDoc(doc(this.db, path, uid), data);
    } else {
      // let firestore generate the document id
      return addDoc(collection(this.db, path), data);
    }
  }

  /**
   * method to update firestore documents
   * @param path path to collection of document to update
   * @param data data to replace current data
   * @param uid document id to update
   */
  async update(path: string, data: object, uid: string) {
    await updateDoc(doc(this.db, path, uid), data);
  }

  /**
   * method to delete firestore documents
   * @param path path to collection of document to update
   * @param uid document id to delete
   */
  async delete(path: string, uid: string) {
    await deleteDoc(doc(this.db, path, uid));
  }
}

/**
 * instantiates an instance of the custom firestore
 * @param firebaseApp an instance of firesbaseApp, see FirebaseAppContext.tsx
 */
const useFirestore = (firebaseApp: FirebaseApp) => new CustomFirestore(firebaseApp);

export default useFirestore;
export type { CustomFirestore };
