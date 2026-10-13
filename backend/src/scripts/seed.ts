import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';
import { Category } from '../models/Category.js';
import { FoodItem } from '../models/FoodItem.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seeding] Clearing old records for idempotent seed...');

    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Category.deleteMany({}),
      FoodItem.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      LoyaltyTransaction.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('[Seeding] Creating verified demo accounts...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD || 'Admin123!', salt);
    const customerPass = await bcrypt.hash(process.env.DEMO_CUSTOMER_PASSWORD || 'Customer123!', salt);
    const restaurantPass = await bcrypt.hash(process.env.DEMO_RESTAURANT_PASSWORD || 'Restaurant123!', salt);
    const deliveryPass = await bcrypt.hash(process.env.DEMO_DELIVERY_PASSWORD || 'Delivery123!', salt);

    const admin = await User.create({
      name: 'Elena Rostova (Admin)',
      email: 'admin@foodora.demo',
      passwordHash: adminPass,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const customer = await User.create({
      name: 'Alex Johnson',
      email: 'customer@foodora.demo',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      phone: '+91 98100 12345',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      loyaltyPoints: 450
    });

    const owner1 = await User.create({
      name: 'Chef Marco Bellini',
      email: 'restaurant@foodora.demo',
      passwordHash: restaurantPass,
      role: 'RESTAURANT',
      phone: '+91 98200 54321',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const owner2 = await User.create({
      name: 'Kenji Takahashi',
      email: 'kenji@foodora.demo',
      passwordHash: restaurantPass,
      role: 'RESTAURANT',
      phone: '+91 98300 67890',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const owner3 = await User.create({
      name: 'Master Jiro Ono',
      email: 'jiro@foodora.demo',
      passwordHash: restaurantPass,
      role: 'RESTAURANT',
      phone: '+91 98400 78901',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const owner4 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@foodora.demo',
      passwordHash: restaurantPass,
      role: 'RESTAURANT',
      phone: '+91 98500 89012',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const owner5 = await User.create({
      name: 'Carlos Mendez',
      email: 'carlos@foodora.demo',
      passwordHash: restaurantPass,
      role: 'RESTAURANT',
      phone: '+91 98600 90123',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const owner6 = await User.create({
      name: 'Chloe Dupont',
      email: 'chloe@foodora.demo',
      passwordHash: restaurantPass,
      role: 'RESTAURANT',
      phone: '+91 98700 01234',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    const deliveryPartner = await User.create({
      name: 'Marcus Hayes (Courier)',
      email: 'delivery@foodora.demo',
      passwordHash: deliveryPass,
      role: 'DELIVERY',
      phone: '+91 98800 12345',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    console.log('[Seeding] Creating food categories...');
    const catBurgers = await Category.create({ name: 'Artisan Burgers', slug: 'burgers', iconName: 'Beef', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', sortOrder: 1 });
    const catPizza = await Category.create({ name: 'Neapolitan Pizza', slug: 'pizza', iconName: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', sortOrder: 2 });
    const catSushi = await Category.create({ name: 'Japanese Sushi & Omakase', slug: 'sushi', iconName: 'Fish', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600', sortOrder: 3 });
    const catIndian = await Category.create({ name: 'Indian Curries & Tandoor', slug: 'indian', iconName: 'Flame', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600', sortOrder: 4 });
    const catMexican = await Category.create({ name: 'Mexican Tacos & Cantina', slug: 'mexican', iconName: 'Utensils', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600', sortOrder: 5 });
    const catDesserts = await Category.create({ name: 'Desserts & French Bakes', slug: 'desserts', iconName: 'Cake', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', sortOrder: 6 });

    console.log('[Seeding] Creating Indian-priced restaurants...');

    // 1. Bella Napoli (Italian / Pizza)
    const r1 = await Restaurant.create({
      ownerId: owner1._id,
      name: 'Bella Napoli Woodfired',
      slug: 'bella-napoli',
      description: 'Authentic sourdough Neapolitan pizzas baked in a 900° volcanic stone oven with imported Campania mozzarella.',
      cuisineTypes: ['Italian', 'Pizza', 'Pasta'],
      bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=200',
      address: { street: 'Indiranagar 100ft Road', city: 'Bengaluru', postalCode: '560038', state: 'Karnataka' },
      deliverySettings: { minOrderAmount: 299, baseDeliveryFee: 49, estimatedDeliveryTimeMin: 25, freeDeliveryThreshold: 599 },
      approvalStatus: 'APPROVED',
      isOpen: true,
      ratingSummary: { averageRating: 4.9, totalReviews: 128 }
    });

    // 2. Zenith Craft Burgers
    const r2 = await Restaurant.create({
      ownerId: owner2._id,
      name: 'Zenith Craft Burgers & Shakes',
      slug: 'zenith-craft-burgers',
      description: 'Prime smashed patties, golden brioche buns, and house-churned thick milkshakes.',
      cuisineTypes: ['American', 'Burgers', 'Shakes'],
      bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200',
      address: { street: 'Koramangala 5th Block', city: 'Bengaluru', postalCode: '560095', state: 'Karnataka' },
      deliverySettings: { minOrderAmount: 249, baseDeliveryFee: 39, estimatedDeliveryTimeMin: 20, freeDeliveryThreshold: 499 },
      approvalStatus: 'APPROVED',
      isOpen: true,
      ratingSummary: { averageRating: 4.8, totalReviews: 94 }
    });

    // 3. Kintsugi Sushi & Raw Bar
    const r3 = await Restaurant.create({
      ownerId: owner3._id,
      name: 'Kintsugi Sushi & Raw Bar',
      slug: 'kintsugi-sushi',
      description: 'Wild-caught salmon, bluefin tuna, sea urchin, and freshly torched nigiri bento boxes.',
      cuisineTypes: ['Japanese', 'Sushi', 'Asian'],
      bannerUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=200',
      address: { street: 'Lavelle Road', city: 'Bengaluru', postalCode: '560001', state: 'Karnataka' },
      deliverySettings: { minOrderAmount: 499, baseDeliveryFee: 69, estimatedDeliveryTimeMin: 30, freeDeliveryThreshold: 999 },
      approvalStatus: 'APPROVED',
      isOpen: true,
      ratingSummary: { averageRating: 4.95, totalReviews: 172 }
    });

    // 4. Saffron & Spice Royal Kitchen
    const r4 = await Restaurant.create({
      ownerId: owner4._id,
      name: 'Saffron & Spice Royal Kitchen',
      slug: 'saffron-and-spice',
      description: 'Velvety slow-simmered butter chicken, aromatic Lucknowi dum biryani, and charcoal clay tandoor naans.',
      cuisineTypes: ['Indian', 'Curry', 'Halal'],
      bannerUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200',
      address: { street: 'Connaught Place', city: 'New Delhi', postalCode: '110001', state: 'Delhi' },
      deliverySettings: { minOrderAmount: 299, baseDeliveryFee: 40, estimatedDeliveryTimeMin: 30, freeDeliveryThreshold: 599 },
      approvalStatus: 'APPROVED',
      isOpen: true,
      ratingSummary: { averageRating: 4.85, totalReviews: 110 }
    });

    // 5. La Taquería del Fuego
    const r5 = await Restaurant.create({
      ownerId: owner5._id,
      name: 'La Taquería del Fuego',
      slug: 'taqueria-del-fuego',
      description: 'Crispy slow-braised birria tacos with rich spiced consommé, charred al pastor, and fresh guacamole.',
      cuisineTypes: ['Mexican', 'Tacos', 'Latin'],
      bannerUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200',
      address: { street: 'Bandra West, Hill Road', city: 'Mumbai', postalCode: '400050', state: 'Maharashtra' },
      deliverySettings: { minOrderAmount: 249, baseDeliveryFee: 35, estimatedDeliveryTimeMin: 22, freeDeliveryThreshold: 499 },
      approvalStatus: 'APPROVED',
      isOpen: true,
      ratingSummary: { averageRating: 4.75, totalReviews: 88 }
    });

    // 6. Atelier Pâtisserie & Café
    const r6 = await Restaurant.create({
      ownerId: owner6._id,
      name: 'Atelier Pâtisserie & Café',
      slug: 'atelier-patisserie',
      description: 'Handmade French croissants, caramelized mille-feuille, Belgian chocolate lava cakes, and specialty pistachio lattes.',
      cuisineTypes: ['Desserts', 'Bakery', 'Coffee'],
      bannerUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
      address: { street: 'Jubilee Hills, Road No. 36', city: 'Hyderabad', postalCode: '500033', state: 'Telangana' },
      deliverySettings: { minOrderAmount: 199, baseDeliveryFee: 30, estimatedDeliveryTimeMin: 18, freeDeliveryThreshold: 399 },
      approvalStatus: 'APPROVED',
      isOpen: true,
      ratingSummary: { averageRating: 4.9, totalReviews: 145 }
    });

    console.log('[Seeding] Creating Indian Rupee (₹) food items and customizations...');

    // --- Dishes for Bella Napoli (R1) ---
    const pizzaItem1 = await FoodItem.create({
      restaurantId: r1._id,
      categoryId: catPizza._id,
      name: 'Burrata & Truffle Margherita',
      description: 'San Marzano DOP sauce, creamy buffalo burrata, fresh Italian basil, white truffle drizzle.',
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800',
      basePrice: 489,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 18,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Crust Preference',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Neapolitan Classic (Charred Air Crust)', priceDelta: 0 },
            { name: 'Cheese Burst Sourdough Crust', priceDelta: 79 },
            { name: 'Gluten-Free Thin Crust', priceDelta: 69 }
          ]
        },
        {
          groupName: 'Extra Luxuries',
          minSelect: 0,
          maxSelect: 3,
          options: [
            { name: 'Extra Truffle Burrata Ball', priceDelta: 120 },
            { name: 'Spicy Hot Honey Infusion', priceDelta: 45 },
            { name: 'Aged Smoked Scamorza', priceDelta: 85 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r1._id,
      categoryId: catPizza._id,
      name: 'Diavola Piccante Pizza',
      description: 'Fior di latte cheese, spicy Calabrian soppressata, paprika oil, and grilled bell peppers.',
      imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
      basePrice: 449,
      dietaryLabels: ['Spicy'],
      preparationTimeMin: 15,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: [
        {
          groupName: 'Spice Level',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Mild Kick', priceDelta: 0 },
            { name: 'Authentic Fiery Calabrian', priceDelta: 0 },
            { name: 'Bhut Jolokia Super Spicy', priceDelta: 30 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r1._id,
      categoryId: catPizza._id,
      name: 'Truffle Tagliolini al Parmigiano',
      description: 'Handmade egg ribbon pasta tossed in 36-month aged Reggiano wheel with shaved black truffles.',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=800',
      basePrice: 549,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 16,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Pasta Add-ons',
          minSelect: 0,
          maxSelect: 2,
          options: [
            { name: 'Crispy Garlic Mushroom Mix', priceDelta: 60 },
            { name: 'Extra Shaved Black Truffle', priceDelta: 150 }
          ]
        }
      ]
    });

    // --- Dishes for Zenith Craft Burgers (R2) ---
    const burgerItem1 = await FoodItem.create({
      restaurantId: r2._id,
      categoryId: catBurgers._id,
      name: 'The Truffle Smash Double',
      description: 'Two smashed patties, black truffle aioli, aged smoked cheddar, and caramelized shallots on brioche.',
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
      basePrice: 389,
      dietaryLabels: [],
      preparationTimeMin: 12,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Bun & Patty Choice',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Toasted Milk Brioche Bun', priceDelta: 0 },
            { name: 'Whole Wheat Sesame Bun', priceDelta: 20 }
          ]
        },
        {
          groupName: 'Add-Ons',
          minSelect: 0,
          maxSelect: 2,
          options: [
            { name: 'Double Smoked Cheddar Cheese', priceDelta: 50 },
            { name: 'Crispy Fried Farm Egg', priceDelta: 35 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r2._id,
      categoryId: catBurgers._id,
      name: 'Crispy Nashville Hot Chicken Burger',
      description: 'Buttermilk soaked fried chicken thigh, cayenne dip, bread and butter pickles, brioche.',
      imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800',
      basePrice: 349,
      dietaryLabels: ['Spicy'],
      preparationTimeMin: 14,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Heat Intensity',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Southern Mild', priceDelta: 0 },
            { name: 'Nashville Hot', priceDelta: 0 },
            { name: 'Inferno Chili Glaze', priceDelta: 25 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r2._id,
      categoryId: catBurgers._id,
      name: 'Smoked Gouda Truffle Fries',
      description: 'Hand-cut crispy potato fries, white truffle oil, melted Dutch smoked gouda, parsley.',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800',
      basePrice: 189,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 10,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: []
    });

    // --- Dishes for Kintsugi Sushi & Raw Bar (R3) ---
    await FoodItem.create({
      restaurantId: r3._id,
      categoryId: catSushi._id,
      name: 'Omakase Nigiri Selection (10 pcs)',
      description: 'Chef daily curation including Otoro, Chutoro, King Salmon, Hokkaido Scallop, and Uni.',
      imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800',
      basePrice: 999,
      dietaryLabels: [],
      preparationTimeMin: 20,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Wasabi Preference',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Traditional Shizuoka Fresh Wasabi', priceDelta: 0 },
            { name: 'No Wasabi (Served On Side)', priceDelta: 0 }
          ]
        },
        {
          groupName: 'Luxury Upgrade',
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Torched Wagyu Nigiri with Caviar (2 pcs)', priceDelta: 299 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r3._id,
      categoryId: catSushi._id,
      name: 'Dragon Flame Tempura Roll (8 pcs)',
      description: 'Crispy tempura prawn, avocado, cucumber topped with torched freshwater eel, tobiko and sweet unagi glaze.',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      basePrice: 529,
      dietaryLabels: [],
      preparationTimeMin: 15,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: []
    });

    await FoodItem.create({
      restaurantId: r3._id,
      categoryId: catSushi._id,
      name: 'Spicy Bluefin Tuna Tartare',
      description: 'Diced sashimi tuna, scallions, sesame oil, chili crunch, served with crispy lotus root chips.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      basePrice: 429,
      dietaryLabels: ['Spicy'],
      preparationTimeMin: 12,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: []
    });

    // --- Dishes for Saffron & Spice Royal Kitchen (R4) ---
    await FoodItem.create({
      restaurantId: r4._id,
      categoryId: catIndian._id,
      name: 'Royal Butter Chicken (Murgh Makhani)',
      description: 'Clay-oven charred tandoori chicken simmered in a velvety tomato, cashew, and fenugreek reduction.',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
      basePrice: 389,
      dietaryLabels: [],
      preparationTimeMin: 18,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Spice Level',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Mild & Creamy', priceDelta: 0 },
            { name: 'Medium Desi Heat', priceDelta: 0 },
            { name: 'Extra Spicy Fire', priceDelta: 0 }
          ]
        },
        {
          groupName: 'Bread / Rice Pairing',
          minSelect: 0,
          maxSelect: 2,
          options: [
            { name: 'Garlic Butter Naan', priceDelta: 65 },
            { name: 'Aged Basmati Jeera Rice', priceDelta: 85 },
            { name: 'Cheese Chilly Naan', priceDelta: 95 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r4._id,
      categoryId: catIndian._id,
      name: 'Awadhi Mutton Dum Biryani',
      description: 'Tender baby lamb layered with saffron long-grain basmati, mint, and fried onions, slow-cooked sealed in handi.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
      basePrice: 449,
      dietaryLabels: [],
      preparationTimeMin: 22,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Accompaniment',
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Boondi Mint Raita', priceDelta: 40 },
            { name: 'Spicy Mirchi Ka Salan', priceDelta: 50 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r4._id,
      categoryId: catIndian._id,
      name: 'Paneer Tikka Angara',
      description: 'Creamy malai paneer cubes marinated in crushed Kashmiri chilies and hung curd, roasted with capsicum & onion.',
      imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
      basePrice: 319,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 15,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: []
    });

    // --- Dishes for La Taquería del Fuego (R5) ---
    await FoodItem.create({
      restaurantId: r5._id,
      categoryId: catMexican._id,
      name: 'Crispy Birria Quesatacos (Trio)',
      description: 'Slow-braised spiced meat folded in corn tortillas with melted Oaxaca cheese, cilantro, onions, and rich consommé dip.',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
      basePrice: 369,
      dietaryLabels: [],
      preparationTimeMin: 14,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Salsa Heat',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Salsa Verde (Tomatillo Mild)', priceDelta: 0 },
            { name: 'Salsa Roja Habanero (Fiery)', priceDelta: 0 }
          ]
        },
        {
          groupName: 'Sides',
          minSelect: 0,
          maxSelect: 2,
          options: [
            { name: 'Spiced Corn Nachos with Cotija', priceDelta: 89 },
            { name: 'Fresh Hass Avocado Guacamole', priceDelta: 110 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r5._id,
      categoryId: catMexican._id,
      name: 'Al Pastor Burrito Supremo',
      description: 'Marinated roasted filling, grilled pineapple, Mexican salsa rice, refried pinto beans, guacamole in warm tortilla.',
      imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
      basePrice: 329,
      dietaryLabels: [],
      preparationTimeMin: 12,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: []
    });

    // --- Dishes for Atelier Pâtisserie & Café (R6) ---
    await FoodItem.create({
      restaurantId: r6._id,
      categoryId: catDesserts._id,
      name: 'Warm Belgian Dark Chocolate Lava Cake',
      description: 'Molten Valrhona 72% chocolate center, served with a scoop of Madagascan bourbon vanilla bean gelato.',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
      basePrice: 249,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 10,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: [
        {
          groupName: 'Gelato Choice',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Madagascar Vanilla Bean', priceDelta: 0 },
            { name: 'Pistachio Crunch', priceDelta: 35 },
            { name: 'Salted Caramel Fleur de Sel', priceDelta: 25 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r6._id,
      categoryId: catDesserts._id,
      name: 'Artisanal French Macaron Box (6 pcs)',
      description: 'Pistachio, Salted Caramel, Rose Lychee, Dark Chocolate, Lemon Curd, and Espresso.',
      imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800',
      basePrice: 349,
      dietaryLabels: ['Vegetarian', 'Gluten-Free'],
      preparationTimeMin: 5,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: []
    });

    await FoodItem.create({
      restaurantId: r6._id,
      categoryId: catDesserts._id,
      name: 'Caramelized Vanilla Mille-Feuille',
      description: 'Layers of crispy caramelized puff pastry filled with Tahitian vanilla bean mousseline cream.',
      imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800',
      basePrice: 289,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 8,
      isAvailable: true,
      isFeatured: true,
      customizationGroups: []
    });

    await FoodItem.create({
      restaurantId: r6._id,
      categoryId: catDesserts._id,
      name: 'Butter Croissant with Almond Frangipane',
      description: 'Slow-fermented French Normandy butter croissant filled with roasted almond frangipane and toasted flakes.',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
      basePrice: 199,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 6,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: [
        {
          groupName: 'Warmth Preference',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Warm & Crispy', priceDelta: 0 },
            { name: 'Room Temperature', priceDelta: 0 }
          ]
        }
      ]
    });

    await FoodItem.create({
      restaurantId: r6._id,
      categoryId: catDesserts._id,
      name: 'Signature Bronte Pistachio Iced Latte',
      description: 'Double espresso pulled over oat milk with Sicilian pistachio paste and cold foam.',
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800',
      basePrice: 229,
      dietaryLabels: ['Vegetarian'],
      preparationTimeMin: 5,
      isAvailable: true,
      isFeatured: false,
      customizationGroups: [
        {
          groupName: 'Milk Choice',
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Barista Oat Milk', priceDelta: 0 },
            { name: 'Almond Milk', priceDelta: 20 },
            { name: 'Full Cream Milk', priceDelta: 0 }
          ]
        }
      ]
    });

    console.log('[Seeding] Creating promotional coupons in Indian Rupees...');
    await Coupon.create([
      {
        code: 'WELCOME100',
        discountType: 'FIXED',
        discountValue: 100,
        minOrderAmount: 399,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        active: true
      },
      {
        code: 'FOODORA20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 299,
        maxDiscount: 150,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        active: true
      }
    ]);

    console.log('[Seeding] Creating sample historical and active orders...');
    const order1 = await Order.create({
      orderNumber: 'FD-2026-00101-9481',
      customerId: customer._id,
      restaurantId: r1._id,
      deliveryPartnerId: deliveryPartner._id,
      items: [
        {
          foodItemId: pizzaItem1._id as any,
          name: pizzaItem1.name,
          price: 489,
          quantity: 1,
          selectedOptions: [{ groupName: 'Crust Preference', optionName: 'Neapolitan Classic', priceDelta: 0 }],
          itemTotal: 489
        }
      ],
      deliveryAddress: {
        label: 'Home',
        recipientName: customer.name,
        phone: customer.phone,
        street: '450 Brigade Road, Flat 3B',
        city: 'Bengaluru',
        postalCode: '560025',
        deliveryInstructions: 'Ring bell 3B or leave at gate security.'
      },
      priceBreakdown: {
        subtotal: 489,
        discount: 100,
        deliveryFee: 49,
        tax: 22,
        serviceFee: 19,
        total: 479
      },
      couponCode: 'WELCOME100',
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 3600000), note: 'Order placed' },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 3300000), note: 'Restaurant confirmed' },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 3000000), note: 'Food in oven' },
        { status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - 2400000), note: 'Order ready' },
        { status: 'PICKED_UP', timestamp: new Date(Date.now() - 1800000), note: 'Courier picked up' },
        { status: 'DELIVERED', timestamp: new Date(Date.now() - 600000), note: 'Delivered to door' }
      ],
      deliveryVerificationCode: '8214',
      estimatedDeliveryAt: new Date(Date.now() - 1200000),
      placedAt: new Date(Date.now() - 3600000)
    });

    await Review.create({
      orderId: order1._id,
      customerId: customer._id,
      restaurantId: r1._id,
      rating: 5,
      comment: 'Super fast delivery, burrata was fresh and sourdough crust was incredible!'
    });

    // Active order awaiting pickup at Zenith
    await Order.create({
      orderNumber: 'FD-2026-00102-3810',
      customerId: customer._id,
      restaurantId: r2._id,
      deliveryPartnerId: deliveryPartner._id,
      items: [
        {
          foodItemId: burgerItem1._id as any,
          name: burgerItem1.name,
          price: 389,
          quantity: 2,
          selectedOptions: [{ groupName: 'Bun & Patty Choice', optionName: 'Toasted Milk Brioche Bun', priceDelta: 0 }],
          itemTotal: 778
        }
      ],
      deliveryAddress: {
        label: 'Office',
        recipientName: customer.name,
        phone: customer.phone,
        street: 'Embassy Golf Links, Tower D',
        city: 'Bengaluru',
        postalCode: '560071',
        deliveryInstructions: 'Call upon arrival.'
      },
      priceBreakdown: {
        subtotal: 778,
        discount: 0,
        deliveryFee: 39,
        tax: 38,
        serviceFee: 19,
        total: 874
      },
      paymentMethod: 'ONLINE_CARD',
      paymentStatus: 'PAID',
      orderStatus: 'READY_FOR_PICKUP',
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 900000), note: 'Order placed' },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 600000), note: 'Grilling patties' },
        { status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - 120000), note: 'Boxed and ready for pickup' }
      ],
      deliveryVerificationCode: '4519',
      estimatedDeliveryAt: new Date(Date.now() + 15 * 60000),
      placedAt: new Date(Date.now() - 900000)
    });

    console.log('[Seeding] Finished successfully with Indian Rupee (₹) prices!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeding Error]', error);
    process.exit(1);
  }
};

seedDatabase();
