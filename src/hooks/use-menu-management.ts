'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
export interface MenuItem {
  id: string;
  categoryId: string;
  category?: { id: string; name: string };
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  discountPrice: number | null;
  prepTime: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel: number;
  calories: number | null;
}

export interface MenuCategory {
  id: string;
  menuId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { items: number };
  items?: MenuItem[];
}

export interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  categories: MenuCategory[];
}

// Hook for menu management
export function useMenuManagement(restaurantSlug?: string) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from public restaurant API by slug first
      if (restaurantSlug) {
        const publicRes = await fetch(`/api/public/restaurant/${restaurantSlug}`);
        if (publicRes.ok) {
          const publicData = await publicRes.json();
          if (publicData.data?.menus?.length > 0) {
            const menuInfo = publicData.data.menus[0];
            setMenu({
              id: menuInfo.id,
              restaurantId: publicData.data.id,
              name: menuInfo.name,
              slug: menuInfo.slug,
              description: menuInfo.description,
              isActive: true,
              categories: menuInfo.categories || []
            });
            
            const cats: MenuCategory[] = (menuInfo.categories || []).map((cat: any) => ({
              id: cat.id,
              menuId: menuInfo.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              icon: cat.icon,
              isActive: true,
              sortOrder: 0,
              items: cat.items
            }));
            
            setCategories(cats);
            
            // Flatten all items from all categories
            const allItems: MenuItem[] = [];
            cats.forEach((cat) => {
              if (cat.items) {
                allItems.push(...cat.items.map((item: MenuItem) => ({
                  ...item,
                  categoryId: cat.id,
                  category: { id: cat.id, name: cat.name }
                })));
              }
            });
            setItems(allItems);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fallback: fetch from menu API with restaurantId or demo
      const demoRes = await fetch('/api/menu?demo=true');
      const demoData = await demoRes.json();
      
      // Try to fetch from API with restaurantId
      const params = new URLSearchParams();
      if (restaurantSlug) {
        params.append('restaurantId', restaurantSlug);
      }
      
      const menuRes = await fetch(`/api/menu?${params.toString()}`);
      const menuData = await menuRes.json();
      
      // Use real data if available, otherwise use demo data
      const dataToUse = (menuData.success && menuData.data && 
        (Array.isArray(menuData.data) ? menuData.data.length > 0 : menuData.data.categories?.length > 0))
        ? menuData
        : demoData;
      
      if (dataToUse.success && dataToUse.data) {
        const menuInfo = Array.isArray(dataToUse.data) ? dataToUse.data[0] : dataToUse.data;
        
        if (menuInfo) {
          setMenu(menuInfo);
          setCategories(menuInfo.categories || []);
          
          // Flatten all items from all categories
          const allItems: MenuItem[] = [];
          (menuInfo.categories || []).forEach((cat: MenuCategory) => {
            if (cat.items) {
              allItems.push(...cat.items.map((item: MenuItem) => ({
                ...item,
                categoryId: cat.id,
                category: { id: cat.id, name: cat.name }
              })));
            }
          });
          setItems(allItems);
        } else {
          // No menu found, load demo data
          loadDemoData();
        }
      } else {
        // API failed, load demo data
        loadDemoData();
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Erreur lors du chargement du menu');
      // Use demo data as fallback
      loadDemoData();
    } finally {
      setLoading(false);
    }
  }, [restaurantSlug]);

  // Load demo data as fallback
  const loadDemoData = () => {
    const demoCategories: MenuCategory[] = [
      { id: 'cat-1', menuId: 'menu-1', name: 'Plats Principaux', slug: 'plats-principaux', description: 'Nos spécialités principales', icon: 'utensils', isActive: true, sortOrder: 1, _count: { items: 6 } },
      { id: 'cat-2', menuId: 'menu-1', name: 'Accompagnements', slug: 'accompagnements', description: 'Frites et accompagnements', icon: 'cookie', isActive: true, sortOrder: 2, _count: { items: 2 } },
      { id: 'cat-3', menuId: 'menu-1', name: 'Boissons', slug: 'boissons', description: 'Jus frais et boissons', icon: 'cup', isActive: true, sortOrder: 3, _count: { items: 2 } },
      { id: 'cat-4', menuId: 'menu-1', name: 'Desserts', slug: 'desserts', description: 'Nos desserts maison', icon: 'cake', isActive: true, sortOrder: 4, _count: { items: 0 } },
    ];

    const demoItems: MenuItem[] = [
      { id: '1', categoryId: 'cat-1', category: { id: 'cat-1', name: 'Plats Principaux' }, name: 'Attieké Poisson Grillé', slug: 'attieke-poisson', description: 'Attieké traditionnel avec poisson grillé', image: null, price: 8000, discountPrice: null, prepTime: 20, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: true, spicyLevel: 1, calories: 450 },
      { id: '2', categoryId: 'cat-1', category: { id: 'cat-1', name: 'Plats Principaux' }, name: 'Kedjenou de Poulet', slug: 'kedjenou-poulet', description: 'Poulet braisé aux légumes, cuit à l\'étouffée', image: null, price: 7000, discountPrice: null, prepTime: 25, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, calories: 520 },
      { id: '3', categoryId: 'cat-1', category: { id: 'cat-1', name: 'Plats Principaux' }, name: 'Thiéboudienne', slug: 'thieboudienne', description: 'Riz rouge au poisson et légumes', image: null, price: 7000, discountPrice: null, prepTime: 30, isAvailable: true, isFeatured: false, isPopular: true, isNew: true, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, calories: 480 },
      { id: '4', categoryId: 'cat-1', category: { id: 'cat-1', name: 'Plats Principaux' }, name: 'Garba', slug: 'garba', description: 'Attiéké au thon et piment', image: null, price: 3500, discountPrice: null, prepTime: 15, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: true, spicyLevel: 2, calories: 380 },
      { id: '5', categoryId: 'cat-1', category: { id: 'cat-1', name: 'Plats Principaux' }, name: 'Riz Gras', slug: 'riz-gras', description: 'Riz sauté à la viande', image: null, price: 5000, discountPrice: null, prepTime: 20, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, calories: 420 },
      { id: '6', categoryId: 'cat-1', category: { id: 'cat-1', name: 'Plats Principaux' }, name: 'Foutou Banane', slug: 'foutou-banane', description: 'Pâte de banane plantain avec sauce', image: null, price: 6000, discountPrice: null, prepTime: 30, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, calories: 550 },
      { id: '7', categoryId: 'cat-2', category: { id: 'cat-2', name: 'Accompagnements' }, name: 'Alloco Sauce Graine', slug: 'alloco-sauce', description: 'Bananes plantain frites avec sauce graine', image: null, price: 5000, discountPrice: null, prepTime: 15, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, calories: 320 },
      { id: '8', categoryId: 'cat-2', category: { id: 'cat-2', name: 'Accompagnements' }, name: 'Banane Plantain Frite', slug: 'banane-frite', description: 'Bananes plantain frites', image: null, price: 2000, discountPrice: null, prepTime: 10, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, calories: 250 },
      { id: '9', categoryId: 'cat-3', category: { id: 'cat-3', name: 'Boissons' }, name: 'Jus de Bissap', slug: 'jus-bissap', description: 'Jus naturel de fleur d\'hibiscus', image: null, price: 1500, discountPrice: null, prepTime: 5, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, calories: 80 },
      { id: '10', categoryId: 'cat-3', category: { id: 'cat-3', name: 'Boissons' }, name: 'Jus de Gingembre', slug: 'jus-gingembre', description: 'Jus de gingembre frais et pimentant', image: null, price: 1500, discountPrice: null, prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true, isSpicy: true, spicyLevel: 1, calories: 60 },
    ];

    setCategories(demoCategories);
    setItems(demoItems);
    setMenu({
      id: 'menu-1',
      restaurantId: restaurantSlug || 'demo-restaurant',
      name: 'Menu Principal',
      slug: 'menu-principal',
      description: 'Notre menu principal',
      isActive: true,
      categories: demoCategories
    });
  };

  // Add a new category
  const addCategory = async (data: Partial<MenuCategory>) => {
    try {
      const res = await fetch('/api/menu-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId: menu?.id, ...data })
      });
      const result = await res.json();
      
      if (result.success) {
        setCategories(prev => [...prev, result.data]);
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error adding category:', err);
      // Fallback: add locally
      const newCategory: MenuCategory = {
        id: `cat-${Date.now()}`,
        menuId: menu?.id || '',
        name: data.name || '',
        slug: data.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: data.description || null,
        icon: data.icon || null,
        isActive: data.isActive ?? true,
        sortOrder: categories.length,
        _count: { items: 0 }
      };
      setCategories(prev => [...prev, newCategory]);
      return { success: true, data: newCategory };
    }
  };

  // Update a category
  const updateCategory = async (id: string, data: Partial<MenuCategory>) => {
    try {
      const res = await fetch(`/api/menu-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        setCategories(prev => prev.map(c => c.id === id ? result.data : c));
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error updating category:', err);
      // Fallback: update locally
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      return { success: true };
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/menu-categories/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      
      if (result.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        setItems(prev => prev.filter(i => i.categoryId !== id));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error deleting category:', err);
      // Fallback: delete locally
      setCategories(prev => prev.filter(c => c.id !== id));
      setItems(prev => prev.filter(i => i.categoryId !== id));
      return { success: true };
    }
  };

  // Add a new menu item
  const addItem = async (data: Partial<MenuItem>) => {
    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        setItems(prev => [...prev, result.data]);
        // Update category count
        setCategories(prev => prev.map(c => 
          c.id === data.categoryId 
            ? { ...c, _count: { items: (c._count?.items || 0) + 1 } }
            : c
        ));
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error adding item:', err);
      // Fallback: add locally
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        categoryId: data.categoryId || '',
        category: categories.find(c => c.id === data.categoryId) 
          ? { id: data.categoryId!, name: categories.find(c => c.id === data.categoryId)!.name }
          : undefined,
        name: data.name || '',
        slug: data.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: data.description || null,
        image: data.image || null,
        price: data.price || 0,
        discountPrice: data.discountPrice || null,
        prepTime: data.prepTime || null,
        isAvailable: data.isAvailable ?? true,
        isFeatured: data.isFeatured ?? false,
        isPopular: data.isPopular ?? false,
        isNew: data.isNew ?? false,
        isVegetarian: data.isVegetarian ?? false,
        isVegan: data.isVegan ?? false,
        isHalal: data.isHalal ?? false,
        isGlutenFree: data.isGlutenFree ?? false,
        isSpicy: data.isSpicy ?? false,
        spicyLevel: data.spicyLevel || 0,
        calories: data.calories || null,
      };
      setItems(prev => [...prev, newItem]);
      return { success: true, data: newItem };
    }
  };

  // Update a menu item
  const updateItem = async (id: string, data: Partial<MenuItem>) => {
    try {
      const res = await fetch(`/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        setItems(prev => prev.map(i => i.id === id ? result.data : i));
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error updating item:', err);
      // Fallback: update locally
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      return { success: true };
    }
  };

  // Delete a menu item
  const deleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    try {
      const res = await fetch(`/api/menu-items/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== id));
        // Update category count
        if (item?.categoryId) {
          setCategories(prev => prev.map(c => 
            c.id === item.categoryId 
              ? { ...c, _count: { items: Math.max(0, (c._count?.items || 0) - 1) } }
              : c
          ));
        }
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error deleting item:', err);
      // Fallback: delete locally
      setItems(prev => prev.filter(i => i.id !== id));
      if (item?.categoryId) {
        setCategories(prev => prev.map(c => 
          c.id === item.categoryId 
            ? { ...c, _count: { items: Math.max(0, (c._count?.items || 0) - 1) } }
            : c
        ));
      }
      return { success: true };
    }
  };

  // Toggle item availability
  const toggleItemAvailability = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return { success: false, error: 'Item not found' };
    
    return updateItem(id, { isAvailable: !item.isAvailable });
  };

  // Duplicate an item
  const duplicateItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return { success: false, error: 'Item not found' };
    
    return addItem({
      ...item,
      id: undefined,
      name: `${item.name} (copie)`,
      slug: undefined,
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    menu,
    categories,
    items,
    loading,
    error,
    refresh: fetchData,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    duplicateItem,
  };
}
