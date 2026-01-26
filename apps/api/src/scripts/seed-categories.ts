/*
  Seed ONLY categories (3-level deep) without products
  Run this script to populate your fresh database with the category structure
  
  Usage:
  cd apps/api
  npm run seed:categories
*/
import dotenv from "dotenv";
import { connectDB } from "../config/db";
import Category from "../models/Category";

dotenv.config();

async function seedCategories() {
    await connectDB();

    console.log("🌱 Starting category seeding...\n");

    // 3-level Categories (Department > Category > Subcategory)
    const categories = [
        // ============================================
        // LEVEL 1: ELECTRONICS (Department)
        // ============================================
        {
            name: "Electronics",
            description: "Devices, gadgets and electronic accessories",
            slug: "electronics",
        },

        // Level 2: Electronics Categories
        {
            name: "Computers & Accessories",
            parentSlug: "electronics",
            slug: "computers-accessories",
        },
        {
            name: "Mobile Phones & Tablets",
            parentSlug: "electronics",
            slug: "mobile-phones-tablets",
        },
        { name: "Audio & Sound", parentSlug: "electronics", slug: "audio-sound" },
        {
            name: "Cameras & Photography",
            parentSlug: "electronics",
            slug: "cameras-photography",
        },
        {
            name: "Smart Home & IoT",
            parentSlug: "electronics",
            slug: "smart-home-iot",
        },
        {
            name: "Wearable Technology",
            parentSlug: "electronics",
            slug: "wearable-technology",
        },
        { name: "Gaming", parentSlug: "electronics", slug: "gaming" },
        {
            name: "TV & Home Entertainment",
            parentSlug: "electronics",
            slug: "tv-home-entertainment",
        },

        // Level 3: Computers & Accessories Subcategories
        { name: "Laptops", parentSlug: "computers-accessories", slug: "laptops" },
        {
            name: "Desktop Computers",
            parentSlug: "computers-accessories",
            slug: "desktop-computers",
        },
        {
            name: "Monitors & Displays",
            parentSlug: "computers-accessories",
            slug: "monitors-displays",
        },
        {
            name: "Computer Components",
            parentSlug: "computers-accessories",
            slug: "computer-components",
        },
        {
            name: "Keyboards & Mice",
            parentSlug: "computers-accessories",
            slug: "keyboards-mice",
        },
        {
            name: "Storage Devices",
            parentSlug: "computers-accessories",
            slug: "storage-devices",
        },
        {
            name: "Networking Equipment",
            parentSlug: "computers-accessories",
            slug: "networking-equipment",
        },
        {
            name: "Printers & Scanners",
            parentSlug: "computers-accessories",
            slug: "printers-scanners",
        },

        // Level 3: Mobile Phones & Tablets Subcategories
        {
            name: "Smartphones",
            parentSlug: "mobile-phones-tablets",
            slug: "smartphones",
        },
        {
            name: "Tablets & iPads",
            parentSlug: "mobile-phones-tablets",
            slug: "tablets-ipads",
        },
        {
            name: "Phone Cases & Covers",
            parentSlug: "mobile-phones-tablets",
            slug: "phone-cases-covers",
        },
        {
            name: "Screen Protectors",
            parentSlug: "mobile-phones-tablets",
            slug: "screen-protectors",
        },
        {
            name: "Chargers & Cables",
            parentSlug: "mobile-phones-tablets",
            slug: "chargers-cables",
        },
        {
            name: "Power Banks",
            parentSlug: "mobile-phones-tablets",
            slug: "power-banks",
        },
        {
            name: "Phone Accessories",
            parentSlug: "mobile-phones-tablets",
            slug: "phone-accessories",
        },

        // Level 3: Audio & Sound Subcategories
        { name: "Headphones", parentSlug: "audio-sound", slug: "headphones" },
        {
            name: "Earbuds & Earphones",
            parentSlug: "audio-sound",
            slug: "earbuds-earphones",
        },
        {
            name: "Bluetooth Speakers",
            parentSlug: "audio-sound",
            slug: "bluetooth-speakers",
        },
        { name: "Soundbars", parentSlug: "audio-sound", slug: "soundbars" },
        {
            name: "Home Theater Systems",
            parentSlug: "audio-sound",
            slug: "home-theater-systems",
        },
        { name: "Microphones", parentSlug: "audio-sound", slug: "microphones" },
        {
            name: "Audio Accessories",
            parentSlug: "audio-sound",
            slug: "audio-accessories",
        },

        // Level 3: Cameras & Photography Subcategories
        {
            name: "DSLR Cameras",
            parentSlug: "cameras-photography",
            slug: "dslr-cameras",
        },
        {
            name: "Mirrorless Cameras",
            parentSlug: "cameras-photography",
            slug: "mirrorless-cameras",
        },
        {
            name: "Action Cameras",
            parentSlug: "cameras-photography",
            slug: "action-cameras",
        },
        {
            name: "Camera Lenses",
            parentSlug: "cameras-photography",
            slug: "camera-lenses",
        },
        {
            name: "Tripods & Stands",
            parentSlug: "cameras-photography",
            slug: "tripods-stands",
        },
        {
            name: "Camera Bags",
            parentSlug: "cameras-photography",
            slug: "camera-bags",
        },
        { name: "Drones", parentSlug: "cameras-photography", slug: "drones" },

        // Level 3: Smart Home & IoT Subcategories
        {
            name: "Smart Speakers",
            parentSlug: "smart-home-iot",
            slug: "smart-speakers",
        },
        {
            name: "Smart Lighting",
            parentSlug: "smart-home-iot",
            slug: "smart-lighting",
        },
        {
            name: "Smart Security",
            parentSlug: "smart-home-iot",
            slug: "smart-security",
        },
        {
            name: "Smart Plugs & Switches",
            parentSlug: "smart-home-iot",
            slug: "smart-plugs-switches",
        },
        {
            name: "Smart Thermostats",
            parentSlug: "smart-home-iot",
            slug: "smart-thermostats",
        },

        // Level 3: Wearable Technology Subcategories
        {
            name: "Smart Watches",
            parentSlug: "wearable-technology",
            slug: "smart-watches",
        },
        {
            name: "Fitness Trackers",
            parentSlug: "wearable-technology",
            slug: "fitness-trackers",
        },
        {
            name: "VR Headsets",
            parentSlug: "wearable-technology",
            slug: "vr-headsets",
        },

        // Level 3: Gaming Subcategories
        { name: "Gaming Consoles", parentSlug: "gaming", slug: "gaming-consoles" },
        {
            name: "Gaming Accessories",
            parentSlug: "gaming",
            slug: "gaming-accessories",
        },
        { name: "Video Games", parentSlug: "gaming", slug: "video-games" },
        { name: "Gaming Chairs", parentSlug: "gaming", slug: "gaming-chairs" },

        // Level 3: TV & Home Entertainment Subcategories
        {
            name: "Televisions",
            parentSlug: "tv-home-entertainment",
            slug: "televisions",
        },
        {
            name: "Streaming Devices",
            parentSlug: "tv-home-entertainment",
            slug: "streaming-devices",
        },
        {
            name: "Media Players",
            parentSlug: "tv-home-entertainment",
            slug: "media-players",
        },

        // ============================================
        // LEVEL 1: FASHION & APPAREL (Department)
        // ============================================
        {
            name: "Fashion & Apparel",
            description: "Clothing, shoes and fashion accessories",
            slug: "fashion-apparel",
        },

        // Level 2: Fashion Categories
        {
            name: "Women's Fashion",
            parentSlug: "fashion-apparel",
            slug: "womens-fashion",
        },
        {
            name: "Men's Fashion",
            parentSlug: "fashion-apparel",
            slug: "mens-fashion",
        },
        {
            name: "Kids & Babies",
            parentSlug: "fashion-apparel",
            slug: "kids-babies",
        },
        {
            name: "Fashion Accessories",
            parentSlug: "fashion-apparel",
            slug: "fashion-accessories",
        },
        {
            name: "Plus Size Fashion",
            parentSlug: "fashion-apparel",
            slug: "plus-size-fashion",
        },

        // Level 3: Women's Fashion Subcategories
        {
            name: "Women's Clothing",
            parentSlug: "womens-fashion",
            slug: "womens-clothing",
        },
        { name: "Dresses", parentSlug: "womens-fashion", slug: "dresses" },
        {
            name: "Tops & Blouses",
            parentSlug: "womens-fashion",
            slug: "tops-blouses",
        },
        {
            name: "Pants & Trousers",
            parentSlug: "womens-fashion",
            slug: "pants-trousers",
        },
        { name: "Skirts", parentSlug: "womens-fashion", slug: "skirts" },
        {
            name: "Women's Shoes",
            parentSlug: "womens-fashion",
            slug: "womens-shoes",
        },
        { name: "Handbags", parentSlug: "womens-fashion", slug: "handbags" },
        {
            name: "Women's Activewear",
            parentSlug: "womens-fashion",
            slug: "womens-activewear",
        },
        {
            name: "Lingerie & Sleepwear",
            parentSlug: "womens-fashion",
            slug: "lingerie-sleepwear",
        },

        // Level 3: Men's Fashion Subcategories
        {
            name: "Men's Clothing",
            parentSlug: "mens-fashion",
            slug: "mens-clothing",
        },
        { name: "Shirts", parentSlug: "mens-fashion", slug: "shirts" },
        { name: "T-Shirts", parentSlug: "mens-fashion", slug: "t-shirts" },
        { name: "Jeans", parentSlug: "mens-fashion", slug: "jeans" },
        {
            name: "Suits & Blazers",
            parentSlug: "mens-fashion",
            slug: "suits-blazers",
        },
        { name: "Men's Shoes", parentSlug: "mens-fashion", slug: "mens-shoes" },
        {
            name: "Men's Activewear",
            parentSlug: "mens-fashion",
            slug: "mens-activewear",
        },
        {
            name: "Men's Accessories",
            parentSlug: "mens-fashion",
            slug: "mens-accessories",
        },

        // Level 3: Kids & Babies Subcategories
        { name: "Baby Clothing", parentSlug: "kids-babies", slug: "baby-clothing" },
        {
            name: "Baby Boy Clothing",
            parentSlug: "kids-babies",
            slug: "baby-boy-clothing",
        },
        {
            name: "Baby Girl Clothing",
            parentSlug: "kids-babies",
            slug: "baby-girl-clothing",
        },
        { name: "Kids Clothing", parentSlug: "kids-babies", slug: "kids-clothing" },
        { name: "Kids Shoes", parentSlug: "kids-babies", slug: "kids-shoes" },
        { name: "Baby Gear", parentSlug: "kids-babies", slug: "baby-gear" },
        { name: "Strollers", parentSlug: "kids-babies", slug: "strollers" },
        { name: "Car Seats", parentSlug: "kids-babies", slug: "car-seats" },
        { name: "Toys", parentSlug: "kids-babies", slug: "toys" },

        // Level 3: Fashion Accessories Subcategories
        { name: "Belts", parentSlug: "fashion-accessories", slug: "belts" },
        {
            name: "Hats & Caps",
            parentSlug: "fashion-accessories",
            slug: "hats-caps",
        },
        {
            name: "Sunglasses",
            parentSlug: "fashion-accessories",
            slug: "sunglasses",
        },
        {
            name: "Scarves & Shawls",
            parentSlug: "fashion-accessories",
            slug: "scarves-shawls",
        },
        {
            name: "Wallets & Purses",
            parentSlug: "fashion-accessories",
            slug: "wallets-purses",
        },
        { name: "Gloves", parentSlug: "fashion-accessories", slug: "gloves" },

        // Level 3: Plus Size Fashion Subcategories
        {
            name: "Plus Size Women",
            parentSlug: "plus-size-fashion",
            slug: "plus-size-women",
        },
        {
            name: "Plus Size Men",
            parentSlug: "plus-size-fashion",
            slug: "plus-size-men",
        },

        // ============================================
        // LEVEL 1: HOME & LIVING (Department)
        // ============================================
        {
            name: "Home & Living",
            description: "Furniture, appliances and home essentials",
            slug: "home-living",
        },

        // Level 2: Home & Living Categories
        {
            name: "Large Appliances",
            parentSlug: "home-living",
            slug: "large-appliances",
        },
        {
            name: "Small Appliances",
            parentSlug: "home-living",
            slug: "small-appliances",
        },
        { name: "Furniture", parentSlug: "home-living", slug: "furniture" },
        { name: "Home Decor", parentSlug: "home-living", slug: "home-decor" },
        {
            name: "Kitchen & Dining",
            parentSlug: "home-living",
            slug: "kitchen-dining",
        },
        { name: "Bedding & Bath", parentSlug: "home-living", slug: "bedding-bath" },
        {
            name: "Storage & Organization",
            parentSlug: "home-living",
            slug: "storage-organization",
        },
        {
            name: "Garden & Outdoor",
            parentSlug: "home-living",
            slug: "garden-outdoor",
        },

        // Level 3: Large Appliances Subcategories
        {
            name: "Refrigerators & Freezers",
            parentSlug: "large-appliances",
            slug: "refrigerators-freezers",
        },
        {
            name: "Washing Machines",
            parentSlug: "large-appliances",
            slug: "washing-machines",
        },
        { name: "Dryers", parentSlug: "large-appliances", slug: "dryers" },
        {
            name: "Air Conditioners",
            parentSlug: "large-appliances",
            slug: "air-conditioners",
        },
        {
            name: "Dishwashers",
            parentSlug: "large-appliances",
            slug: "dishwashers",
        },
        {
            name: "Water Heaters",
            parentSlug: "large-appliances",
            slug: "water-heaters",
        },
        { name: "Generators", parentSlug: "large-appliances", slug: "generators" },

        // Level 3: Small Appliances Subcategories
        { name: "Blenders", parentSlug: "small-appliances", slug: "blenders" },
        { name: "Microwaves", parentSlug: "small-appliances", slug: "microwaves" },
        {
            name: "Toasters & Ovens",
            parentSlug: "small-appliances",
            slug: "toasters-ovens",
        },
        {
            name: "Coffee Makers",
            parentSlug: "small-appliances",
            slug: "coffee-makers",
        },
        {
            name: "Rice Cookers",
            parentSlug: "small-appliances",
            slug: "rice-cookers",
        },
        { name: "Air Fryers", parentSlug: "small-appliances", slug: "air-fryers" },
        {
            name: "Vacuum Cleaners",
            parentSlug: "small-appliances",
            slug: "vacuum-cleaners",
        },
        {
            name: "Irons & Steamers",
            parentSlug: "small-appliances",
            slug: "irons-steamers",
        },

        // Level 3: Furniture Subcategories
        { name: "Sofas & Couches", parentSlug: "furniture", slug: "sofas-couches" },
        { name: "Dining Tables", parentSlug: "furniture", slug: "dining-tables" },
        { name: "Dining Chairs", parentSlug: "furniture", slug: "dining-chairs" },
        { name: "Office Chairs", parentSlug: "furniture", slug: "office-chairs" },
        { name: "Office Desks", parentSlug: "furniture", slug: "office-desks" },
        { name: "Beds & Frames", parentSlug: "furniture", slug: "beds-frames" },
        { name: "Mattresses", parentSlug: "furniture", slug: "mattresses" },
        { name: "Wardrobes", parentSlug: "furniture", slug: "wardrobes" },
        { name: "Bookcases", parentSlug: "furniture", slug: "bookcases" },

        // Level 3: Home Decor Subcategories
        { name: "Lighting", parentSlug: "home-decor", slug: "lighting" },
        { name: "Wall Art", parentSlug: "home-decor", slug: "wall-art" },
        { name: "Mirrors", parentSlug: "home-decor", slug: "mirrors" },
        { name: "Rugs & Carpets", parentSlug: "home-decor", slug: "rugs-carpets" },
        {
            name: "Curtains & Blinds",
            parentSlug: "home-decor",
            slug: "curtains-blinds",
        },
        {
            name: "Cushions & Throws",
            parentSlug: "home-decor",
            slug: "cushions-throws",
        },
        {
            name: "Vases & Planters",
            parentSlug: "home-decor",
            slug: "vases-planters",
        },
        {
            name: "Candles & Holders",
            parentSlug: "home-decor",
            slug: "candles-holders",
        },

        // Level 3: Kitchen & Dining Subcategories
        { name: "Cookware", parentSlug: "kitchen-dining", slug: "cookware" },
        { name: "Dinnerware", parentSlug: "kitchen-dining", slug: "dinnerware" },
        { name: "Cutlery", parentSlug: "kitchen-dining", slug: "cutlery" },
        {
            name: "Kitchen Utensils",
            parentSlug: "kitchen-dining",
            slug: "kitchen-utensils",
        },
        {
            name: "Food Storage",
            parentSlug: "kitchen-dining",
            slug: "food-storage",
        },
        { name: "Bakeware", parentSlug: "kitchen-dining", slug: "bakeware" },

        // Level 3: Bedding & Bath Subcategories
        { name: "Bed Sheets", parentSlug: "bedding-bath", slug: "bed-sheets" },
        {
            name: "Comforters & Duvets",
            parentSlug: "bedding-bath",
            slug: "comforters-duvets",
        },
        { name: "Pillows", parentSlug: "bedding-bath", slug: "pillows" },
        { name: "Towels", parentSlug: "bedding-bath", slug: "towels" },
        { name: "Bath Mats", parentSlug: "bedding-bath", slug: "bath-mats" },
        {
            name: "Shower Curtains",
            parentSlug: "bedding-bath",
            slug: "shower-curtains",
        },

        // Level 3: Storage & Organization Subcategories
        {
            name: "Storage Boxes",
            parentSlug: "storage-organization",
            slug: "storage-boxes",
        },
        {
            name: "Closet Organizers",
            parentSlug: "storage-organization",
            slug: "closet-organizers",
        },
        {
            name: "Laundry Baskets",
            parentSlug: "storage-organization",
            slug: "laundry-baskets",
        },
        {
            name: "Hooks & Hangers",
            parentSlug: "storage-organization",
            slug: "hooks-hangers",
        },

        // Level 3: Garden & Outdoor Subcategories
        {
            name: "Gardening Tools",
            parentSlug: "garden-outdoor",
            slug: "gardening-tools",
        },
        {
            name: "Outdoor Furniture",
            parentSlug: "garden-outdoor",
            slug: "outdoor-furniture",
        },
        { name: "BBQ & Grills", parentSlug: "garden-outdoor", slug: "bbq-grills" },

        // ============================================
        // LEVEL 1: BEAUTY & PERSONAL CARE (Department)
        // ============================================
        {
            name: "Beauty & Personal Care",
            description: "Cosmetics, skincare and personal care products",
            slug: "beauty-personal-care",
        },

        // Level 2: Beauty & Personal Care Categories
        {
            name: "Hair Care & Accessories",
            parentSlug: "beauty-personal-care",
            slug: "hair-care-accessories",
        },
        { name: "Skincare", parentSlug: "beauty-personal-care", slug: "skincare" },
        {
            name: "Makeup & Cosmetics",
            parentSlug: "beauty-personal-care",
            slug: "makeup-cosmetics",
        },
        {
            name: "Fragrances",
            parentSlug: "beauty-personal-care",
            slug: "fragrances",
        },
        {
            name: "Health & Supplements",
            parentSlug: "beauty-personal-care",
            slug: "health-supplements",
        },
        {
            name: "Personal Care",
            parentSlug: "beauty-personal-care",
            slug: "personal-care",
        },

        // Level 3: Hair Care & Accessories Subcategories
        {
            name: "Hair Care Products",
            parentSlug: "hair-care-accessories",
            slug: "hair-care-products",
        },
        {
            name: "Wigs & Extensions",
            parentSlug: "hair-care-accessories",
            slug: "wigs-extensions",
        },
        {
            name: "Hair Styling Tools",
            parentSlug: "hair-care-accessories",
            slug: "hair-styling-tools",
        },
        {
            name: "Hair Accessories",
            parentSlug: "hair-care-accessories",
            slug: "hair-accessories",
        },

        // Level 3: Skincare Subcategories
        { name: "Face Care", parentSlug: "skincare", slug: "face-care" },
        { name: "Body Care", parentSlug: "skincare", slug: "body-care" },
        { name: "Sunscreen", parentSlug: "skincare", slug: "sunscreen" },
        { name: "Anti-Aging", parentSlug: "skincare", slug: "anti-aging" },

        // Level 3: Makeup & Cosmetics Subcategories
        {
            name: "Face Makeup",
            parentSlug: "makeup-cosmetics",
            slug: "face-makeup",
        },
        { name: "Eye Makeup", parentSlug: "makeup-cosmetics", slug: "eye-makeup" },
        { name: "Lip Makeup", parentSlug: "makeup-cosmetics", slug: "lip-makeup" },
        {
            name: "Makeup Tools",
            parentSlug: "makeup-cosmetics",
            slug: "makeup-tools",
        },

        // Level 3: Fragrances Subcategories
        { name: "Perfumes", parentSlug: "fragrances", slug: "perfumes" },
        { name: "Colognes", parentSlug: "fragrances", slug: "colognes" },
        { name: "Body Sprays", parentSlug: "fragrances", slug: "body-sprays" },
        { name: "Deodorants", parentSlug: "fragrances", slug: "deodorants" },

        // Level 3: Health & Supplements Subcategories
        {
            name: "Vitamins & Minerals",
            parentSlug: "health-supplements",
            slug: "vitamins-minerals",
        },
        {
            name: "Fitness Supplements",
            parentSlug: "health-supplements",
            slug: "fitness-supplements",
        },
        {
            name: "Herbal Supplements",
            parentSlug: "health-supplements",
            slug: "herbal-supplements",
        },
        {
            name: "Personal Health",
            parentSlug: "health-supplements",
            slug: "personal-health",
        },

        // Level 3: Personal Care Subcategories
        { name: "Oral Care", parentSlug: "personal-care", slug: "oral-care" },
        { name: "Bath & Shower", parentSlug: "personal-care", slug: "bath-shower" },
        {
            name: "Men's Grooming",
            parentSlug: "personal-care",
            slug: "mens-grooming",
        },
        {
            name: "Shaving & Hair Removal",
            parentSlug: "personal-care",
            slug: "shaving-hair-removal",
        },

        // ============================================
        // LEVEL 1: SPORTS & OUTDOORS (Department)
        // ============================================
        {
            name: "Sports & Outdoors",
            description: "Fitness equipment and outdoor gear",
            slug: "sports-outdoors",
        },

        // Level 2: Sports & Outdoors Categories
        {
            name: "Sports & Fitness",
            parentSlug: "sports-outdoors",
            slug: "sports-fitness",
        },
        {
            name: "Outdoor & Recreation",
            parentSlug: "sports-outdoors",
            slug: "outdoor-recreation",
        },
        { name: "Sportswear", parentSlug: "sports-outdoors", slug: "sportswear" },
        { name: "Team Sports", parentSlug: "sports-outdoors", slug: "team-sports" },

        // Level 3: Sports & Fitness Subcategories
        {
            name: "Exercise Equipment",
            parentSlug: "sports-fitness",
            slug: "exercise-equipment",
        },
        {
            name: "Yoga & Pilates",
            parentSlug: "sports-fitness",
            slug: "yoga-pilates",
        },
        {
            name: "Weights & Dumbbells",
            parentSlug: "sports-fitness",
            slug: "weights-dumbbells",
        },
        {
            name: "Treadmills & Bikes",
            parentSlug: "sports-fitness",
            slug: "treadmills-bikes",
        },
        {
            name: "Sports Accessories",
            parentSlug: "sports-fitness",
            slug: "sports-accessories",
        },
        { name: "Water Bottles", parentSlug: "sports-fitness", slug: "water-bottles" },

        // Level 3: Outdoor & Recreation Subcategories
        {
            name: "Camping & Hiking",
            parentSlug: "outdoor-recreation",
            slug: "camping-hiking",
        },
        { name: "Cycling", parentSlug: "outdoor-recreation", slug: "cycling" },
        { name: "Fishing", parentSlug: "outdoor-recreation", slug: "fishing" },
        {
            name: "Water Sports",
            parentSlug: "outdoor-recreation",
            slug: "water-sports",
        },

        // Level 3: Sportswear Subcategories
        {
            name: "Men's Sportswear",
            parentSlug: "sportswear",
            slug: "mens-sportswear",
        },
        {
            name: "Women's Sportswear",
            parentSlug: "sportswear",
            slug: "womens-sportswear",
        },
        { name: "Sports Shoes", parentSlug: "sportswear", slug: "sports-shoes" },
        { name: "Swimwear", parentSlug: "sportswear", slug: "swimwear" },

        // Level 3: Team Sports Subcategories
        {
            name: "Football & Soccer",
            parentSlug: "team-sports",
            slug: "football-soccer",
        },
        { name: "Basketball", parentSlug: "team-sports", slug: "basketball" },
        {
            name: "Tennis & Badminton",
            parentSlug: "team-sports",
            slug: "tennis-badminton",
        },
        { name: "Volleyball", parentSlug: "team-sports", slug: "volleyball" },

        // ============================================
        // LEVEL 1: JEWELRY & WATCHES (Department)
        // ============================================
        {
            name: "Jewelry & Watches",
            description: "Fashion and luxury jewelry, watches",
            slug: "jewelry-watches",
        },

        // Level 2: Jewelry & Watches Categories
        {
            name: "Women's Jewelry",
            parentSlug: "jewelry-watches",
            slug: "womens-jewelry",
        },
        {
            name: "Men's Jewelry",
            parentSlug: "jewelry-watches",
            slug: "mens-jewelry",
        },
        { name: "Watches", parentSlug: "jewelry-watches", slug: "watches" },
        {
            name: "Fashion Jewelry",
            parentSlug: "jewelry-watches",
            slug: "fashion-jewelry",
        },

        // Level 3: Women's Jewelry Subcategories
        {
            name: "Necklaces & Pendants",
            parentSlug: "womens-jewelry",
            slug: "necklaces-pendants",
        },
        { name: "Earrings", parentSlug: "womens-jewelry", slug: "earrings" },
        {
            name: "Bracelets & Bangles",
            parentSlug: "womens-jewelry",
            slug: "bracelets-bangles",
        },
        { name: "Rings", parentSlug: "womens-jewelry", slug: "rings" },
        {
            name: "Jewelry Sets",
            parentSlug: "womens-jewelry",
            slug: "jewelry-sets",
        },

        // Level 3: Men's Jewelry Subcategories
        {
            name: "Men's Bracelets",
            parentSlug: "mens-jewelry",
            slug: "mens-bracelets",
        },
        { name: "Men's Rings", parentSlug: "mens-jewelry", slug: "mens-rings" },
        {
            name: "Men's Necklaces",
            parentSlug: "mens-jewelry",
            slug: "mens-necklaces",
        },
        { name: "Cufflinks", parentSlug: "mens-jewelry", slug: "cufflinks" },

        // Level 3: Watches Subcategories
        { name: "Women's Watches", parentSlug: "watches", slug: "womens-watches" },
        { name: "Men's Watches", parentSlug: "watches", slug: "mens-watches" },
        { name: "Luxury Watches", parentSlug: "watches", slug: "luxury-watches" },
        { name: "Sport Watches", parentSlug: "watches", slug: "sport-watches" },

        // Level 3: Fashion Jewelry Subcategories
        {
            name: "Costume Jewelry",
            parentSlug: "fashion-jewelry",
            slug: "costume-jewelry",
        },
        {
            name: "Body Jewelry",
            parentSlug: "fashion-jewelry",
            slug: "body-jewelry",
        },

        // ============================================
        // LEVEL 1: AUTOMOBILES & PARTS (Department)
        // ============================================
        {
            name: "Automobiles & Parts",
            description: "Vehicles for sale, car accessories, parts and maintenance",
            slug: "automobiles-parts",
        },

        // Level 2: Automobiles & Parts Categories
        {
            name: "Vehicles for Sale",
            parentSlug: "automobiles-parts",
            slug: "vehicles-for-sale",
        },
        {
            name: "Car Accessories",
            parentSlug: "automobiles-parts",
            slug: "car-accessories",
        },
        { name: "Car Parts", parentSlug: "automobiles-parts", slug: "car-parts" },
        {
            name: "Car Care & Maintenance",
            parentSlug: "automobiles-parts",
            slug: "car-care-maintenance",
        },
        {
            name: "Motorcycles & Accessories",
            parentSlug: "automobiles-parts",
            slug: "motorcycles-accessories",
        },

        // Level 3: Vehicles for Sale Subcategories
        { name: "New Cars", parentSlug: "vehicles-for-sale", slug: "new-cars" },
        { name: "Used Cars", parentSlug: "vehicles-for-sale", slug: "used-cars" },
        {
            name: "Luxury & Sports Cars",
            parentSlug: "vehicles-for-sale",
            slug: "luxury-sports-cars",
        },
        {
            name: "SUVs & Trucks",
            parentSlug: "vehicles-for-sale",
            slug: "suvs-trucks",
        },
        {
            name: "Vans & Commercial Vehicles",
            parentSlug: "vehicles-for-sale",
            slug: "vans-commercial-vehicles",
        },
        {
            name: "Electric & Hybrid Vehicles",
            parentSlug: "vehicles-for-sale",
            slug: "electric-hybrid-vehicles",
        },

        // Level 3: Car Accessories Subcategories
        {
            name: "Interior Accessories",
            parentSlug: "car-accessories",
            slug: "interior-accessories",
        },
        {
            name: "Exterior Accessories",
            parentSlug: "car-accessories",
            slug: "exterior-accessories",
        },
        {
            name: "Car Electronics",
            parentSlug: "car-accessories",
            slug: "car-electronics",
        },
        { name: "Car Safety", parentSlug: "car-accessories", slug: "car-safety" },
        {
            name: "Car Audio & Video",
            parentSlug: "car-accessories",
            slug: "car-audio-video",
        },

        // Level 3: Car Parts Subcategories
        { name: "Engine Parts", parentSlug: "car-parts", slug: "engine-parts" },
        { name: "Brake Parts", parentSlug: "car-parts", slug: "brake-parts" },
        { name: "Batteries", parentSlug: "car-parts", slug: "batteries" },
        { name: "Lights & Bulbs", parentSlug: "car-parts", slug: "lights-bulbs" },
        { name: "Tires & Wheels", parentSlug: "car-parts", slug: "tires-wheels" },
        {
            name: "Transmission Parts",
            parentSlug: "car-parts",
            slug: "transmission-parts",
        },

        // Level 3: Car Care & Maintenance Subcategories
        {
            name: "Car Wash Supplies",
            parentSlug: "car-care-maintenance",
            slug: "car-wash-supplies",
        },
        {
            name: "Motor Oils",
            parentSlug: "car-care-maintenance",
            slug: "motor-oils",
        },
        {
            name: "Cleaning Tools",
            parentSlug: "car-care-maintenance",
            slug: "cleaning-tools",
        },
        {
            name: "Polishes & Waxes",
            parentSlug: "car-care-maintenance",
            slug: "polishes-waxes",
        },

        // Level 3: Motorcycles & Accessories Subcategories
        {
            name: "Motorcycles for Sale",
            parentSlug: "motorcycles-accessories",
            slug: "motorcycles-for-sale",
        },
        { name: "Helmets", parentSlug: "motorcycles-accessories", slug: "helmets" },
        {
            name: "Riding Gear",
            parentSlug: "motorcycles-accessories",
            slug: "riding-gear",
        },
        {
            name: "Motorcycle Parts",
            parentSlug: "motorcycles-accessories",
            slug: "motorcycle-parts",
        },
        {
            name: "Motorcycle Accessories",
            parentSlug: "motorcycles-accessories",
            slug: "motorcycle-accessories",
        },

        {
            name: "Automobiles & Parts",
            description: "Car accessories, parts and maintenance",
            slug: "automobiles-parts",
        },

        // Level 2: Automobiles & Parts Categories
        {
            name: "Car Accessories",
            parentSlug: "automobiles-parts",
            slug: "car-accessories",
        },
        { name: "Car Parts", parentSlug: "automobiles-parts", slug: "car-parts" },
        {
            name: "Car Care & Maintenance",
            parentSlug: "automobiles-parts",
            slug: "car-care-maintenance",
        },
        {
            name: "Motorcycle Accessories",
            parentSlug: "automobiles-parts",
            slug: "motorcycle-accessories",
        },

        // Level 3: Car Accessories Subcategories
        {
            name: "Interior Accessories",
            parentSlug: "car-accessories",
            slug: "interior-accessories",
        },
        {
            name: "Exterior Accessories",
            parentSlug: "car-accessories",
            slug: "exterior-accessories",
        },
        {
            name: "Car Electronics",
            parentSlug: "car-accessories",
            slug: "car-electronics",
        },
        { name: "Car Safety", parentSlug: "car-accessories", slug: "car-safety" },

        // Level 3: Car Parts Subcategories
        { name: "Engine Parts", parentSlug: "car-parts", slug: "engine-parts" },
        { name: "Brake Parts", parentSlug: "car-parts", slug: "brake-parts" },
        { name: "Batteries", parentSlug: "car-parts", slug: "batteries" },
        { name: "Lights & Bulbs", parentSlug: "car-parts", slug: "lights-bulbs" },

        // Level 3: Car Care & Maintenance Subcategories
        {
            name: "Car Wash Supplies",
            parentSlug: "car-care-maintenance",
            slug: "car-wash-supplies",
        },
        {
            name: "Motor Oils",
            parentSlug: "car-care-maintenance",
            slug: "motor-oils",
        },
        {
            name: "Cleaning Tools",
            parentSlug: "car-care-maintenance",
            slug: "cleaning-tools",
        },

        // Level 3: Motorcycle Accessories Subcategories
        { name: "Helmets", parentSlug: "motorcycle-accessories", slug: "helmets" },
        {
            name: "Riding Gear",
            parentSlug: "motorcycle-accessories",
            slug: "riding-gear",
        },
        {
            name: "Motorcycle Parts",
            parentSlug: "motorcycle-accessories",
            slug: "motorcycle-parts",
        },

        // ============================================
        // LEVEL 1: AGRICULTURE & FARMING (Department)
        // ============================================
        {
            name: "Agriculture & Farming",
            description: "Farming tools, equipment and supplies",
            slug: "agriculture-farming",
        },

        // Level 2: Agriculture & Farming Categories
        {
            name: "Farming Tools & Equipment",
            parentSlug: "agriculture-farming",
            slug: "farming-tools-equipment",
        },
        {
            name: "Seeds & Plants",
            parentSlug: "agriculture-farming",
            slug: "seeds-plants",
        },
        {
            name: "Fertilizers & Pesticides",
            parentSlug: "agriculture-farming",
            slug: "fertilizers-pesticides",
        },
        {
            name: "Animal Husbandry",
            parentSlug: "agriculture-farming",
            slug: "animal-husbandry",
        },

        // Level 3: Farming Tools & Equipment Subcategories
        {
            name: "Hand Tools",
            parentSlug: "farming-tools-equipment",
            slug: "hand-tools",
        },
        {
            name: "Power Tools",
            parentSlug: "farming-tools-equipment",
            slug: "power-tools",
        },
        {
            name: "Irrigation Systems",
            parentSlug: "farming-tools-equipment",
            slug: "irrigation-systems",
        },
        {
            name: "Wheelbarrows & Carts",
            parentSlug: "farming-tools-equipment",
            slug: "wheelbarrows-carts",
        },

        // Level 3: Seeds & Plants Subcategories
        {
            name: "Vegetable Seeds",
            parentSlug: "seeds-plants",
            slug: "vegetable-seeds",
        },
        { name: "Fruit Seeds", parentSlug: "seeds-plants", slug: "fruit-seeds" },
        { name: "Flower Seeds", parentSlug: "seeds-plants", slug: "flower-seeds" },
        {
            name: "Seedlings & Saplings",
            parentSlug: "seeds-plants",
            slug: "seedlings-saplings",
        },

        // Level 3: Fertilizers & Pesticides Subcategories
        {
            name: "Organic Fertilizers",
            parentSlug: "fertilizers-pesticides",
            slug: "organic-fertilizers",
        },
        {
            name: "Chemical Fertilizers",
            parentSlug: "fertilizers-pesticides",
            slug: "chemical-fertilizers",
        },
        {
            name: "Pesticides",
            parentSlug: "fertilizers-pesticides",
            slug: "pesticides",
        },
        {
            name: "Herbicides",
            parentSlug: "fertilizers-pesticides",
            slug: "herbicides",
        },

        // Level 3: Animal Husbandry Subcategories
        {
            name: "Poultry Supplies",
            parentSlug: "animal-husbandry",
            slug: "poultry-supplies",
        },
        {
            name: "Livestock Feed",
            parentSlug: "animal-husbandry",
            slug: "livestock-feed",
        },
        {
            name: "Animal Health Products",
            parentSlug: "animal-husbandry",
            slug: "animal-health-products",
        },

        // ============================================
        // LEVEL 1: BAGS & LUGGAGE (Department)
        // ============================================
        {
            name: "Bags & Luggage",
            description: "Backpacks, travel bags and luggage",
            slug: "bags-luggage",
        },

        // Level 2: Bags & Luggage Categories
        { name: "Backpacks", parentSlug: "bags-luggage", slug: "backpacks" },
        {
            name: "Travel Luggage",
            parentSlug: "bags-luggage",
            slug: "travel-luggage",
        },
        {
            name: "Handbags & Purses",
            parentSlug: "bags-luggage",
            slug: "handbags-purses",
        },
        {
            name: "Professional Bags",
            parentSlug: "bags-luggage",
            slug: "professional-bags",
        },

        // Level 3: Backpacks Subcategories
        {
            name: "School Backpacks",
            parentSlug: "backpacks",
            slug: "school-backpacks",
        },
        {
            name: "Laptop Backpacks",
            parentSlug: "backpacks",
            slug: "laptop-backpacks",
        },
        {
            name: "Travel Backpacks",
            parentSlug: "backpacks",
            slug: "travel-backpacks",
        },
        {
            name: "Hiking Backpacks",
            parentSlug: "backpacks",
            slug: "hiking-backpacks",
        },

        // Level 3: Travel Luggage Subcategories
        {
            name: "Carry-On Luggage",
            parentSlug: "travel-luggage",
            slug: "carry-on-luggage",
        },
        {
            name: "Checked Luggage",
            parentSlug: "travel-luggage",
            slug: "checked-luggage",
        },
        {
            name: "Luggage Sets",
            parentSlug: "travel-luggage",
            slug: "luggage-sets",
        },
        { name: "Duffel Bags", parentSlug: "travel-luggage", slug: "duffel-bags" },

        // Level 3: Handbags & Purses Subcategories
        {
            name: "Shoulder Bags",
            parentSlug: "handbags-purses",
            slug: "shoulder-bags",
        },
        {
            name: "Crossbody Bags",
            parentSlug: "handbags-purses",
            slug: "crossbody-bags",
        },
        { name: "Clutches", parentSlug: "handbags-purses", slug: "clutches" },
        { name: "Tote Bags", parentSlug: "handbags-purses", slug: "tote-bags" },

        // Level 3: Professional Bags Subcategories
        {
            name: "Laptop Bags",
            parentSlug: "professional-bags",
            slug: "laptop-bags",
        },
        { name: "Briefcases", parentSlug: "professional-bags", slug: "briefcases" },
        {
            name: "Messenger Bags",
            parentSlug: "professional-bags",
            slug: "messenger-bags",
        },

        // ============================================
        // LEVEL 1: BOOKS, MEDIA & ENTERTAINMENT (Department)
        // ============================================
        {
            name: "Books, Media & Entertainment",
            description: "Books, movies, music and instruments",
            slug: "books-media-entertainment",
        },

        // Level 2: Books, Media & Entertainment Categories
        { name: "Books", parentSlug: "books-media-entertainment", slug: "books" },
        {
            name: "Movies & Music",
            parentSlug: "books-media-entertainment",
            slug: "movies-music",
        },
        {
            name: "Musical Instruments",
            parentSlug: "books-media-entertainment",
            slug: "musical-instruments",
        },

        // Level 3: Books Subcategories
        { name: "Fiction", parentSlug: "books", slug: "fiction" },
        { name: "Non-Fiction", parentSlug: "books", slug: "non-fiction" },
        {
            name: "Educational Books",
            parentSlug: "books",
            slug: "educational-books",
        },
        { name: "Children's Books", parentSlug: "books", slug: "childrens-books" },
        { name: "Religious Books", parentSlug: "books", slug: "religious-books" },

        // Level 3: Movies & Music Subcategories
        {
            name: "DVDs & Blu-rays",
            parentSlug: "movies-music",
            slug: "dvds-blu-rays",
        },
        { name: "Music CDs", parentSlug: "movies-music", slug: "music-cds" },
        {
            name: "Vinyl Records",
            parentSlug: "movies-music",
            slug: "vinyl-records",
        },

        // Level 3: Musical Instruments Subcategories
        { name: "Guitars", parentSlug: "musical-instruments", slug: "guitars" },
        {
            name: "Keyboards & Pianos",
            parentSlug: "musical-instruments",
            slug: "keyboards-pianos",
        },
        {
            name: "Drums & Percussion",
            parentSlug: "musical-instruments",
            slug: "drums-percussion",
        },
        {
            name: "Instrument Accessories",
            parentSlug: "musical-instruments",
            slug: "instrument-accessories",
        },

        // ============================================
        // LEVEL 1: OFFICE & SCHOOL SUPPLIES (Department)
        // ============================================
        {
            name: "Office & School Supplies",
            description: "Stationery, office furniture and supplies",
            slug: "office-school-supplies",
        },

        // Level 2: Office & School Supplies Categories
        {
            name: "Office Furniture",
            parentSlug: "office-school-supplies",
            slug: "office-furniture",
        },
        {
            name: "Stationery",
            parentSlug: "office-school-supplies",
            slug: "stationery",
        },
        {
            name: "Office Electronics",
            parentSlug: "office-school-supplies",
            slug: "office-electronics",
        },
        {
            name: "School Supplies",
            parentSlug: "office-school-supplies",
            slug: "school-supplies",
        },

        // Level 3: Office Furniture Subcategories
        {
            name: "Office Desks",
            parentSlug: "office-furniture",
            slug: "office-desks",
        },
        {
            name: "Office Chairs",
            parentSlug: "office-furniture",
            slug: "office-chairs",
        },
        {
            name: "Filing Cabinets",
            parentSlug: "office-furniture",
            slug: "filing-cabinets",
        },
        {
            name: "Office Storage",
            parentSlug: "office-furniture",
            slug: "office-storage",
        },

        // Level 3: Stationery Subcategories
        { name: "Pens & Pencils", parentSlug: "stationery", slug: "pens-pencils" },
        { name: "Notebooks", parentSlug: "stationery", slug: "notebooks" },
        {
            name: "Folders & Binders",
            parentSlug: "stationery",
            slug: "folders-binders",
        },
        {
            name: "Paper Products",
            parentSlug: "stationery",
            slug: "paper-products",
        },

        // Level 3: Office Electronics Subcategories
        {
            name: "Printers & Scanners",
            parentSlug: "office-electronics",
            slug: "printers-scanners",
        },
        {
            name: "Calculators",
            parentSlug: "office-electronics",
            slug: "calculators",
        },
        {
            name: "Laminators",
            parentSlug: "office-electronics",
            slug: "laminators",
        },
        { name: "Shredders", parentSlug: "office-electronics", slug: "shredders" },

        // Level 3: School Supplies Subcategories
        {
            name: "School Backpacks",
            parentSlug: "school-supplies",
            slug: "school-backpacks",
        },
        { name: "Lunch Boxes", parentSlug: "school-supplies", slug: "lunch-boxes" },
        {
            name: "Art Supplies",
            parentSlug: "school-supplies",
            slug: "art-supplies",
        },
        {
            name: "Educational Materials",
            parentSlug: "school-supplies",
            slug: "educational-materials",
        },

        // ============================================
        // LEVEL 1: PET SUPPLIES (Department)
        // ============================================
        {
            name: "Pet Supplies",
            description: "Food and accessories for pets",
            slug: "pet-supplies",
        },

        // Level 2: Pet Supplies Categories
        { name: "Dog Supplies", parentSlug: "pet-supplies", slug: "dog-supplies" },
        { name: "Cat Supplies", parentSlug: "pet-supplies", slug: "cat-supplies" },
        { name: "Other Pets", parentSlug: "pet-supplies", slug: "other-pets" },

        // Level 3: Dog Supplies Subcategories
        { name: "Dog Food", parentSlug: "dog-supplies", slug: "dog-food" },
        { name: "Dog Toys", parentSlug: "dog-supplies", slug: "dog-toys" },
        {
            name: "Dog Accessories",
            parentSlug: "dog-supplies",
            slug: "dog-accessories",
        },
        { name: "Dog Grooming", parentSlug: "dog-supplies", slug: "dog-grooming" },

        // Level 3: Cat Supplies Subcategories
        { name: "Cat Food", parentSlug: "cat-supplies", slug: "cat-food" },
        { name: "Cat Litter", parentSlug: "cat-supplies", slug: "cat-litter" },
        { name: "Cat Toys", parentSlug: "cat-supplies", slug: "cat-toys" },
        {
            name: "Cat Accessories",
            parentSlug: "cat-supplies",
            slug: "cat-accessories",
        },

        // Level 3: Other Pets Subcategories
        { name: "Bird Supplies", parentSlug: "other-pets", slug: "bird-supplies" },
        {
            name: "Fish & Aquarium",
            parentSlug: "other-pets",
            slug: "fish-aquarium",
        },
        {
            name: "Small Animal Supplies",
            parentSlug: "other-pets",
            slug: "small-animal-supplies",
        },

        // ============================================
        // LEVEL 1: FOOD & BEVERAGES (Department)
        // ============================================
        {
            name: "Food & Beverages",
            description: "Groceries, snacks and beverages",
            slug: "food-beverages",
        },

        // Level 2: Food & Beverages Categories
        { name: "Groceries", parentSlug: "food-beverages", slug: "groceries" },
        {
            name: "Snacks & Treats",
            parentSlug: "food-beverages",
            slug: "snacks-treats",
        },
        { name: "Beverages", parentSlug: "food-beverages", slug: "beverages" },
        {
            name: "Baby Food & Formula",
            parentSlug: "food-beverages",
            slug: "baby-food-formula",
        },

        // Level 3: Groceries Subcategories
        { name: "Rice & Grains", parentSlug: "groceries", slug: "rice-grains" },
        { name: "Cooking Oil", parentSlug: "groceries", slug: "cooking-oil" },
        { name: "Pasta & Noodles", parentSlug: "groceries", slug: "pasta-noodles" },
        { name: "Canned Foods", parentSlug: "groceries", slug: "canned-foods" },

        // Level 3: Snacks & Treats Subcategories
        {
            name: "Chips & Crisps",
            parentSlug: "snacks-treats",
            slug: "chips-crisps",
        },
        {
            name: "Cookies & Biscuits",
            parentSlug: "snacks-treats",
            slug: "cookies-biscuits",
        },
        {
            name: "Candy & Chocolate",
            parentSlug: "snacks-treats",
            slug: "candy-chocolate",
        },
        {
            name: "Nuts & Dried Fruits",
            parentSlug: "snacks-treats",
            slug: "nuts-dried-fruits",
        },

        // Level 3: Beverages Subcategories
        { name: "Soft Drinks", parentSlug: "beverages", slug: "soft-drinks" },
        { name: "Juices", parentSlug: "beverages", slug: "juices" },
        { name: "Tea & Coffee", parentSlug: "beverages", slug: "tea-coffee" },
        { name: "Energy Drinks", parentSlug: "beverages", slug: "energy-drinks" },

        // Level 3: Baby Food & Formula Subcategories
        {
            name: "Infant Formula",
            parentSlug: "baby-food-formula",
            slug: "infant-formula",
        },
        {
            name: "Baby Cereals",
            parentSlug: "baby-food-formula",
            slug: "baby-cereals",
        },
        {
            name: "Baby Snacks",
            parentSlug: "baby-food-formula",
            slug: "baby-snacks",
        },

        // ============================================
        // LEVEL 1: INDUSTRIAL & SCIENTIFIC (Department)
        // ============================================
        {
            name: "Industrial & Scientific",
            description: "Professional tools and equipment",
            slug: "industrial-scientific",
        },

        // Level 2: Industrial & Scientific Categories
        {
            name: "Power Tools",
            parentSlug: "industrial-scientific",
            slug: "power-tools",
        },
        {
            name: "Hand Tools",
            parentSlug: "industrial-scientific",
            slug: "hand-tools",
        },
        {
            name: "Safety Equipment",
            parentSlug: "industrial-scientific",
            slug: "safety-equipment",
        },
        {
            name: "Electrical Equipment",
            parentSlug: "industrial-scientific",
            slug: "electrical-equipment",
        },

        // Level 3: Power Tools Subcategories
        { name: "Drills", parentSlug: "power-tools", slug: "drills" },
        { name: "Saws", parentSlug: "power-tools", slug: "saws" },
        { name: "Sanders", parentSlug: "power-tools", slug: "sanders" },
        { name: "Grinders", parentSlug: "power-tools", slug: "grinders" },

        // Level 3: Hand Tools Subcategories
        { name: "Hammers", parentSlug: "hand-tools", slug: "hammers" },
        { name: "Screwdrivers", parentSlug: "hand-tools", slug: "screwdrivers" },
        { name: "Wrenches", parentSlug: "hand-tools", slug: "wrenches" },
        { name: "Pliers", parentSlug: "hand-tools", slug: "pliers" },

        // Level 3: Safety Equipment Subcategories
        {
            name: "Safety Gloves",
            parentSlug: "safety-equipment",
            slug: "safety-gloves",
        },
        {
            name: "Safety Glasses",
            parentSlug: "safety-equipment",
            slug: "safety-glasses",
        },
        { name: "Hard Hats", parentSlug: "safety-equipment", slug: "hard-hats" },
        {
            name: "Safety Boots",
            parentSlug: "safety-equipment",
            slug: "safety-boots",
        },

        // Level 3: Electrical Equipment Subcategories
        {
            name: "Electrical Cables",
            parentSlug: "electrical-equipment",
            slug: "electrical-cables",
        },
        {
            name: "Circuit Breakers",
            parentSlug: "electrical-equipment",
            slug: "circuit-breakers",
        },
        {
            name: "Switches & Sockets",
            parentSlug: "electrical-equipment",
            slug: "switches-sockets",
        },
        {
            name: "Lighting Fixtures",
            parentSlug: "electrical-equipment",
            slug: "lighting-fixtures",
        },
    ];

    const createdCategories: { [slug: string]: any } = {};

    // Remove categories not in canonical list to enforce exact structure
    const canonicalSlugs = new Set(categories.map((c) => c.slug));
    const deleteResult = await Category.deleteMany({
        slug: { $nin: Array.from(canonicalSlugs) },
    });
    if (deleteResult.deletedCount > 0) {
        console.log(`🗑️  Removed ${deleteResult.deletedCount} obsolete categories\n`);
    }

    // First pass: Create Level 1 items (Departments) with no parentId
    console.log("📁 Creating Level 1 (Departments)...");
    let level1Count = 0;
    for (const c of categories) {
        if (!c.parentSlug) {
            const existing = await Category.findOne({ slug: c.slug });
            if (existing) {
                createdCategories[c.slug] = existing;
                console.log(`  ✓ ${c.name} (exists)`);
            } else {
                createdCategories[c.slug] = await Category.create({
                    name: c.name,
                    description: c.description,
                    slug: c.slug,
                });
                console.log(`  + ${c.name}`);
                level1Count++;
            }
        }
    }
    console.log(`\n✅ Level 1: ${level1Count} new departments created\n`);

    // Second pass: Create Level 2 & 3 with parentId reference
    console.log("📂 Creating Level 2 & 3 (Categories & Subcategories)...");
    let level2And3Count = 0;
    for (const c of categories) {
        if (c.parentSlug) {
            const parent =
                createdCategories[c.parentSlug] ||
                (await Category.findOne({ slug: c.parentSlug }));
            if (!parent) {
                console.warn(`  ⚠️  Parent not found for: ${c.name} (${c.parentSlug})`);
                continue;
            }
            const existing = await Category.findOne({ slug: c.slug });
            if (existing) {
                createdCategories[c.slug] = existing;
            } else {
                createdCategories[c.slug] = await Category.create({
                    name: c.name,
                    slug: c.slug,
                    parentId: parent.slug,
                });
                level2And3Count++;
            }
        }
    }
    console.log(`\n✅ Level 2 & 3: ${level2And3Count} new categories created\n`);

    // Summary
    const totalCategories = await Category.countDocuments();
    console.log("=".repeat(50));
    console.log(`🎉 Category seeding complete!`);
    console.log(`📊 Total categories in database: ${totalCategories}`);
    console.log("=".repeat(50));

    process.exit(0);
}

seedCategories().catch((error) => {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
});
