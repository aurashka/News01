
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    limit, 
    orderBy, 
    Timestamp,
    updateDoc,
    addDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Article, Category } from '../types';

const ARTICLES_COLLECTION = 'articles';
const USERS_COLLECTION = 'users';
const CATEGORIES_COLLECTION = 'categories';

// --- Seeding ---
export const seedDummyData = async () => {
    const categoriesCollectionRef = collection(db, CATEGORIES_COLLECTION);
    const catSnapshot = await getDocs(query(categoriesCollectionRef, limit(1)));
    if (catSnapshot.empty) {
        console.log("Seeding categories...");
        const categoriesToSeed = ['Sports', 'Education', 'World', 'Technology', 'Health', 'Business'];
        for (const cat of categoriesToSeed) {
            await addDoc(categoriesCollectionRef, { name: cat });
        }
    } else {
        console.log("Categories already seeded.");
    }

    const articlesCollectionRef = collection(db, ARTICLES_COLLECTION);
    const articleSnapshot = await getDocs(query(articlesCollectionRef, limit(1)));
    if (articleSnapshot.empty) {
        console.log("Seeding articles...");
        const dummyAuthors = [
            { name: 'CNN Indonesia', image: 'https://i.pravatar.cc/150?u=cnn' },
            { name: 'McKinley', image: 'https://i.pravatar.cc/150?u=mckinley' },
            { name: 'Adam.K', image: 'https://i.pravatar.cc/150?u=adamk' },
            { name: 'BBC News', image: 'https://i.pravatar.cc/150?u=bbc' },
        ];
        const dummyArticles = [
            { title: 'Alexander wears modified helmet in road races', category: 'Sports', isBreaking: true, content: 'As a tech department, we’re usually pretty good at spotting tech that’s out of the ordinary...' },
            { title: 'What Training Do Volleyball Players Need?', category: 'Sports', isBreaking: false, content: 'Volleyball training involves a combination of physical conditioning, skill development, and strategic practice...' },
            { title: 'Secondary school places: When do parents find out?', category: 'Education', isBreaking: false, content: 'Parents across the country are eagerly awaiting to find out which secondary school their children will be attending...' },
            { title: 'AI in Healthcare: The Future is Now', category: 'Technology', isBreaking: true, content: 'Artificial Intelligence is revolutionizing the healthcare industry...' },
            { title: 'Global Markets React to Interest Rate Hikes', category: 'Business', isBreaking: true, content: 'Stock markets around the world experienced significant volatility...' },
            { title: 'New Study Links Gut Health to Mental Well-being', category: 'Health', isBreaking: false, content: 'A groundbreaking new study has provided further evidence of the strong connection between the gut microbiome and mental health...' },
        ];
        for (const article of dummyArticles) {
            const randomAuthor = dummyAuthors[Math.floor(Math.random() * dummyAuthors.length)];
            await addDoc(articlesCollectionRef, {
                ...article,
                imageUrl: `https://picsum.photos/seed/${Math.random()}/400/300`,
                authorName: randomAuthor.name,
                authorImageUrl: randomAuthor.image,
                createdAt: Timestamp.now(),
            });
        }
    } else {
        console.log("Articles already seeded.");
    }
    console.log("Seeding check complete.");
};

// --- Article Fetching ---
export const getBreakingNews = async (): Promise<Article[]> => {
    const q = query(collection(db, ARTICLES_COLLECTION), where("isBreaking", "==", true), limit(5));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

export const getNewsByCategory = async (category: string): Promise<Article[]> => {
    let q;
    if (category.toLowerCase() === 'all') {
        q = query(collection(db, ARTICLES_COLLECTION), orderBy("createdAt", "desc"));
    } else {
        q = query(collection(db, ARTICLES_COLLECTION), where("category", "==", category), orderBy("createdAt", "desc"));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

export const getArticleById = async (id: string): Promise<Article | null> => {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Article;
    }
    return null;
};

export const searchArticles = async (searchTerm: string): Promise<Article[]> => {
  if (!searchTerm.trim()) return [];
  const q = query(collection(db, ARTICLES_COLLECTION), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const allArticles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
  const lowercasedTerm = searchTerm.toLowerCase();
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(lowercasedTerm) ||
    article.category.toLowerCase().includes(lowercasedTerm)
  );
};

// --- Bookmarking ---
export const getUserBookmarks = async (userId: string): Promise<string[]> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data()?.bookmarkedArticles || [] : [];
};

export const toggleBookmark = async (userId: string, articleId: string) => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const bookmarkedArticles = await getUserBookmarks(userId);
    const updatePayload = bookmarkedArticles.includes(articleId) 
        ? { bookmarkedArticles: arrayRemove(articleId) } 
        : { bookmarkedArticles: arrayUnion(articleId) };
    await updateDoc(userDocRef, updatePayload);
};

export const getBookmarkedArticles = async (userId: string): Promise<Article[]> => {
    const bookmarkedIds = await getUserBookmarks(userId);
    if (bookmarkedIds.length === 0) return [];
    const articlePromises = bookmarkedIds.map(id => getArticleById(id));
    const articles = await Promise.all(articlePromises);
    return articles.filter((article): article is Article => article !== null);
};


// --- Admin: Categories ---
export const getCategories = async (): Promise<Category[]> => {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategory = (name: string) => addDoc(collection(db, CATEGORIES_COLLECTION), { name });
export const updateCategory = (id: string, name: string) => updateDoc(doc(db, CATEGORIES_COLLECTION, id), { name });
export const deleteCategory = (id: string) => deleteDoc(doc(db, CATEGORIES_COLLECTION, id));


// --- Admin: Articles ---
export const getAllArticles = async (): Promise<Article[]> => {
    const q = query(collection(db, ARTICLES_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

export const addArticle = (data: Omit<Article, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, ARTICLES_COLLECTION), {
        ...data,
        createdAt: Timestamp.now(),
    });
};

export const updateArticle = (id: string, data: Partial<Article>) => updateDoc(doc(db, ARTICLES_COLLECTION, id), data);
export const deleteArticle = (id: string) => deleteDoc(doc(db, ARTICLES_COLLECTION, id));

export const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};
