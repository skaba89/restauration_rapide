/**
 * Offline Database Service for KFM DELICE
 * IndexedDB wrapper for offline data storage
 * Supports: menu items, orders, customers, sync queue
 */

// ============================================
// Types
// ============================================

export interface OfflineOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
  syncAttempts: number;
  lastSyncAttempt?: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface OfflineMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  popular: boolean;
  preparationTime?: number;
  lastUpdated: Date;
}

export interface OfflineCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
}

export interface SyncQueueItem {
  id: string;
  type: 'order' | 'customer' | 'payment';
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

export interface SyncStatus {
  pendingOrders: number;
  pendingCustomers: number;
  pendingPayments: number;
  lastSync: Date | null;
  isSyncing: boolean;
  errors: string[];
}

// ============================================
// Database Configuration
// ============================================

const DB_NAME = 'kfm-delice-offline';
const DB_VERSION = 2;

// Store names
const STORES = {
  ORDERS: 'orders',
  MENU_ITEMS: 'menuItems',
  CUSTOMERS: 'customers',
  SYNC_QUEUE: 'syncQueue',
  SETTINGS: 'settings',
} as const;

// ============================================
// Database Connection
// ============================================

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize and get the database connection
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Orders store
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const orderStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
        orderStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
        orderStore.createIndex('orderNumber', 'orderNumber', { unique: true });
      }

      // Menu items store
      if (!db.objectStoreNames.contains(STORES.MENU_ITEMS)) {
        const menuStore = db.createObjectStore(STORES.MENU_ITEMS, { keyPath: 'id' });
        menuStore.createIndex('category', 'category', { unique: false });
        menuStore.createIndex('available', 'available', { unique: false });
      }

      // Customers store
      if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
        const customerStore = db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id' });
        customerStore.createIndex('phone', 'phone', { unique: true });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

// ============================================
// Generic CRUD Operations
// ============================================

async function addItem<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(item);
  });
}

async function updateItem<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(item);
  });
}

async function deleteItem(
  storeName: string,
  id: string
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getItem<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function getAllItems<T>(
  storeName: string
): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================
// Orders Operations
// ============================================

export const offlineOrders = {
  async add(order: OfflineOrder): Promise<OfflineOrder> {
    return addItem(STORES.ORDERS, order);
  },

  async update(order: OfflineOrder): Promise<OfflineOrder> {
    return updateItem(STORES.ORDERS, order);
  },

  async delete(id: string): Promise<void> {
    return deleteItem(STORES.ORDERS, id);
  },

  async get(id: string): Promise<OfflineOrder | null> {
    return getItem<OfflineOrder>(STORES.ORDERS, id);
  },

  async getAll(): Promise<OfflineOrder[]> {
    return getAllItems<OfflineOrder>(STORES.ORDERS);
  },

  async getPending(): Promise<OfflineOrder[]> {
    return getItemsByIndex<OfflineOrder>(STORES.ORDERS, 'syncStatus', 'pending');
  },

  async getFailed(): Promise<OfflineOrder[]> {
    return getItemsByIndex<OfflineOrder>(STORES.ORDERS, 'syncStatus', 'failed');
  },

  async markSynced(id: string): Promise<void> {
    const order = await this.get(id);
    if (order) {
      order.syncStatus = 'synced';
      order.lastSyncAttempt = new Date();
      await this.update(order);
    }
  },

  async markFailed(id: string, error?: string): Promise<void> {
    const order = await this.get(id);
    if (order) {
      order.syncStatus = 'failed';
      order.syncAttempts += 1;
      order.lastSyncAttempt = new Date();
      await this.update(order);
    }
  },

  async create(orderData: Omit<OfflineOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'syncAttempts'>): Promise<OfflineOrder> {
    const order: OfflineOrder = {
      ...orderData,
      id: crypto.randomUUID(),
      orderNumber: `OFF-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
      syncAttempts: 0,
    };
    return this.add(order);
  },

  async clear(): Promise<void> {
    return clearStore(STORES.ORDERS);
  },
};

// ============================================
// Menu Items Operations
// ============================================

export const offlineMenuItems = {
  async add(item: OfflineMenuItem): Promise<OfflineMenuItem> {
    return addItem(STORES.MENU_ITEMS, item);
  },

  async update(item: OfflineMenuItem): Promise<OfflineMenuItem> {
    return updateItem(STORES.MENU_ITEMS, item);
  },

  async delete(id: string): Promise<void> {
    return deleteItem(STORES.MENU_ITEMS, id);
  },

  async get(id: string): Promise<OfflineMenuItem | null> {
    return getItem<OfflineMenuItem>(STORES.MENU_ITEMS, id);
  },

  async getAll(): Promise<OfflineMenuItem[]> {
    return getAllItems<OfflineMenuItem>(STORES.MENU_ITEMS);
  },

  async getByCategory(category: string): Promise<OfflineMenuItem[]> {
    return getItemsByIndex<OfflineMenuItem>(STORES.MENU_ITEMS, 'category', category);
  },

  async getAvailable(): Promise<OfflineMenuItem[]> {
    return getItemsByIndex<OfflineMenuItem>(STORES.MENU_ITEMS, 'available', true);
  },

  async bulkUpdate(items: OfflineMenuItem[]): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MENU_ITEMS, 'readwrite');
      const store = transaction.objectStore(STORES.MENU_ITEMS);

      items.forEach(item => {
        store.put(item);
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  },

  async clear(): Promise<void> {
    return clearStore(STORES.MENU_ITEMS);
  },
};

// ============================================
// Customers Operations
// ============================================

export const offlineCustomers = {
  async add(customer: OfflineCustomer): Promise<OfflineCustomer> {
    return addItem(STORES.CUSTOMERS, customer);
  },

  async update(customer: OfflineCustomer): Promise<OfflineCustomer> {
    return updateItem(STORES.CUSTOMERS, customer);
  },

  async delete(id: string): Promise<void> {
    return deleteItem(STORES.CUSTOMERS, id);
  },

  async get(id: string): Promise<OfflineCustomer | null> {
    return getItem<OfflineCustomer>(STORES.CUSTOMERS, id);
  },

  async getByPhone(phone: string): Promise<OfflineCustomer | null> {
    const results = await getItemsByIndex<OfflineCustomer>(STORES.CUSTOMERS, 'phone', phone);
    return results[0] || null;
  },

  async getAll(): Promise<OfflineCustomer[]> {
    return getAllItems<OfflineCustomer>(STORES.CUSTOMERS);
  },

  async clear(): Promise<void> {
    return clearStore(STORES.CUSTOMERS);
  },
};

// ============================================
// Sync Queue Operations
// ============================================

export const syncQueue = {
  async add(item: SyncQueueItem): Promise<SyncQueueItem> {
    return addItem(STORES.SYNC_QUEUE, item);
  },

  async update(item: SyncQueueItem): Promise<SyncQueueItem> {
    return updateItem(STORES.SYNC_QUEUE, item);
  },

  async delete(id: string): Promise<void> {
    return deleteItem(STORES.SYNC_QUEUE, id);
  },

  async get(id: string): Promise<SyncQueueItem | null> {
    return getItem<SyncQueueItem>(STORES.SYNC_QUEUE, id);
  },

  async getAll(): Promise<SyncQueueItem[]> {
    return getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);
  },

  async getByType(type: SyncQueueItem['type']): Promise<SyncQueueItem[]> {
    return getItemsByIndex<SyncQueueItem>(STORES.SYNC_QUEUE, 'type', type);
  },

  async create(
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
    data: Record<string, unknown>
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      type,
      action,
      data,
      createdAt: new Date(),
      attempts: 0,
    };
    return this.add(item);
  },

  async incrementAttempts(id: string): Promise<void> {
    const item = await this.get(id);
    if (item) {
      item.attempts += 1;
      item.lastAttempt = new Date();
      await this.update(item);
    }
  },

  async clear(): Promise<void> {
    return clearStore(STORES.SYNC_QUEUE);
  },
};

// ============================================
// Settings Operations
// ============================================

export const offlineSettings = {
  async set(key: string, value: unknown): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ key, value, updatedAt: new Date() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async get<T>(key: string): Promise<T | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  },

  async delete(key: string): Promise<void> {
    return deleteItem(STORES.SETTINGS, key);
  },
};

// ============================================
// Sync Status & Conflict Resolution
// ============================================

export async function getSyncStatus(): Promise<SyncStatus> {
  const pendingOrders = await offlineOrders.getPending();
  const failedOrders = await offlineOrders.getFailed();
  const pendingSync = await syncQueue.getAll();

  const pendingPayments = pendingSync.filter(s => s.type === 'payment');
  const pendingCustomers = pendingSync.filter(s => s.type === 'customer');

  const lastSync = await offlineSettings.get<Date>('lastSync');

  return {
    pendingOrders: pendingOrders.length + failedOrders.length,
    pendingCustomers: pendingCustomers.length,
    pendingPayments: pendingPayments.length,
    lastSync: lastSync ? new Date(lastSync) : null,
    isSyncing: false,
    errors: failedOrders.length > 0 ? ['Certaines commandes n\'ont pas pu être synchronisées'] : [],
  };
}

export async function updateLastSync(): Promise<void> {
  await offlineSettings.set('lastSync', new Date());
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'server' | 'local' | 'merge';

export interface ConflictRule {
  entity: string;
  field: string;
  resolution: ConflictResolution;
}

const DEFAULT_CONFLICT_RULES: ConflictRule[] = [
  { entity: 'order', field: 'status', resolution: 'server' },
  { entity: 'order', field: 'items', resolution: 'local' },
  { entity: 'menuItem', field: 'price', resolution: 'server' },
  { entity: 'menuItem', field: 'available', resolution: 'server' },
  { entity: 'customer', field: 'totalOrders', resolution: 'merge' },
  { entity: 'customer', field: 'totalSpent', resolution: 'merge' },
];

export function resolveConflict(
  entity: string,
  field: string,
  localValue: unknown,
  serverValue: unknown,
  rules: ConflictRule[] = DEFAULT_CONFLICT_RULES
): unknown {
  const rule = rules.find(r => r.entity === entity && r.field === field);
  
  if (!rule) {
    // Default to server value
    return serverValue;
  }

  switch (rule.resolution) {
    case 'server':
      return serverValue;
    case 'local':
      return localValue;
    case 'merge':
      // For numeric values, take the maximum
      if (typeof localValue === 'number' && typeof serverValue === 'number') {
        return Math.max(localValue, serverValue);
      }
      // For dates, take the most recent
      if (localValue instanceof Date && serverValue instanceof Date) {
        return localValue > serverValue ? localValue : serverValue;
      }
      // Default to server
      return serverValue;
    default:
      return serverValue;
  }
}

// ============================================
// Database Management
// ============================================

export async function clearAllData(): Promise<void> {
  await clearStore(STORES.ORDERS);
  await clearStore(STORES.MENU_ITEMS);
  await clearStore(STORES.CUSTOMERS);
  await clearStore(STORES.SYNC_QUEUE);
  await clearStore(STORES.SETTINGS);
}

export async function getDatabaseSize(): Promise<{
  orders: number;
  menuItems: number;
  customers: number;
  syncQueue: number;
}> {
  const orders = await offlineOrders.getAll();
  const menuItems = await offlineMenuItems.getAll();
  const customers = await offlineCustomers.getAll();
  const sync = await syncQueue.getAll();

  return {
    orders: orders.length,
    menuItems: menuItems.length,
    customers: customers.length,
    syncQueue: sync.length,
  };
}

const offlineDB = {
  orders: offlineOrders,
  menuItems: offlineMenuItems,
  customers: offlineCustomers,
  syncQueue,
  settings: offlineSettings,
  getSyncStatus,
  updateLastSync,
  clearAllData,
  getDatabaseSize,
};

export default offlineDB;
