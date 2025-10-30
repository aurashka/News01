
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { addCategory, updateCategory, deleteCategory } from '../../services/newsService';
import { Category } from '../../types';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';

const ManageCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        setLoading(true);
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
        const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch categories:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleOpenModal = (category: Category | null = null) => {
        setIsEditing(category);
        setCategoryName(category ? category.name : '');
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        try {
            if (isEditing) {
                await updateCategory(isEditing.id, categoryName);
            } else {
                await addCategory(categoryName);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            try {
                await deleteCategory(id);
            } catch (error) {
                console.error("Failed to delete category:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Categories</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">New Category</button>
            </div>
            
            {loading ? <Spinner /> : (
                 <div className="bg-lightcard dark:bg-darkcard rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {categories.map(cat => (
                            <li key={cat.id} className="p-4 flex justify-between items-center">
                                <span className="font-semibold">{cat.name}</span>
                                <div className="space-x-2">
                                    <button onClick={() => handleOpenModal(cat)} className="bg-blue-500 text-white py-1 px-3 rounded">Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} className="bg-red-500 text-white py-1 px-3 rounded">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? 'Edit Category' : 'New Category'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        required
                    />
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg">Save Category</button>
                </form>
            </Modal>
        </div>
    );
};

export default ManageCategories;
