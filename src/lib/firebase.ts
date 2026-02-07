// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    User
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA-xpSpvMAvL_PHw-BtleAY48f3yDgIcpE",
    authDomain: "europe-treks.firebaseapp.com",
    projectId: "europe-treks",
    storageBucket: "europe-treks.firebasestorage.app",
    messagingSenderId: "717667462194",
    appId: "1:717667462194:web:6ab6341c39475e34ab602b",
    measurementId: "G-JS75Z9NNXT"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export function getTreksCollection() {
    return collection(db, 'treks');
}

export async function fetchAllTreks() {
    const snapshot = await getDocs(getTreksCollection());
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchTrekById(id: string) {
    const ref = doc(db, 'treks', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function ensureAnonAuth(): Promise<User | null> {
    return new Promise(resolve => {
        onAuthStateChanged(auth, async user => {
            if (user) return resolve(user);
            try {
                const cred = await signInAnonymously(auth);
                resolve(cred.user);
            } catch (error) {
                console.error("Auth failed:", error);
                resolve(null);
            }
        });
    });
}

// --- Reviews ---
export interface Review {
    id?: string;
    trekId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: any;
    photoUrl?: string;
}

export async function fetchReviews(trekId: string): Promise<Review[]> {
    const q = collection(db, 'reviews');
    const snap = await getDocs(q);
    return snap.docs
        .map((d: any) => ({ id: d.id, ...d.data() } as Review))
        .filter((r: Review) => r.trekId === trekId);
}

export async function addReview(review: Omit<Review, 'id'>) {
    return addDoc(collection(db, 'reviews'), {
        ...review,
        createdAt: new Date()
    });
}

// --- Gallery / Photo Simulation ---
export async function uploadTrekPhoto(trekId: string, file: File) {
    // In a real app we'd use getStorage(app) and uploadBytes
    // For this demo, we simulate a successful "upload"
    console.log(`Simulating upload for ${file.name} to trek ${trekId}`);
    return "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80"; // Mock URL
}
