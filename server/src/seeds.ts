export interface SeedRestaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  cuisine_type: string;
  rating: number;
  is_active: number;
  delivery_time: string;
  min_order: number;
  offer: string;
  gradient: string;
  emoji: string;
}

export interface SeedMenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: number;
  emoji: string;
  is_veg: boolean;
  is_bestseller: boolean;
}

export const seedRestaurants: SeedRestaurant[] = [
  { id: 1, name: "Spice Garden", description: "Authentic North Indian flavors crafted with hand-ground spices and traditional recipes.", address: "12 MG Road", city: "Mumbai", state: "MH", zip: "400001", phone: "+91 98765 43210", email: "spice@example.com", cuisine_type: "Indian", rating: 4.8, is_active: 1, delivery_time: "25-35", min_order: 149, offer: "60% OFF up to ₹120", gradient: "from-orange-600 to-red-700", emoji: "🍛" },
  { id: 2, name: "Pizza Plaza", description: "Wood-fired Neapolitan pizzas with authentic Italian ingredients and artisan dough.", address: "45 Hill Road", city: "Mumbai", state: "MH", zip: "400050", phone: "+91 98765 43211", email: "pizza@example.com", cuisine_type: "Italian", rating: 4.6, is_active: 1, delivery_time: "30-40", min_order: 199, offer: "Buy 1 Get 1 Free", gradient: "from-red-700 to-rose-800", emoji: "🍕" },
  { id: 3, name: "Tokyo Bites", description: "Authentic Japanese cuisine: fresh sushi, ramen, and traditional bento boxes.", address: "78 Linking Road", city: "Mumbai", state: "MH", zip: "400054", phone: "+91 98765 43212", email: "tokyo@example.com", cuisine_type: "Japanese", rating: 4.9, is_active: 1, delivery_time: "35-45", min_order: 299, offer: "⭐ Top Rated", gradient: "from-violet-700 to-purple-900", emoji: "🍣" },
  { id: 4, name: "Burger Hub", description: "Juicy smashed patties, craft sauces, and thick-cut fries. Comfort food elevated.", address: "23 Carter Road", city: "Mumbai", state: "MH", zip: "400050", phone: "+91 98765 43213", email: "burger@example.com", cuisine_type: "American", rating: 4.5, is_active: 1, delivery_time: "20-30", min_order: 129, offer: "Free fries on ₹300+", gradient: "from-amber-600 to-orange-700", emoji: "🍔" },
  { id: 5, name: "Green Bowl", description: "Wholesome salads, grain bowls, and wraps packed with nutrition and bold flavors.", address: "56 Bandstand", city: "Mumbai", state: "MH", zip: "400050", phone: "+91 98765 43214", email: "green@example.com", cuisine_type: "Healthy", rating: 4.7, is_active: 1, delivery_time: "25-35", min_order: 179, offer: "10% OFF on first order", gradient: "from-green-700 to-emerald-900", emoji: "🥗" },
  { id: 6, name: "Noodle House", description: "Pan-Asian noodles, dumplings, and dim sum made with secret family recipes.", address: "34 SV Road", city: "Mumbai", state: "MH", zip: "400064", phone: "+91 98765 43215", email: "noodle@example.com", cuisine_type: "Chinese", rating: 4.4, is_active: 1, delivery_time: "30-40", min_order: 159, offer: "2 dumplings free on ₹250+", gradient: "from-pink-700 to-red-900", emoji: "🍜" },
];

export const seedMenuItems: SeedMenuItem[] = [
  // Spice Garden (1)
  { id: 1, restaurant_id: 1, name: "Butter Chicken", description: "Tender chicken in creamy tomato-based gravy, slow-cooked with aromatic spices.", price: 299, category: "Mains", image_url: null, is_available: 1, emoji: "🍗", is_veg: false, is_bestseller: true },
  { id: 2, restaurant_id: 1, name: "Paneer Tikka Masala", description: "Grilled cottage cheese chunks in rich spiced onion-tomato gravy.", price: 259, category: "Mains", image_url: null, is_available: 1, emoji: "🧀", is_veg: true, is_bestseller: true },
  { id: 3, restaurant_id: 1, name: "Garlic Naan", description: "Soft leavened bread brushed with garlic butter, baked in tandoor.", price: 59, category: "Breads", image_url: null, is_available: 1, emoji: "🫓", is_veg: true, is_bestseller: false },
  { id: 4, restaurant_id: 1, name: "Dal Makhani", description: "Slow-cooked black lentils simmered overnight with butter and cream.", price: 199, category: "Mains", image_url: null, is_available: 1, emoji: "🫘", is_veg: true, is_bestseller: false },
  { id: 5, restaurant_id: 1, name: "Veg Biryani", description: "Fragrant basmati rice layered with seasonal vegetables and whole spices.", price: 229, category: "Rice & Biryani", image_url: null, is_available: 1, emoji: "🍚", is_veg: true, is_bestseller: false },
  { id: 6, restaurant_id: 1, name: "Chicken Biryani", description: "Dum-cooked basmati with marinated chicken, saffron, and caramelized onions.", price: 299, category: "Rice & Biryani", image_url: null, is_available: 1, emoji: "🍛", is_veg: false, is_bestseller: true },
  { id: 7, restaurant_id: 1, name: "Gulab Jamun", description: "Soft milk-solid dumplings soaked in rose-cardamom sugar syrup.", price: 89, category: "Desserts", image_url: null, is_available: 1, emoji: "🟤", is_veg: true, is_bestseller: false },
  { id: 8, restaurant_id: 1, name: "Mango Lassi", description: "Chilled blended yoghurt drink with Alphonso mango pulp.", price: 79, category: "Drinks", image_url: null, is_available: 1, emoji: "🥭", is_veg: true, is_bestseller: false },

  // Pizza Plaza (2)
  { id: 9, restaurant_id: 2, name: "Margherita", description: "Classic tomato sauce, fresh mozzarella, and basil on wood-fired crust.", price: 299, category: "Pizzas", image_url: null, is_available: 1, emoji: "🍕", is_veg: true, is_bestseller: true },
  { id: 10, restaurant_id: 2, name: "BBQ Chicken Pizza", description: "Smoky BBQ sauce, grilled chicken, red onion, and cheddar blend.", price: 399, category: "Pizzas", image_url: null, is_available: 1, emoji: "🍕", is_veg: false, is_bestseller: true },
  { id: 11, restaurant_id: 2, name: "Truffle Mushroom Pizza", description: "Earthy mushrooms, truffle oil, parmesan, and fresh thyme.", price: 449, category: "Pizzas", image_url: null, is_available: 1, emoji: "🍕", is_veg: true, is_bestseller: false },
  { id: 12, restaurant_id: 2, name: "Penne Arrabbiata", description: "Penne pasta in spicy tomato sauce with garlic and fresh chilli.", price: 249, category: "Pasta", image_url: null, is_available: 1, emoji: "🍝", is_veg: true, is_bestseller: false },
  { id: 13, restaurant_id: 2, name: "Tiramisu", description: "Italian classic — espresso-soaked ladyfingers layered with mascarpone cream.", price: 179, category: "Desserts", image_url: null, is_available: 1, emoji: "🍰", is_veg: true, is_bestseller: false },
  { id: 14, restaurant_id: 2, name: "Garlic Bread", description: "Toasted sourdough with herb butter and a side of marinara.", price: 129, category: "Starters", image_url: null, is_available: 1, emoji: "🥖", is_veg: true, is_bestseller: false },

  // Tokyo Bites (3)
  { id: 15, restaurant_id: 3, name: "Salmon Nigiri (4 pcs)", description: "Hand-pressed sushi rice topped with fresh Atlantic salmon.", price: 349, category: "Sushi", image_url: null, is_available: 1, emoji: "🍣", is_veg: false, is_bestseller: true },
  { id: 16, restaurant_id: 3, name: "Dragon Roll (8 pcs)", description: "Prawn tempura inside, avocado on top, eel sauce drizzle.", price: 449, category: "Sushi", image_url: null, is_available: 1, emoji: "🍣", is_veg: false, is_bestseller: true },
  { id: 17, restaurant_id: 3, name: "Tonkotsu Ramen", description: "Rich pork-bone broth, chashu pork, soft-boiled egg, and bamboo shoots.", price: 399, category: "Ramen", image_url: null, is_available: 1, emoji: "🍜", is_veg: false, is_bestseller: true },
  { id: 18, restaurant_id: 3, name: "Veggie Ramen", description: "Kombu dashi broth, bok choy, corn, mushrooms, and tofu.", price: 349, category: "Ramen", image_url: null, is_available: 1, emoji: "🍜", is_veg: true, is_bestseller: false },
  { id: 19, restaurant_id: 3, name: "Edamame", description: "Steamed salted young soybeans — the perfect light starter.", price: 149, category: "Starters", image_url: null, is_available: 1, emoji: "🫘", is_veg: true, is_bestseller: false },
  { id: 20, restaurant_id: 3, name: "Matcha Mochi Ice Cream", description: "Chewy rice-flour balls filled with green tea ice cream.", price: 199, category: "Desserts", image_url: null, is_available: 1, emoji: "🍡", is_veg: true, is_bestseller: false },

  // Burger Hub (4)
  { id: 21, restaurant_id: 4, name: "Classic Smash Burger", description: "Double smashed patties, American cheese, pickles, onion, special sauce.", price: 299, category: "Burgers", image_url: null, is_available: 1, emoji: "🍔", is_veg: false, is_bestseller: true },
  { id: 22, restaurant_id: 4, name: "Crispy Chicken Burger", description: "Buttermilk-fried chicken thigh, coleslaw, jalapeños, chipotle mayo.", price: 279, category: "Burgers", image_url: null, is_available: 1, emoji: "🍔", is_veg: false, is_bestseller: true },
  { id: 23, restaurant_id: 4, name: "Truffle Fries", description: "Hand-cut fries tossed in truffle oil, parmesan, and fresh herbs.", price: 179, category: "Sides", image_url: null, is_available: 1, emoji: "🍟", is_veg: true, is_bestseller: false },
  { id: 24, restaurant_id: 4, name: "Loaded Nachos", description: "Tortilla chips, jalapeño cheese sauce, pico de gallo, sour cream.", price: 199, category: "Sides", image_url: null, is_available: 1, emoji: "🌮", is_veg: true, is_bestseller: false },
  { id: 25, restaurant_id: 4, name: "Chocolate Milkshake", description: "Thick and creamy shake blended with Belgian chocolate ice cream.", price: 179, category: "Drinks", image_url: null, is_available: 1, emoji: "🥛", is_veg: true, is_bestseller: false },

  // Green Bowl (5)
  { id: 26, restaurant_id: 5, name: "Caesar Salad", description: "Romaine, parmesan, croutons, classic Caesar dressing.", price: 249, category: "Salads", image_url: null, is_available: 1, emoji: "🥗", is_veg: true, is_bestseller: true },
  { id: 27, restaurant_id: 5, name: "Grilled Chicken Bowl", description: "Quinoa base, grilled chicken, avocado, cherry tomatoes, tahini.", price: 349, category: "Power Bowls", image_url: null, is_available: 1, emoji: "🥙", is_veg: false, is_bestseller: true },
  { id: 28, restaurant_id: 5, name: "Falafel Wrap", description: "Crispy chickpea falafel, hummus, tzatziki, pickled cabbage.", price: 229, category: "Wraps", image_url: null, is_available: 1, emoji: "🌯", is_veg: true, is_bestseller: false },
  { id: 29, restaurant_id: 5, name: "Acai Bowl", description: "Blended acai with granola, banana, berries, and honey drizzle.", price: 279, category: "Breakfast", image_url: null, is_available: 1, emoji: "🫐", is_veg: true, is_bestseller: false },
  { id: 30, restaurant_id: 5, name: "Cold Press Juice", description: "Seasonal fruits cold-pressed fresh — no added sugar.", price: 149, category: "Drinks", image_url: null, is_available: 1, emoji: "🍹", is_veg: true, is_bestseller: false },

  // Noodle House (6)
  { id: 31, restaurant_id: 6, name: "Dim Sum Platter (6 pcs)", description: "Assorted steamed dumplings: pork, prawn, and vegetable.", price: 279, category: "Dim Sum", image_url: null, is_available: 1, emoji: "🥟", is_veg: false, is_bestseller: true },
  { id: 32, restaurant_id: 6, name: "Kung Pao Chicken", description: "Wok-tossed chicken with roasted peanuts, dried chilli, Sichuan sauce.", price: 319, category: "Mains", image_url: null, is_available: 1, emoji: "🍗", is_veg: false, is_bestseller: true },
  { id: 33, restaurant_id: 6, name: "Hakka Noodles", description: "Stir-fried egg noodles with vegetables and a savory soy-chilli glaze.", price: 199, category: "Noodles", image_url: null, is_available: 1, emoji: "🍜", is_veg: true, is_bestseller: false },
  { id: 34, restaurant_id: 6, name: "Spring Rolls (4 pcs)", description: "Crispy golden rolls stuffed with cabbage, carrot, and glass noodles.", price: 149, category: "Starters", image_url: null, is_available: 1, emoji: "🥠", is_veg: true, is_bestseller: false },
  { id: 35, restaurant_id: 6, name: "Fried Rice", description: "Wok-fried jasmine rice with egg, scallions, and house soy blend.", price: 179, category: "Rice", image_url: null, is_available: 1, emoji: "🍚", is_veg: false, is_bestseller: false },
];
