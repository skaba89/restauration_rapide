// ============================================
// RESTAURANT OS - Complete Types
// ============================================

// Enums
export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ORG_MANAGER' | 'RESTAURANT_ADMIN' | 'RESTAURANT_MANAGER' | 'STAFF' | 'KITCHEN' | 'DRIVER' | 'CUSTOMER' | 'SUPPORT';
export type Plan = 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY' | 'OUT_OF_SERVICE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED' | 'EXPIRED' | 'CONVERTED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DRIVE_THRU';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
export type DeliveryStatus = 'PENDING' | 'SEARCHING_DRIVER' | 'DRIVER_ASSIGNED' | 'DRIVER_ARRIVED_PICKUP' | 'PICKED_UP' | 'DRIVER_ARRIVED_DROPOFF' | 'DELIVERED' | 'FAILED' | 'CANCELLED' | 'RETURNED';
export type PaymentMethod = 'CASH' | 'MOBILE_MONEY_ORANGE' | 'MOBILE_MONEY_MTN' | 'MOBILE_MONEY_WAVE' | 'MOBILE_MONEY_MPESA' | 'MOBILE_MONEY_MOOV' | 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'GIFT_CARD';
export type OtpType = 'LOGIN' | 'REGISTER' | 'VERIFY_PHONE' | 'VERIFY_EMAIL' | 'RESET_PASSWORD' | 'VERIFY_PAYMENT';

// User & Auth
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  language: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface OtpCode {
  id: string;
  phone?: string;
  email?: string;
  code: string;
  type: OtpType;
  attempts: number;
  expiresAt: Date;
}

// Organization
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  countryId: string;
  currencyId: string;
  plan: Plan;
  planExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  minOrderAmount: number;
  maxDeliveryRadius: number;
  defaultDeliveryFee: number;
  autoAcceptOrders: boolean;
  orderPrepTime: number;
  reservationEnabled: boolean;
  autoConfirmReservations: boolean;
  defaultTableTime: number;
  noShowFee: number;
  acceptsCash: boolean;
  acceptsMobileMoney: boolean;
  acceptsCard: boolean;
  deliveryEnabled: boolean;
  loyaltyEnabled: boolean;
  pointsPerAmount: number;
  pointValue: number;
}

export interface Brand {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  colors?: { primary: string; secondary: string; accent: string };
  isActive: boolean;
}

// Restaurant
export interface Restaurant {
  id: string;
  organizationId: string;
  brandId?: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  logo?: string;
  email?: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  district?: string;
  landmark?: string;
  postalCode?: string;
  countryId: string;
  latitude?: number;
  longitude?: number;
  restaurantType: 'restaurant' | 'cafe' | 'bar' | 'hotel' | 'dark_kitchen';
  cuisines?: string[];
  priceRange: number;
  indoorCapacity?: number;
  outdoorCapacity?: number;
  totalCapacity?: number;
  acceptsReservations: boolean;
  acceptsWalkins: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasTerrace: boolean;
  hasVipRoom: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  maxDeliveryRadius: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isOpen: boolean;
  isBusy: boolean;
  createdAt: Date;
  hours?: RestaurantHour[];
  tables?: Table[];
  diningRooms?: DiningRoom[];
}

export interface RestaurantHour {
  id: string;
  restaurantId: string;
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
  breakStart?: string;
  breakEnd?: string;
}

// Dining
export interface DiningRoom {
  id: string;
  restaurantId: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'terrace' | 'vip' | 'private';
  capacity: number;
  floorPlan?: string;
  isActive: boolean;
  tables?: Table[];
}

export interface Table {
  id: string;
  restaurantId: string;
  diningRoomId?: string;
  number: string;
  capacity: number;
  shape: 'round' | 'square' | 'rectangle';
  positionX?: number;
  positionY?: number;
  status: TableStatus;
  currentPartySize?: number;
  currentReservationId?: string;
  serverId?: string;
  isAccessible: boolean;
  isVip: boolean;
  isCombineable: boolean;
  isActive: boolean;
}

// Menu
export interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  availableDays?: number[];
  availableStart?: string;
  availableEnd?: string;
  menuType: 'main' | 'brunch' | 'happy_hour' | 'special' | 'catering';
  categories?: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  menuId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  costPrice?: number;
  calories?: number;
  prepTime?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  itemType: 'food' | 'drink' | 'dessert' | 'side' | 'addon';
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel: number;
  trackInventory: boolean;
  quantity: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
  variants?: MenuItemVariant[];
  options?: MenuItemOption[];
  allergens?: Allergen[];
}

export interface MenuItemVariant {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface MenuItemOption {
  id: string;
  menuItemId: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  maxSelect?: number;
  values: MenuItemOptionValue[];
}

export interface MenuItemOptionValue {
  id: string;
  optionId: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface Allergen {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

// Orders
export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: OrderType;
  source: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  tableId?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryDistrict?: string;
  deliveryLandmark?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryNotes?: string;
  deliveryFee: number;
  deliveryTime?: number;
  scheduledAt?: Date;
  asap: boolean;
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  serviceCharge: number;
  tip: number;
  total: number;
  currencyId: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  notes?: string;
  internalNotes?: string;
  serverId?: string;
  createdAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  items?: OrderItem[];
  payments?: Payment[];
  delivery?: Delivery;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId?: string;
  itemName: string;
  itemImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantId?: string;
  variantName?: string;
  options?: string;
  status: string;
  notes?: string;
}

export interface Cart {
  id: string;
  restaurantId: string;
  customerId?: string;
  sessionId?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  scheduledAt?: Date;
  asap: boolean;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  promoCode?: string;
  items: CartItem[];
  expiresAt?: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantId?: string;
  options?: string;
  notes?: string;
}

// Reservations
export interface Reservation {
  id: string;
  restaurantId: string;
  customerId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  date: Date;
  time: string;
  duration: number;
  tables?: ReservationTable[];
  status: ReservationStatus;
  source: string;
  occasion?: string;
  specialRequests?: string;
  dietaryNotes?: string;
  internalNotes?: string;
  depositAmount?: number;
  depositPaid: boolean;
  confirmedAt?: Date;
  reminderSentAt?: Date;
  checkedInAt?: Date;
  seatedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  noShowAt?: Date;
  createdAt: Date;
}

export interface ReservationTable {
  id: string;
  reservationId: string;
  tableId: string;
}

export interface WaitlistEntry {
  id: string;
  restaurantId: string;
  customerId?: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preferredArea?: string;
  specialRequests?: string;
  status: WaitlistStatus;
  priority: number;
  estimatedWait?: number;
  quotedWait?: number;
  notifiedAt?: Date;
  seatedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
}

// Delivery
export interface Delivery {
  id: string;
  orderId: string;
  organizationId: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress: string;
  dropoffLat?: number;
  dropoffLng?: number;
  dropoffLandmark?: string;
  driverId?: string;
  status: DeliveryStatus;
  deliveryFee: number;
  driverEarning: number;
  tip: number;
  estimatedTime?: number;
  actualTime?: number;
  distance?: number;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  proofType?: string;
  proofOtp?: string;
  proofPhotoUrl?: string;
  failureReason?: string;
  trackingEvents?: DeliveryTrackingEvent[];
}

export interface DeliveryTrackingEvent {
  id: string;
  deliveryId: string;
  event: string;
  lat?: number;
  lng?: number;
  notes?: string;
  createdAt: Date;
}

export interface DeliveryZone {
  id: string;
  restaurantId: string;
  name: string;
  districts?: string[];
  baseFee: number;
  perKmFee: number;
  minOrder: number;
  minTime: number;
  maxTime: number;
  isActive: boolean;
}

// Driver
export interface Driver {
  id: string;
  organizationId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatar?: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'scooter';
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  isVerified: boolean;
  isActive: boolean;
  isAvailable: boolean;
  status: 'online' | 'offline' | 'busy' | 'suspended';
  currentLat?: number;
  currentLng?: number;
  lastLocationAt?: Date;
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
  wallet?: DriverWallet;
  createdAt: Date;
}

export interface DriverWallet {
  id: string;
  driverId: string;
  balance: number;
  pending: number;
}

export interface DriverEarning {
  id: string;
  driverId: string;
  deliveryId?: string;
  type: 'delivery_fee' | 'tip' | 'bonus' | 'adjustment';
  amount: number;
  description?: string;
  createdAt: Date;
}

// Payments
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currencyId: string;
  method: PaymentMethod;
  provider?: string;
  status: PaymentStatus;
  phoneNumber?: string;
  providerRef?: string;
  transactionId?: string;
  cardLastFour?: string;
  cardBrand?: string;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
}

// Customer & CRM
export interface CustomerProfile {
  id: string;
  userId?: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: string;
  language: string;
  currency: string;
  addresses?: CustomerAddress[];
  dietaryPreferences?: string[];
  allergies?: string[];
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderAt?: Date;
  loyaltyPoints: number;
  loyaltyLevel: number;
  lifetimePoints: number;
  tags?: string[];
  isVip: boolean;
  notes?: string;
  createdAt: Date;
}

export interface CustomerAddress {
  label: string;
  address: string;
  city: string;
  district?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface CustomerFeedback {
  id: string;
  organizationId: string;
  restaurantId?: string;
  customerId?: string;
  orderId?: string;
  type: 'complaint' | 'compliment' | 'suggestion';
  category?: string;
  subject?: string;
  message: string;
  rating?: number;
  status: 'new' | 'in_progress' | 'resolved';
  response?: string;
  createdAt: Date;
}

// Loyalty
export interface LoyaltyTransaction {
  id: string;
  organizationId: string;
  customerId: string;
  points: number;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjust';
  description?: string;
  referenceType?: string;
  referenceId?: string;
  balanceAfter: number;
  expiresAt?: Date;
  createdAt: Date;
}

export interface LoyaltyReward {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  image?: string;
  pointsRequired: number;
  type: 'discount' | 'free_item' | 'cashback';
  value: number;
  productId?: string;
  isActive: boolean;
  usageCount: number;
}

// Promotion
export interface Promotion {
  id: string;
  organizationId: string;
  restaurantId?: string;
  name: string;
  code?: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_delivery' | 'bogo';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
}

export interface GiftCard {
  id: string;
  organizationId: string;
  code: string;
  initialBalance: number;
  balance: number;
  currencyId: string;
  purchaserId?: string;
  recipientEmail?: string;
  recipientName?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  expiresAt?: Date;
  createdAt: Date;
}

// Review
export interface Review {
  id: string;
  restaurantId: string;
  customerId?: string;
  orderId?: string;
  rating: number;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  valueRating?: number;
  title?: string;
  comment?: string;
  images?: string[];
  response?: string;
  respondedAt?: Date;
  isVerified: boolean;
  isPublished: boolean;
  createdAt: Date;
}

// Staff
export interface StaffProfile {
  id: string;
  userId?: string;
  organizationId: string;
  restaurantId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'waiter' | 'host' | 'bartender' | 'chef' | 'manager';
  permissions?: string[];
  isActive: boolean;
  ordersHandled: number;
  tablesServed: number;
  rating: number;
}

// Localization
export interface Country {
  id: string;
  code: string;
  name: string;
  dialCode: string;
  currencyId: string;
  defaultLanguage: string;
  timezone: string;
  taxIncluded: boolean;
  defaultTaxRate: number;
  mobileMoneyEnabled: boolean;
  isActive: boolean;
}

export interface City {
  id: string;
  countryId: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

// Analytics
export interface AnalyticsSnapshot {
  id: string;
  organizationId: string;
  restaurantId?: string;
  date: Date;
  orderCount: number;
  orderTotal: number;
  avgOrderValue: number;
  dineInCount: number;
  takeawayCount: number;
  deliveryCount: number;
  newCustomers: number;
  returningCustomers: number;
  reservationCount: number;
  noShowCount: number;
  avgDeliveryTime?: number;
  cashTotal: number;
  mobileMoneyTotal: number;
  cardTotal: number;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'promotion' | 'system' | 'reservation';
  data?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// WebSocket Events
export interface WSEvent {
  type: 'order_created' | 'order_updated' | 'delivery_assigned' | 'delivery_updated' | 'driver_location' | 'reservation_created' | 'table_updated' | 'notification';
  payload: unknown;
  organizationId?: string;
  restaurantId?: string;
  timestamp: Date;
}

// Feature Flags
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercent: number;
  countries?: string[];
  plans?: Plan[];
}
