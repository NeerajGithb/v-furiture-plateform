/**
 * Model Registry
 * Import all models here to ensure they're registered with Mongoose
 * This file should be imported early in the application lifecycle
 */

// Import all models to register them with Mongoose
import Admin from './Admin';
import Cart from './Cart';
import Category from './Category';
import CategoryImage from './CategoryImage';
import ChatSession from './ChatSession';
import Counter from './Counter';
import Coupon from './Coupon';
import CouponUsage from './CouponUsage';
import Inspiration from './Inspiration';
import Notification from './Notification';
import Order from './Order';
import Payment from './Payment';
import Product from './Product';
import Review from './Review';
import SearchAnalytics from './SearchAnalytics';
import Seller from './Seller';
import SubCategory from './SubCategory';
import User from './User';
import Wishlist from './Wishlist';

// Export all models for convenience
export {
  Admin,
  Cart,
  Category,
  CategoryImage,
  ChatSession,
  Counter,
  Coupon,
  CouponUsage,
  Inspiration,
  Notification,
  Order,
  Payment,
  Product,
  Review,
  SearchAnalytics,
  Seller,
  SubCategory,
  User,
  Wishlist,
};

// Default export for easy importing
export default {
  Admin,
  Cart,
  Category,
  CategoryImage,
  ChatSession,
  Counter,
  Coupon,
  CouponUsage,
  Inspiration,
  Notification,
  Order,
  Payment,
  Product,
  Review,
  SearchAnalytics,
  Seller,
  SubCategory,
  User,
  Wishlist,
};
