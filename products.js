const products = {

  blackJeans: {
    id: 'blackJeans',
    name: 'Classic Black Jeans',
    priceNow: 45,
    priceWas: 60,
    rating: 4.7,
    reviewCount: 32,
    images: [
      'img/pants/blackJeans.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A timeless straight-fit black jean, built for everyday wear with a clean, versatile look.',
    features: [
      { title: 'Premium Denim', text: 'Durable cotton-blend denim with a comfortable stretch.' },
      { title: 'Straight Fit', text: 'Classic straight leg cut, true to size.' },
      { title: 'Deep Black Wash', text: 'Fade-resistant dye for a long-lasting solid black finish.' }
    ],
    category: 'pants'
  },

  blackPants: {
    id: 'blackPants',
    name: 'Tailored Black Pants',
    priceNow: 50,
    priceWas: 65,
    rating: 4.6,
    reviewCount: 21,
    images: [
      'img/pants/blackPants.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'Smart-casual tailored pants in solid black, easy to dress up or down.',
    features: [
      { title: 'Tailored Fit', text: 'Structured cut through the hip and thigh, tapered leg.' },
      { title: 'Soft Fabric', text: 'Lightweight woven fabric with a smooth finish.' },
      { title: 'Versatile Style', text: 'Works for both casual and semi-formal outfits.' }
    ],
    category: 'pants'
  },

  blueJeans: {
    id: 'blueJeans',
    name: 'Light Wash Blue Jeans',
    bestSeller: true,
    priceNow: 45,
    priceWas: 60,
    rating: 4.8,
    reviewCount: 40,
    images: [
      'img/pants/blueJeans.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A relaxed, light-wash denim jean for an easygoing everyday look.',
    features: [
      { title: 'Light Wash Denim', text: 'Soft, broken-in feel with a faded blue finish.' },
      { title: 'Relaxed Fit', text: 'Roomy through the leg for all-day comfort.' },
      { title: 'Durable Stitching', text: 'Reinforced seams built to last.' }
    ],
    category: 'pants'
  },

  brownPants: {
    id: 'brownPants',
    name: 'Brown Tailored Pants',
    priceNow: 48,
    priceWas: 62,
    rating: 4.5,
    reviewCount: 18,
    images: [
      'img/pants/brownPants.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A rich brown tailored pant, perfect for a warm, earthy neutral look.',
    features: [
      { title: 'Tailored Fit', text: 'Clean, structured cut through the leg.' },
      { title: 'Warm Brown Tone', text: 'Deep, earthy brown that pairs well with neutrals.' },
      { title: 'Comfortable Waistband', text: 'Soft waistband construction for all-day wear.' }
    ],
    category: 'pants'
  },

  creamyPants: {
    id: 'creamyPants',
    name: 'Creamy Wide-Leg Pants',
    priceNow: 42,
    priceWas: 55,
    rating: 4.6,
    reviewCount: 15,
    images: [
      'img/pants/creamyyPants.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A soft cream wide-leg pant with a pleated front for a relaxed, elevated look.',
    features: [
      { title: 'Wide Leg Cut', text: 'Roomy, flowing silhouette from hip to hem.' },
      { title: 'Pleated Front', text: 'Structured pleats for a polished drape.' },
      { title: 'Lightweight Fabric', text: 'Breathable material, ideal for warmer days.' }
    ],
    category: 'pants'
  },

  greenMilitaryCargo: {
    id: 'greenMilitaryCargo',
    name: 'Green Military Cargo Pants',
    priceNow: 52,
    priceWas: 68,
    rating: 4.9,
    reviewCount: 27,
    images: [
      'img/pants/greenMilitaryCargo.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'Utility-inspired cargo pants in military green, built with functional pockets and a relaxed fit.',
    features: [
      { title: 'Cargo Pockets', text: 'Multiple utility pockets for practical everyday storage.' },
      { title: 'Military Green', text: 'Durable ripstop-style fabric in an olive tone.' },
      { title: 'Relaxed Fit', text: 'Roomy through the leg with an adjustable waist.' }
    ],
    category: 'pants'
  },

  greyJeans: {
    id: 'greyJeans',
    name: 'Grey Denim Jeans',
    priceNow: 45,
    priceWas: 60,
    rating: 4.6,
    reviewCount: 22,
    images: [
      'img/pants/greyJeans.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A versatile grey denim jean, a neutral alternative to classic blue.',
    features: [
      { title: 'Grey Wash Denim', text: 'Soft, faded grey tone for a modern neutral look.' },
      { title: 'Straight Fit', text: 'Classic straight leg, true to size.' },
      { title: 'Durable Denim', text: 'Sturdy cotton-blend fabric built to last.' }
    ],
    category: 'pants'
  },

  greyPants: {
    id: 'greyPants',
    name: 'Light Grey Tailored Pants',
    priceNow: 48,
    priceWas: 62,
    rating: 4.5,
    reviewCount: 19,
    images: [
      'img/pants/greyPants.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A light grey tailored pant with a clean, minimal look for smart-casual outfits.',
    features: [
      { title: 'Tailored Fit', text: 'Structured cut through the hip and leg.' },
      { title: 'Light Grey Tone', text: 'Soft neutral shade, easy to pair with anything.' },
      { title: 'Breathable Fabric', text: 'Lightweight material for everyday comfort.' }
    ],
    category: 'pants'
  },

  greyyPants: {
    id: 'greyyPants',
    name: 'Charcoal Grey Pants',
    priceNow: 48,
    priceWas: 62,
    rating: 4.6,
    reviewCount: 24,
    images: [
      'img/pants/greyyPants.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'A darker charcoal grey pant, tailored for a sharp, versatile look.',
    features: [
      { title: 'Tailored Fit', text: 'Structured through the leg with a clean finish.' },
      { title: 'Charcoal Tone', text: 'Deep grey shade, easy to dress up or down.' },
      { title: 'Durable Fabric', text: 'Sturdy weave built for everyday wear.' }
    ],
    category: 'pants'
  },

  whitePants: {
    id: 'whitePants',
    name: 'White Wide-Leg Pants',
    priceNow: 42,
    priceWas: 55,
    rating: 4.7,
    reviewCount: 16,
    images: [
      'img/pants/whitePants.webp'
    ],
    sizes: [30, 32, 34, 36, 38],
    shortDescription: 'Crisp white wide-leg pants for a clean, elevated summer look.',
    features: [
      { title: 'Wide Leg Cut', text: 'Relaxed, flowing silhouette from hip to hem.' },
      { title: 'Crisp White', text: 'Bright, clean tone for warm-weather styling.' },
      { title: 'Lightweight Fabric', text: 'Soft, breathable material ideal for summer.' }
    ],
    category: 'pants'
  },

  blackJacket: {
    id: 'blackJacket',
    name: 'Black Zip Jacket',
    priceNow: 65,
    priceWas: 85,
    rating: 4.8,
    reviewCount: 30,
    images: [
      'img/jackets/blackJacket.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A sleek black zip-up jacket, lightweight and versatile for everyday layering.',
    features: [
      { title: 'Full Zip Closure', text: 'Smooth front zipper for easy on-and-off wear.' },
      { title: 'Lightweight Build', text: 'Breathable fabric ideal for mild weather.' },
      { title: 'Classic Fit', text: 'Tailored silhouette that layers well over any outfit.' }
    ],
    category: 'jackets'
  },

  brownJacket: {
    id: 'brownJacket',
    name: 'Brown Overshirt Jacket',
    priceNow: 62,
    priceWas: 80,
    rating: 4.6,
    reviewCount: 21,
    images: [
      'img/jackets/brownJacket.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A warm brown overshirt-style jacket with a contrast collar for a relaxed layered look.',
    features: [
      { title: 'Overshirt Style', text: 'Button-down front, wearable open or fully closed.' },
      { title: 'Contrast Collar', text: 'Subtle two-tone detail at the collar.' },
      { title: 'Soft Woven Fabric', text: 'Comfortable mid-weight material for layering.' }
    ],
    category: 'jackets'
  },

  creamyJacket: {
    id: 'creamyJacket',
    name: 'Creamy Bomber Jacket',
    priceNow: 60,
    priceWas: 78,
    rating: 4.7,
    reviewCount: 18,
    images: [
      'img/jackets/creamyJacket.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A soft cream bomber jacket, a versatile neutral for casual outfits.',
    features: [
      { title: 'Bomber Silhouette', text: 'Ribbed collar, cuffs, and hem for a classic fit.' },
      { title: 'Neutral Cream Tone', text: 'Easy to pair with most colors.' },
      { title: 'Lightweight Layer', text: 'Ideal for transitional weather.' }
    ],
    category: 'jackets'
  },

  greyJacket: {
    id: 'greyJacket',
    name: 'Grey Zip Jacket',
    priceNow: 65,
    priceWas: 85,
    rating: 4.7,
    reviewCount: 25,
    images: [
      'img/jackets/greyJacket.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A clean grey zip jacket, a practical everyday layer with a minimal look.',
    features: [
      { title: 'Full Zip Closure', text: 'Easy front zipper with a stand collar.' },
      { title: 'Minimal Grey Tone', text: 'Neutral shade that pairs with anything.' },
      { title: 'Lightweight Fabric', text: 'Comfortable for year-round layering.' }
    ],
    category: 'jackets'
  },

  luxeBlueJacket: {
    id: 'luxeBlueJacket',
    name: 'Luxe Navy Blazer',
    priceNow: 90,
    priceWas: 120,
    rating: 4.9,
    reviewCount: 34,
    images: [
      'img/jackets/luxeBlueJacket.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A tailored navy blazer with a refined finish, perfect for smart-casual and formal looks.',
    features: [
      { title: 'Tailored Fit', text: 'Structured shoulders with a clean, fitted silhouette.' },
      { title: 'Premium Fabric', text: 'Smooth woven material with a subtle sheen.' },
      { title: 'Classic Navy', text: 'A versatile shade that pairs with most formalwear.' }
    ],
    category: 'jackets'
  },

  militaryGreenJacket: {
    id: 'militaryGreenJacket',
    name: 'Military Green Trench Coat',
    priceNow: 95,
    priceWas: 130,
    rating: 4.8,
    reviewCount: 20,
    images: [
      'img/jackets/militarygreenJacket.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A long military-green trench coat with a button-front closure for a bold, statement layer.',
    features: [
      { title: 'Long Trench Silhouette', text: 'Extended length for full coverage and style.' },
      { title: 'Button-Front Closure', text: 'Full button placket down the front.' },
      { title: 'Military Green', text: 'Rich olive tone with a heavyweight feel.' }
    ],
    category: 'jackets'
  },
  
  skySquarShirt: {
    id: 'skySquarShirt',
    name: 'Sky Blue Check Shirt',
    priceNow: 35,
    priceWas: 48,
    rating: 4.6,
    reviewCount: 19,
    images: [
      'img/shirts/SkySquarShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A light sky-blue checked shirt, soft and breathable for everyday wear.',
    features: [
      { title: 'Check Pattern', text: 'Classic light-blue and white checked weave.' },
      { title: 'Button-Down Collar', text: 'Clean collar structure for a neat look.' },
      { title: 'Breathable Fabric', text: 'Lightweight cotton blend, ideal for warm days.' }
    ],
    category: 'shirts'
  },

  luxeBlackShirt: {
    id: 'luxeBlackShirt',
    name: 'Luxe Black Turtleneck Sweater',
    priceNow: 52,
    priceWas: 68,
    rating: 4.9,
    reviewCount: 42,
    images: [
      'img/shirts/luxeBlackShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A refined black ribbed turtleneck sweater, designed for sophisticated layering and cold-weather style.',
    features: [
      { title: 'Fold-Over Turtleneck', text: 'Classic ribbed roll neck providing warmth and a structured silhouette.' },
      { title: 'Fine Ribbed Knit', text: 'Vertical rib-knit texture offering flex, comfort, and a flattering fit.' },
      { title: 'Premium Blend', text: 'Soft-touch knit material crafted for long-lasting wear without bulk.' }
    ],
    category: 'shirts'
  },

  brownShirt: {
    id: 'brownShirt',
    name: 'Brown Flannel Shirt',
    priceNow: 38,
    priceWas: 50,
    rating: 4.7,
    reviewCount: 22,
    images: [
      'img/shirts/brownShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A warm brown flannel shirt with dual chest pockets, built for cooler days.',
    features: [
      { title: 'Flannel Fabric', text: 'Soft brushed cotton for extra warmth.' },
      { title: 'Chest Pockets', text: 'Two functional button-flap pockets.' },
      { title: 'Solid Brown Tone', text: 'Rich earthy shade, easy to layer.' }
    ],
    category: 'shirts'
  },

  greenShirt: {
    id: 'greenShirt',
    name: 'Forest Green Shirt',
    priceNow: 36,
    priceWas: 48,
    rating: 4.6,
    reviewCount: 17,
    images: [
      'img/shirts/greenShirt(1).webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A solid forest green shirt, a versatile deep tone for layering or wearing alone.',
    features: [
      { title: 'Solid Green Tone', text: 'Rich, deep forest-green shade.' },
      { title: 'Classic Collar', text: 'Structured point collar for a clean finish.' },
      { title: 'Soft Cotton', text: 'Comfortable everyday fabric.' }
    ],
    category: 'shirts'
  },

  whiteShirt: {
    id: 'whiteShirt',
    name: 'Classic White Shirt',
    priceNow: 32,
    priceWas: 45,
    rating: 4.8,
    reviewCount: 40,
    images: [
      'img/shirts/whiteShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A crisp classic white shirt, a wardrobe essential for any occasion.',
    features: [
      { title: 'Crisp White', text: 'Clean, bright tone that pairs with everything.' },
      { title: 'Classic Fit', text: 'Structured, timeless silhouette.' },
      { title: 'Breathable Cotton', text: 'Soft, lightweight fabric for all-day comfort.' }
    ],
    category: 'shirts'
  },

  oliveGreenShirt: {
    id: 'oliveGreenShirt',
    name: 'Olive Green Shirt',
    priceNow: 34,
    priceWas: 46,
    rating: 4.5,
    reviewCount: 14,
    images: [
      'img/shirts/olliveGreenShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A muted olive green shirt, an earthy neutral for casual layering.',
    features: [
      { title: 'Olive Tone', text: 'Muted earthy green, easy to pair.' },
      { title: 'Relaxed Fit', text: 'Comfortable, easy-wearing silhouette.' },
      { title: 'Soft Fabric', text: 'Lightweight cotton blend.' }
    ],
    category: 'shirts'
  },

  redShirt: {
    id: 'redShirt',
    name: 'Red Plaid Shirt',
    priceNow: 36,
    priceWas: 48,
    rating: 4.6,
    reviewCount: 20,
    images: [
      'img/shirts/red.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A classic red and cream plaid shirt, a bold statement layer for cooler days.',
    features: [
      { title: 'Plaid Pattern', text: 'Bold red and cream check weave.' },
      { title: 'Button-Down Front', text: 'Full button closure with chest pocket.' },
      { title: 'Warm Fabric', text: 'Cozy mid-weight material.' }
    ],
    category: 'shirts'
  },

  fancyGreenShirt: {
    id: 'fancyGreenShirt',
    name: 'Fancy Green Knit Cardigan',
    priceNow: 45,
    priceWas: 60,
    rating: 4.8,
    reviewCount: 18,
    images: [
      'img/shirts/fancyGreenShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A sleek, deep green V-neck knit cardigan—the perfect balance of cozy comfort and elevated style.',
    features: [
      { title: 'V-Neck Design', text: 'Classic five-button front closure with a deep V-neckline.' },
      { title: 'Fine-Gauge Knit', text: 'Ultra-soft, lightweight knit fabric for effortless layering.' },
      { title: 'Ribbed Details', text: 'Ribbed sleeve cuffs and bottom hem for a clean, tailored fit.' }
    ],
    category: 'shirts'
  },

  blackShirt: {
    id: 'blackShirt',
    name: 'Black Half-Zip Sweatshirt',
    priceNow: 42,
    priceWas: 55,
    rating: 4.7,
    reviewCount: 34,
    images: [
      'img/shirts/blackShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A sleek black quarter-zip sweatshirt featuring a high collar and a relaxed, casual fit for daily wear.',
    features: [
      { title: 'Half-Zip Closure', text: 'Metallic front zipper with a sturdy stand collar.' },
      { title: 'Relaxed Fit', text: 'Dropped shoulders and easy silhouette for versatile layering.' },
      { title: 'Ribbed Trims', text: 'Comfortable ribbed cuffs and hem to lock in warmth.' }
    ],
    category: 'shirts'
  },

  blueSquarShirt: {
    id: 'blueSquarShirt',
    name: 'Blue Check Shirt',
    priceNow: 35,
    priceWas: 47,
    rating: 4.6,
    reviewCount: 18,
    images: [
      'img/shirts/blueSquarShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A blue and white checked shirt, a versatile everyday layer.',
    features: [
      { title: 'Check Pattern', text: 'Classic blue and white checked weave.' },
      { title: 'Button-Down Collar', text: 'Structured collar for a clean look.' },
      { title: 'Breathable Fabric', text: 'Soft cotton blend for everyday comfort.' }
    ],
    category: 'shirts'
  },

  blackSquarShirt: {
    id: 'blackSquarShirt',
    name: 'Black Buffalo Check Shirt',
    priceNow: 38,
    priceWas: 50,
    rating: 4.8,
    reviewCount: 26,
    images: [
      'img/shirts/blackSquarShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A bold black and white buffalo check shirt, a strong statement piece for layering.',
    features: [
      { title: 'Buffalo Check', text: 'Bold black and white checked pattern.' },
      { title: 'Button-Down Front', text: 'Classic full-button closure.' },
      { title: 'Sturdy Fabric', text: 'Durable mid-weight cotton weave.' }
    ],
    category: 'shirts'
  },

  superDadShirt: {
    id: 'superDadShirt',
    name: 'Super Dad Graphic Oversized Tee',
    bestSeller: true,
    priceNow: 26,
    priceWas: 35,
    rating: 4.9,
    reviewCount: 19,
    images: [
      'img/T-shirts/superDadShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A comfortable cream-colored oversized tee featuring a heartwarming "Super Dad" father-and-son illustration.',
    features: [
      { title: 'Front Graphic Print', text: 'Detailed illustration of a father hugging his child under cursive and block "Super DAD" text.' },
      { title: 'Relaxed Fit', text: 'Unisex oversized silhouette with dropped shoulders for all-day casual wear.' },
      { title: 'Soft Cotton Jersey', text: 'Breathable, mid-weight cream cotton fabric with a smooth feel.' }
    ],
    category: 'T-shirts'
  },

  nikeBlackChainShirt: {
    id: 'nikeBlackChainShirt',
    name: 'Black Swoosh Chain Graphic Tee',
    bestSeller: true,
    priceNow: 32,
    priceWas: 42,
    rating: 4.8,
    reviewCount: 38,
    images: [
      'img/T-shirts/nikeBlackChainShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A streetwear black t-shirt featuring a centered white swoosh logo and a gold chain accent along the collar.',
    features: [
      { title: 'Center Swoosh', text: 'Minimalist white embroidered swoosh positioned dead-center on the chest.' },
      { title: 'Chain Collar Detail', text: 'Gold-tone chain graphic print along the crew neckline for an edgy look.' },
      { title: 'Relaxed Fit', text: 'Boxy cut with rolled-cuff short sleeves for a casual, comfortable drape.' }
    ],
    category: 'T-shirts'
  },

  athletics23Shirt: {
    id: 'athletics23Shirt',
    name: 'Athletics 23 Graphic Boxy Tee',
    priceNow: 30,
    priceWas: 40,
    rating: 4.6,
    reviewCount: 22,
    images: [
      'img/T-shirts/athletics23Shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A white oversized graphic tee featuring varsity-style "23 Athletics" chest typography and sleeve star accents.',
    features: [
      { title: 'Varsity Prints', text: 'Bold "23" front number graphic with star motifs and sleeve prints.' },
      { title: 'Boxy Silhouette', text: 'Relaxed streetwear fit with dropped shoulders and wide sleeves.' },
      { title: 'Mid-Weight Cotton', text: 'Comfortable, durable cotton jersey structured to hold its shape.' }
    ],
    category: 'T-shirts'
  },

  bostonBeigeShirt: {
    id: 'bostonBeigeShirt',
    name: 'Boston Graphic Oversized Tee',
    priceNow: 28,
    priceWas: 38,
    rating: 4.7,
    reviewCount: 51,
    images: [
      'img/T-shirts/bostonBeigeShirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A relaxed beige graphic t-shirt featuring bold collegiate-style "BOSTON" lettering across the chest.',
    features: [
      { title: 'Collegiate Print', text: 'Classic arched "BOSTON EST. 1912" front graphic in crisp black typography.' },
      { title: 'Oversized Fit', text: 'Dropped shoulders and boxy silhouette for a casual streetwear look.' },
      { title: 'Soft Cotton Fabric', text: 'Breathable, mid-weight cotton knit designed for all-day comfort.' }
    ],
    category: 'T-shirts'
  },

  blackTshirt: {
    id: 'blackTshirt',
    name: 'Black Crew Neck T-Shirt',
    priceNow: 20,
    priceWas: 28,
    rating: 4.7,
    reviewCount: 45,
    images: [
      'img/T-shirts/blackT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A classic black crew neck tee, a simple everyday essential.',
    features: [
      { title: 'Crew Neck', text: 'Classic round neckline, ribbed for structure.' },
      { title: 'Solid Black', text: 'Versatile shade that pairs with anything.' },
      { title: 'Soft Cotton', text: 'Lightweight, breathable everyday fabric.' }
    ],
    category: 'T-shirts'
  },

  blancoTshirt: {
    id: 'blancoTshirt',
    name: 'Ribbed Cream T-Shirt',
    priceNow: 22,
    priceWas: 30,
    rating: 4.6,
    reviewCount: 24,
    images: [
      'img/T-shirts/blancoT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A ribbed cream t-shirt with a slightly textured knit for a more elevated basic.',
    features: [
      { title: 'Ribbed Knit', text: 'Subtle ribbed texture for added structure.' },
      { title: 'Cream Tone', text: 'Soft neutral shade, easy to layer.' },
      { title: 'Relaxed Fit', text: 'Comfortable everyday silhouette.' }
    ],
    category: 'T-shirts'
  },

  creamyTshirt: {
    id: 'creamyTshirt',
    name: 'Creamy Ribbed Polo Tee',
    priceNow: 26,
    priceWas: 35,
    rating: 4.7,
    reviewCount: 20,
    images: [
      'img/T-shirts/creamyT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A ribbed cream polo-style tee, elevated with a collared neckline.',
    features: [
      { title: 'Polo Collar', text: 'Structured collar with a short button placket.' },
      { title: 'Ribbed Texture', text: 'Fine ribbed knit fabric throughout.' },
      { title: 'Cream Tone', text: 'Soft neutral shade, easy to style.' }
    ],
    category: 'T-shirts'
  },

  creamyyTshirt: {
    id: 'creamyyTshirt',
    name: 'Creamy Collared Ribbed Tee',
    priceNow: 26,
    priceWas: 35,
    rating: 4.6,
    reviewCount: 16,
    images: [
      'img/T-shirts/creamyyyT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A collared ribbed tee in a soft cream tone, similar to the polo style with a relaxed drape.',
    features: [
      { title: 'Collared Neckline', text: 'Open collar for a relaxed, elevated look.' },
      { title: 'Ribbed Knit', text: 'Textured fabric with a soft hand feel.' },
      { title: 'Cream Tone', text: 'Neutral shade, easy to pair.' }
    ],
    category: 'T-shirts'
  },

  eternalTshirt: {
    id: 'eternalTshirt',
    name: '"Eternal" Graphic T-Shirt',
    priceNow: 24,
    priceWas: 32,
    rating: 4.8,
    reviewCount: 30,
    images: [
      'img/T-shirts/EternalT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A brown graphic tee featuring bold "Eternal" text print, a streetwear statement piece.',
    features: [
      { title: 'Graphic Print', text: 'Bold "Eternal" text print across the chest.' },
      { title: 'Brown Tone', text: 'Warm earthy shade with a vintage feel.' },
      { title: 'Relaxed Fit', text: 'Streetwear-inspired loose silhouette.' }
    ],
    category: 'T-shirts'
  },

  greenTshirt: {
    id: 'greenTshirt',
    name: 'Green Ribbed Polo Tee',
    priceNow: 26,
    priceWas: 35,
    rating: 4.6,
    reviewCount: 19,
    images: [
      'img/T-shirts/greenT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A ribbed polo-style tee in olive green, a textured take on a classic staple.',
    features: [
      { title: 'Polo Collar', text: 'Structured collar with a short button placket.' },
      { title: 'Ribbed Texture', text: 'Fine ribbed knit fabric throughout.' },
      { title: 'Olive Green Tone', text: 'Earthy shade, easy to layer.' }
    ],
    category: 'T-shirts'
  },

  jungelGreenTshirt: {
    id: 'jungelGreenTshirt',
    name: 'Jungle Green Polo Tee',
    bestSeller: true,
    priceNow: 28,
    priceWas: 36,
    rating: 4.7,
    reviewCount: 22,
    images: [
      'img/T-shirts/jungelGreenT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A deep jungle-green ribbed polo tee, a richer tone than the standard green option.',
    features: [
      { title: 'Polo Collar', text: 'Structured collar with a short button placket.' },
      { title: 'Ribbed Texture', text: 'Fine ribbed knit fabric throughout.' },
      { title: 'Deep Green Tone', text: 'Rich jungle-green shade.' }
    ],
    category: 'T-shirts'
  },

  whiteTshirt: {
    id: 'whiteTshirt',
    name: 'Classic White T-Shirt',
    bestSeller: true,
    priceNow: 20,
    priceWas: 28,
    rating: 4.8,
    reviewCount: 50,
    images: [
      'img/T-shirts/WhiteT-shirt.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    shortDescription: 'A crisp classic white crew neck tee, a wardrobe essential.',
    features: [
      { title: 'Crew Neck', text: 'Classic round neckline, ribbed for structure.' },
      { title: 'Crisp White', text: 'Clean tone that pairs with everything.' },
      { title: 'Soft Cotton', text: 'Lightweight, breathable everyday fabric.' }
    ],
    category: 'T-shirts'
  },



  jordan4: {
    id: 'jordan4',
    name: 'Air Jordan 4 Retro "Military Black"',
    bestSeller: true,
    priceNow: 120,
    priceWas: 180,
    rating: 5,
    reviewCount: 9,
    images: [
      'img/shoes/Airjordan4MilitaryBlack.png'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A monochromatic, high-contrast take on an iconic silhouette, combining smooth white leather, neutral grey suede, and bold black accents.',
    features: [
      { title: 'Premium Build', text: 'Smooth white leather upper with a neutral grey suede toe panel.' },
      { title: 'Signature Accents', text: 'Distinctive black molded TPU wings, eyelets, and rear heel tab.' },
      { title: 'Breathable Panels', text: 'Classic quarter-panel netting for maximum ventilation.' },
      { title: 'Cushioned Ride', text: 'Visible heel Air-sole unit for lightweight comfort.' },
      { title: 'Herringbone Grip', text: 'Durable rubber outsole providing classic multidirectional traction.' }
    ],
    category: 'shoes'
  },

  jordan4RedThunder: {
    id: 'jordan4RedThunder',
    name: 'Air Jordan 4 "Red Thunder"',
    priceNow: 130,
    priceWas: 190,
    rating: 4.9,
    reviewCount: 14,
    images: [
      'img/shoes/Airjordan4RedThunder.png'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A bold black and red colorway of the iconic Air Jordan 4 silhouette.',
    features: [
      { title: 'Premium Build', text: 'Black leather and mesh upper with red accents.' },
      { title: 'Signature Accents', text: 'Molded TPU wings and eyelets in contrast red.' },
      { title: 'Breathable Panels', text: 'Classic quarter-panel netting for ventilation.' },
      { title: 'Cushioned Ride', text: 'Visible heel Air-sole unit for comfort.' }
    ],
    category: 'shoes'
  },

  brownAirJordan: {
    id: 'brownAirJordan',
    name: 'Air Jordan 1 "Mocha"',
    priceNow: 125,
    priceWas: 175,
    rating: 4.9,
    reviewCount: 27,
    images: [
      'img/shoes/BrownAirJordan.webp'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A rich brown and cream colorway of the classic Air Jordan 1 high-top silhouette.',
    features: [
      { title: 'Leather Upper', text: 'Premium leather construction in a brown and cream tone.' },
      { title: 'High-Top Silhouette', text: 'Classic ankle-cut design with padded collar.' },
      { title: 'Rubber Outsole', text: 'Durable traction pattern for everyday wear.' }
    ],
    category: 'shoes'
  },

  adidasSambaWhite: {
    id: 'adidasSambaWhite',
    name: 'Adidas Samba OG White',
    priceNow: 85,
    priceWas: 100,
    rating: 4.9,
    reviewCount: 60,
    images: [
      'img/shoes/adidasSambaCouldWhite.png'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A clean white colorway of the timeless adidas Samba, a streetwear staple.',
    features: [
      { title: 'Leather Upper', text: 'Smooth white leather with classic three-stripe branding.' },
      { title: 'Gum Outsole', text: 'Signature rubber gum sole with iconic traction pattern.' },
      { title: 'Classic Silhouette', text: 'Timeless low-top design, true to size.' }
    ],
    category: 'shoes'
  },

  adidasSambaBlack: {
    id: 'adidasSambaBlack',
    name: 'Adidas Samba Cloud Black',
    priceNow: 85,
    priceWas: 100,
    rating: 4.9,
    reviewCount: 55,
    images: [
      'img/shoes/adidasSambaCloudBlack.webp'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'The classic adidas Samba in a sleek all-black colorway.',
    features: [
      { title: 'Leather Upper', text: 'Smooth black leather with tonal three-stripe branding.' },
      { title: 'Gum Outsole', text: 'Signature rubber gum sole with iconic traction pattern.' },
      { title: 'Classic Silhouette', text: 'Timeless low-top design, true to size.' }
    ],
    category: 'shoes'
  },

  greenAirForce: {
    id: 'greenAirForce',
    name: 'Nike Air Force 1 Green',
    priceNow: 90,
    priceWas: 110,
    rating: 4.7,
    reviewCount: 33,
    images: [
      'img/shoes/greenAirForce.webp'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A fresh green and white Air Force 1, a modern twist on the classic silhouette.',
    features: [
      { title: 'Leather Upper', text: 'Crisp white leather with green accent overlays.' },
      { title: 'Air-Sole Cushioning', text: 'Visible heel Air unit for lightweight comfort.' },
      { title: 'Rubber Outsole', text: 'Durable pivot points for traction and comfort.' }
    ],
    category: 'shoes'
  },

  luxeShoeBrown: {
    id: 'luxeShoeBrown',
    name: 'Luxe Leather Loafers',
    priceNow: 110,
    priceWas: 150,
    rating: 4.8,
    reviewCount: 12,
    images: [
      'img/shoes/luxeShoe.webp'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'Premium black leather loafers with a horsebit detail, built for a refined formal look.',
    features: [
      { title: 'Premium Leather', text: 'Smooth, high-shine black leather construction.' },
      { title: 'Horsebit Detail', text: 'Classic metal hardware accent on the vamp.' },
      { title: 'Leather Sole', text: 'Refined leather outsole for a formal finish.' }
    ],
    category: 'shoes'
  },

  luxeWhiteBlackShoe: {
    id: 'luxeWhiteBlackShoe',
    name: 'Two-Tone Leather Loafers',
    priceNow: 110,
    priceWas: 150,
    rating: 4.7,
    reviewCount: 10,
    images: [
      'img/shoes/luxeWHBLAShoe.webp'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A striking two-tone white and black leather loafer for a bold formal statement.',
    features: [
      { title: 'Premium Leather', text: 'Contrast white and black leather panels.' },
      { title: 'Horsebit Detail', text: 'Classic metal hardware accent on the vamp.' },
      { title: 'Leather Sole', text: 'Refined leather outsole for a formal finish.' }
    ],
    category: 'shoes'
  },

  airForce1: {
    id: 'airForce1',
    name: 'Nike Air Force 1 White',
    bestSeller: true,
    priceNow: 90,
    priceWas: 110,
    rating: 4.9,
    reviewCount: 70,
    images: [
      'img/shoes/AirForce1.png'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'The all-time classic all-white Air Force 1, a wardrobe essential.',
    features: [
      { title: 'Leather Upper', text: 'Crisp white leather construction.' },
      { title: 'Air-Sole Cushioning', text: 'Visible heel Air unit for lightweight comfort.' },
      { title: 'Rubber Outsole', text: 'Durable pivot points for traction and comfort.' }
    ],
    category: 'shoes'
  },

  genericSneaker: {
    id: 'genericSneaker',
    name: 'Classic White Sneakers',
    priceNow: 49.99,
    priceWas: null,
    rating: 4.8,
    reviewCount: 243,
    images: [
      'img/shoes/shoes.webp'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A clean, minimal white sneaker that pairs with everything.',
    features: [
      { title: 'Leather Upper', text: 'Smooth white leather construction.' },
      { title: 'Cushioned Insole', text: 'Comfortable everyday support.' },
      { title: 'Rubber Outsole', text: 'Flexible traction sole for daily wear.' }
    ],
    category: 'shoes'
  },

  newBalance530: {
    id: 'newBalance530',
    name: 'New Balance 530',
    bestSeller: true,
    priceNow: 95,
    priceWas: 120,
    rating: 4.8,
    reviewCount: 41,
    images: [
      'img/shoes/newBalance530.png'
    ],
    sizes: [40, 41, 42, 43, 44],
    shortDescription: 'A retro-inspired running silhouette in a clean white colorway.',
    features: [
      { title: 'Mesh & Leather Upper', text: 'Breathable mesh with leather overlays.' },
      { title: 'ABZORB Cushioning', text: 'Responsive midsole cushioning for comfort.' },
      { title: 'Retro Silhouette', text: 'Classic 2000s running shoe design.' }
    ],
    category: 'shoes'
  },

  whiteNavySneakers: {
    id: 'whiteNavySneakers',
    name: 'Chunky Retro Runner Sneakers',
    priceNow: 65,
    priceWas: 85,
    rating: 4.8,
    reviewCount: 29,
    images: [
      'img/shoes/whiteNavySneakers.webp'
    ],
    sizes: ['40', '41', '42', '43', '44', '45'],
    shortDescription: 'Modern chunky sneakers featuring a breathable mesh upper with bold navy accents and a sculpted platform sole.',
    features: [
      { title: 'Chunky Platform Sole', text: 'Sculpted thick rubber outsole providing high impact cushioning and traction.' },
      { title: 'Mixed-Material Upper', text: 'Combination of breathable mesh, synthetic leather, and suede overlays.' },
      { title: 'Padded Comfort', text: 'Cushioned heel collar and dual pull tabs for effortless entry.' }
    ],
    category: 'shoes'
  },

  blackPennyLoafers: {
    id: 'blackPennyLoafers',
    name: 'Chunky Lug-Sole Penny Loafers',
    priceNow: 78,
    priceWas: 98,
    rating: 4.9,
    reviewCount: 36,
    images: [
      'img/shoes/blackPennyLoafers.webp'
    ],
    sizes: ['40', '41', '42', '43', '44', '45'],
    shortDescription: 'Classic black leather penny loafers reimagined with a rugged lug sole for a modern, edgy edge.',
    features: [
      { title: 'Polished Leather Upper', text: 'Smooth, high-shine leather finish with traditional saddle strap detailing.' },
      { title: 'Chunky Lug Sole', text: 'Durable rubber tread outsole offering excellent grip and elevated height.' },
      { title: 'Moccasin Toe Stitching', text: 'Hand-stitched aprontoe construction for enduring structure and classic style.' }
    ],
    category: 'shoes'
  },
};


const outfits = {
  CoastalWhiteFit: {
    pieces: ['whiteShirt', 'whiteTshirt', 'blueJeans', 'airForce1']
  },
  CasualLuxuryFit: {
    pieces: ['jungelGreenTshirt', 'whitePants', 'greenAirForce']
  },
  WarmNeutralFit: {
    pieces: ['creamyyTshirt', 'creamyPants', 'genericSneaker']
  },
  WeekendBlueCombo: {
    pieces: ['skySquarShirt', 'whiteTshirt', 'blackJeans', 'airForce1']
  },
  CampusSoftLayer: {
    pieces: ['fancyGreenShirt', 'whiteTshirt', 'greyJeans', 'airForce1']
  },
  ModernClassicSet: {
    pieces: ['creamyTshirt', 'greyPants', 'luxeShoeBrown']
  },
  ModernMinimalist: {
    pieces: ['whiteTshirt', 'greyyPants', 'genericSneaker']
  },
  SleekQuarter: {
    pieces: ['blackShirt', 'blackTshirt', 'blueJeans', 'adidasSambaBlack']
  },
  CargoChillFit: {
    pieces: ['eternalTshirt', 'greenMilitaryCargo', 'brownAirJordan']
  },
  UrbanTailoredFit: {
    pieces: ['luxeBlackShirt', 'greyyPants', 'genericSneaker']
  },
  OliveLinenElegance: {
    pieces: ['oliveGreenShirt', 'whitePants', 'luxeWhiteBlackShoe']
  },
  StreetUtilityFit: {
    pieces: ['greenShirt', 'whiteTshirt', 'greyJeans', 'airForce1']
  }
};