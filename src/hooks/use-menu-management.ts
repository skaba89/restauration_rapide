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
      // Try to fetch from API with restaurantId
      const params = new URLSearchParams();
      if (restaurantSlug) {
        params.append('restaurantId', restaurantSlug);
      }
      
      const menuRes = await fetch(`/api/menu?${params.toString()}`);
      const menuData = await menuRes.json();
      
      // Use real data if available
      const dataToUse = (menuData.success && menuData.data && 
        (Array.isArray(menuData.data) ? menuData.data.length > 0 : menuData.data.categories?.length > 0))
        ? menuData
        : null;
      
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

  // Load empty data as fallback when API fails
  const loadDemoData = () => {
    const fallbackCategories: MenuCategory[] = [];
    const fallbackItems: MenuItem[] = [];
    setCategories(fallbackCategories);
    setItems(fallbackItems);
    setMenu({
      id: 'menu-1',
      restaurantId: restaurantSlug || 'demo-restaurant',
      name: 'Menu Principal',
      slug: 'menu-principal',
      description: 'Notre menu principal',
      isActive: true,
      categories: fallbackCategories
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