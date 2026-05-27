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
  status: 'pending_payment' | 'pending' | 'approved' | 'rejected' | 'deleted';
  tier: 'standard' | 'featured' | 'premium';
  paypal_order_id?: string;
  paypal_subscription_id?: string;
  subscription_status?: 'active' | 'suspended' | 'cancelled' | 'expired';
  created_at: string;
  edit_token?: string;
  edit_token_expires_at?: string;
  
  // Rich details added for Gemini AI & Administrative editing
  detailed_overview?: string;
  key_features?: string[];
  key_features_descriptions?: string[];
  rating?: number;
  rating_count?: number;
  customer_review?: string;
  customer_review_author?: string;
  customer_review_2?: string;
  customer_review_2_author?: string;
  integration_guide_1_label?: string;
  integration_guide_1_url?: string;
  integration_guide_2_label?: string;
  integration_guide_2_url?: string;
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

export async function getMockItems(status?: 'pending_payment' | 'pending' | 'approved' | 'rejected' | 'deleted'): Promise<MockItem[]> {
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

export async function updateMockItemToken(id: string, token: string | null, expiresAt: string | null): Promise<MockItem | null> {
  const items = await readMockDb();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    if (token === null) {
      delete items[index].edit_token;
      delete items[index].edit_token_expires_at;
    } else {
      items[index].edit_token = token;
      items[index].edit_token_expires_at = expiresAt || undefined;
    }
    await writeMockDb(items);
    return items[index];
  }
  return null;
}

export async function updateMockItemDetails(
  id: string,
  title: string,
  url: string,
  description: string,
  category: string,
  imageUrl: string
): Promise<MockItem | null> {
  const items = await readMockDb();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index].title = title;
    items[index].url = url;
    items[index].description = description;
    items[index].category = category;
    items[index].image_url = imageUrl;
    await writeMockDb(items);
    return items[index];
  }
  return null;
}

export async function updateMockItemSubscriptionStatus(id: string, subscriptionStatus: MockItem['subscription_status']): Promise<MockItem | null> {
  const items = await readMockDb();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index].subscription_status = subscriptionStatus;
    if (subscriptionStatus === 'cancelled' || subscriptionStatus === 'expired') {
      items[index].tier = 'standard';
    }
    await writeMockDb(items);
    return items[index];
  }
  return null;
}

export async function updateMockItemSubscription(id: string, subscriptionId: string, subscriptionStatus: MockItem['subscription_status']): Promise<MockItem | null> {
  const items = await readMockDb();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index].paypal_subscription_id = subscriptionId;
    items[index].subscription_status = subscriptionStatus;
    items[index].status = 'pending';
    items[index].tier = 'featured';
    await writeMockDb(items);
    return items[index];
  }
  return null;
}

export async function updateMockItemFullDetails(id: string, updates: Partial<MockItem>): Promise<MockItem | null> {
  const items = await readMockDb();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = {
      ...items[index],
      ...updates
    };
    await writeMockDb(items);
    return items[index];
  }
  return null;
}

export interface MockReview {
  id: string;
  item_id: string;
  author: string;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

let memoryReviewsDb: MockReview[] = [];

const getReviewsFilePath = () => {
  return path.join(process.cwd(), 'src', 'lib', 'mock_reviews_db.json');
};

const initializeReviewsFileDb = () => {
  try {
    const filePath = getReviewsFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Fs init bypass (likely serverless build environment):', err);
  }
};

export async function readMockReviewsDb(): Promise<MockReview[]> {
  try {
    initializeReviewsFileDb();
    const filePath = getReviewsFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileData = JSON.parse(content) as MockReview[];
      memoryReviewsDb = fileData;
      return fileData;
    }
  } catch (err) {
    console.warn('Failed to read local mock reviews DB file:', err);
  }
  return memoryReviewsDb;
}

export async function writeMockReviewsDb(data: MockReview[]): Promise<boolean> {
  memoryReviewsDb = data;
  try {
    initializeReviewsFileDb();
    const filePath = getReviewsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write mock reviews DB:', err);
    return false;
  }
}

export async function getMockReviews(status?: 'pending' | 'approved' | 'rejected', itemId?: string): Promise<MockReview[]> {
  const reviews = await readMockReviewsDb();
  let filtered = reviews;
  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }
  if (itemId) {
    filtered = filtered.filter(r => r.item_id === itemId);
  }
  return filtered;
}

export async function insertMockReview(review: Omit<MockReview, 'id' | 'created_at'>): Promise<MockReview> {
  const reviews = await readMockReviewsDb();
  const newReview: MockReview = {
    ...review,
    id: "mock_review_" + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };
  reviews.push(newReview);
  await writeMockReviewsDb(reviews);
  return newReview;
}

export async function updateMockReviewStatus(id: string, status: MockReview['status']): Promise<MockReview | null> {
  const reviews = await readMockReviewsDb();
  const index = reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviews[index].status = status;
    await writeMockReviewsDb(reviews);
    return reviews[index];
  }
  return null;
}

export async function deleteMockReview(id: string): Promise<boolean> {
  const reviews = await readMockReviewsDb();
  const index = reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviews.splice(index, 1);
    await writeMockReviewsDb(reviews);
    return true;
  }
  return false;
}
