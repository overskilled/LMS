"use client";

import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface AddData {
    name?: string;
    amount?: number;
    percentage?: number;
}


export async function addToSubCollection(
    addData: any,
    collectionName: string,
    documentId: string,
    table: string
): Promise<any | null> {
    try {
        console.log(addData)
        console.log(collectionName)
        console.log(documentId)
        console.log(table)

        // Reference the Firestore collection
        const collectionRef = collection(db, collectionName, documentId, table);
        console.log(addData)

        // Add the document to the collection with auto-generated ID
        const docRef = await addDoc(collectionRef, {
            ...addData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef; // Return the document ID
    } catch (error) {
        console.error("Error adding document:", error); // Log detailed error for debugging
        return null; // Indicate failure
    }
}


export async function setToSubCollection(
    addId: string,
    addData: any,
    collectionName: string,
    documentId: string,
    table: string
): Promise<any | null> {

    try {
        // Reference the Firestore collection
        const collectionRef = collection(db, collectionName, documentId, table);

        // Add the document to the collection with auto-generated ID
        const docRef = await addDoc(collectionRef, {
            ...addData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef; // Return the document ID
    } catch (error) {
        console.error("Error adding document:", error); // Log detailed error for debugging
        return null; // Indicate failure
    }
}