
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getCategories, addArticle, updateArticle, deleteArticle, uploadImage } from '../../services/newsService';
import { Article, Category } from '../../types';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

const ManageArticles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<Article | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', category: '', imageUrl: '', isBreaking: false });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        const articlesQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
            setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch articles:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
            if (fetchedCategories.length > 0 && !isEditing) {
                setFormData(prev => ({ ...prev, category: fetchedCategories[0].name }));
            }
        };
        fetchCategories();
    }, [isEditing]);

    const handleOpenModal = (article: Article | null = null) => {
        setIsEditing(article);
        if (article) {
            setFormData({
                title: article.title,
                content: article.content,
                category: article.category,
                imageUrl: article.imageUrl,
                isBreaking: article.isBreaking || false,
            });
        } else {
            setFormData({ title: '', content: '', category: categories[0]?.name || '', imageUrl: '', isBreaking: false });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
            setFormData(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let imageUrl = isEditing ? formData.imageUrl : '';
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }
            if (!imageUrl) {
                alert("Image is required.");
                setIsSubmitting(false);
                return;
            }
            const articleData = { ...formData, imageUrl, authorName: 'Admin', authorImageUrl: 'https://i.pravatar.cc/150?u=admin' };
            
            if (isEditing) {
                await updateArticle(isEditing.id, articleData);
            } else {
                await addArticle(articleData as any);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save article:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            try {
                await deleteArticle(id);
            } catch (error) {
                console.error("Failed to delete article:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Articles</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">New Article</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-lightcard dark:bg-darkcard rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {articles.map(article => (
                            <li key={article.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{article.title}</p>
                                    <p className="text-sm text-graytext">{article.category} {article.isBreaking && <span className="text-red-500 font-semibold">(Breaking)</span>}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleOpenModal(article)} className="bg-blue-500 text-white py-1 px-3 rounded">Edit</button>
                                    <button onClick={() => handleDelete(article.id)} className="bg-red-500 text-white py-1 px-3 rounded">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? 'Edit Article' : 'New Article'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600" required />
                    <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Content" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 h-32" required />
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600" required>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600" accept="image/*" />
                    <label className="flex items-center space-x-2"><input type="checkbox" name="isBreaking" checked={formData.isBreaking} onChange={handleChange} /> <span>Is Breaking News?</span></label>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save Article'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ManageArticles;
