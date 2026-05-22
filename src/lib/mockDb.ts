import fs from 'fs';
import path from 'path';

export interface MockItem {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: 'pending_payment' | 'pending' | 'approved' | 'rejected';
  paypal_order_id?: string;
  created_at: string;
}

// In-memory cache for serverless environments where filesystem is read-only
let memoryDb: MockItem[] = [];

const getFilePath = () => {
  return path.join(process.cwd(), 'src', 'lib', 'mock_db.json');
};

// Initialize the local file database if it doesn't exist
const initializeFileDb = () => {
  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      // Create empty array
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Fs init bypass (likely serverless build environment):', err);
  }
};

export async function readMockDb(): Promise<MockItem[]> {
  try {
    initializeFileDb();
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileData = JSON.parse(content) as MockItem[];
      // Sync memory database with file data
      memoryDb = fileData;
      return fileData;
    }
  } catch (err) {
    console.warn('Failed to read local mock DB file, falling back to memory database:', err);
  }
  return memoryDb;
}

export async function writeMockDb(data: MockItem[]): Promise<boolean> {
  // Update memory database
  memoryDb = data;
  try {
    initializeFileDb();
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write mock database to file:', err);
    return false;
  }
}

export async function getMockItems(status?: 'pending_payment' | 'pending' | 'approved' | 'rejected'): Promise<MockItem[]> {
  const items = await readMockDb();
  if (status) {
    return items.filter(item => item.status === status);
  }
  return items;
}

export async function getMockItemById(id: string): Promise<MockItem | undefined> {
  const items = await readMockDb();
  return items.find(item => item.id === id);
}

export async function insertMockItem(item: Omit<MockItem, 'id' | 'created_at'>): Promise<MockItem> {
  const items = await readMockDb();
  const newItem: MockItem = {
    ...item,
    id: `mock_uuid_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  };
  items.push(newItem);
  await writeMockDb(items);
  return newItem;
}

export async function updateMockItemStatus(id: string, status: MockItem['status'], paypalOrderId?: string): Promise<MockItem | null> {
  const items = await readMockDb();
  const index = items.findIndex(item => item.id === id || (paypalOrderId && item.paypal_order_id === paypalOrderId));
  if (index !== -1) {
    items[index].status = status;
    if (paypalOrderId) {
      items[index].paypal_order_id = paypalOrderId;
    }
    await writeMockDb(items);
    return items[index];
  }
  return null;
}
