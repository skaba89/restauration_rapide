// Generate Menu Images for KFM DELICE using z-ai-web-dev-sdk
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/images/menu/kfm-delice';

// Menu images to generate - most popular dishes from each category
const MENU_IMAGES = [
  // PLATS IVOIRIENS
  {
    category: 'plats-ivoiriens',
    filename: 'attieke-poisson-grille.jpg',
    prompt: 'Professional food photography of Attieké Poisson Grillé, traditional Ivorian dish with grilled fish served on fermented cassava couscous with tomato sauce and fresh vegetables, on a rustic wooden plate, West African cuisine, appetizing, 4k food photography, studio lighting'
  },
  {
    category: 'plats-ivoiriens',
    filename: 'garba.jpg',
    prompt: 'Professional food photography of Garba, Ivorian street food with attieké (cassava couscous), fried fish, onions and spicy pepper, served on a plate, West African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-ivoiriens',
    filename: 'kedjenou-poulet.jpg',
    prompt: 'Professional food photography of Kedjenou de Poulet, Ivorian slow-cooked chicken in sealed pot with vegetables and spices, rich sauce, traditional African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-ivoiriens',
    filename: 'alloco-sauce-graine.jpg',
    prompt: 'Professional food photography of Alloco Sauce Graine, fried plantains with palm nut sauce and smoked fish, traditional Ivorian dish, colorful presentation, African cuisine, appetizing, 4k food photography'
  },
  
  // PLATS SÉNÉGALAIS
  {
    category: 'plats-senegalais',
    filename: 'thieboudienne.jpg',
    prompt: 'Professional food photography of Thieboudienne, Senegalese national dish, red rice with grilled fish and vegetables in rich tomato sauce, served in a large colorful bowl, African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-senegalais',
    filename: 'yassa-poulet.jpg',
    prompt: 'Professional food photography of Yassa Poulet, Senegalese grilled chicken marinated in lemon and caramelized onions, served with white rice, vibrant yellow sauce, African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-senegalais',
    filename: 'mafe.jpg',
    prompt: 'Professional food photography of Mafé, West African peanut butter stew with beef in rich creamy groundnut sauce, served with white rice, traditional African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-senegalais',
    filename: 'dibi.jpg',
    prompt: 'Professional food photography of Dibi, Senegalese grilled lamb with spicy mustard sauce, served with onions and french fries, African barbecue, appetizing, 4k food photography'
  },
  
  // PLATS GUINÉENS
  {
    category: 'plats-guineens',
    filename: 'konkoe.jpg',
    prompt: 'Professional food photography of Konkoé, traditional Guinean dish with cassava paste served with rich peanut sauce and fish, West African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-guineens',
    filename: 'poulet-yassa-guineen.jpg',
    prompt: 'Professional food photography of Poulet Yassa Guinéen, Guinean style marinated grilled chicken with caramelized onions and lemon, served with rice, African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-guineens',
    filename: 'fou-fou-guineen.jpg',
    prompt: 'Professional food photography of Fou Fou Guinéen, traditional Guinean fonio grain dish with peanut and vegetable stew, West African cuisine, appetizing, 4k food photography'
  },
  {
    category: 'plats-guineens',
    filename: 'poisson-braise-guineen.jpg',
    prompt: 'Professional food photography of Poisson Braisé Guinéen, whole grilled fish with Guinean spices and seasonings, served with attieké and vegetables, African cuisine, appetizing, 4k food photography'
  },
  
  // GRILLADES
  {
    category: 'grillades',
    filename: 'mix-grill.jpg',
    prompt: 'Professional food photography of African Mixed Grill platter with grilled chicken, beef, and lamb skewers, served with grilled vegetables and sauce, restaurant presentation, appetizing, 4k food photography'
  },
  {
    category: 'grillades',
    filename: 'poulet-braise.jpg',
    prompt: 'Professional food photography of Poulet Braisé, West African grilled half chicken with spicy marinade, golden crispy skin, served with plantains, appetizing, 4k food photography'
  },
  {
    category: 'grillades',
    filename: 'brochettes-boeuf.jpg',
    prompt: 'Professional food photography of West African beef brochettes, grilled skewered beef marinated in spices, served with onions and spicy sauce, street food style, appetizing, 4k food photography'
  },
  
  // FAST FOOD
  {
    category: 'fast-food',
    filename: 'burger-kfm.jpg',
    prompt: 'Professional food photography of African-style gourmet burger with juicy beef patty, special sauce, fresh vegetables, sesame bun, served with fries, restaurant presentation, appetizing, 4k food photography'
  },
  {
    category: 'fast-food',
    filename: 'chawarma-poulet.jpg',
    prompt: 'Professional food photography of Chicken Shawarma wrap, Middle Eastern-African fusion with grilled chicken, garlic sauce, pickles and vegetables in flatbread, appetizing, 4k food photography'
  },
  {
    category: 'fast-food',
    filename: 'tacos-kfm.jpg',
    prompt: 'Professional food photography of African-style tacos with spiced meat filling, fresh salsa, cheese and cream, fusion cuisine, restaurant presentation, appetizing, 4k food photography'
  },
  
  // ACCOMPAGNEMENTS
  {
    category: 'accompagnements',
    filename: 'alloco.jpg',
    prompt: 'Professional food photography of Alloco, West African fried ripe plantains, golden and crispy, served on a plate with spicy pepper sauce on side, appetizing, 4k food photography'
  },
  {
    category: 'accompagnements',
    filename: 'attieke.jpg',
    prompt: 'Professional food photography of Attieké, West African fermented cassava couscous, white grainy texture served in a bowl, traditional side dish, appetizing, 4k food photography'
  },
  
  // BOISSONS
  {
    category: 'boissons',
    filename: 'jus-bissap.jpg',
    prompt: 'Professional food photography of Bissap drink, West African hibiscus flower juice in a glass with ice, deep red color, refreshing, served with hibiscus flowers, appetizing, 4k food photography'
  },
  {
    category: 'boissons',
    filename: 'jus-gingembre.jpg',
    prompt: 'Professional food photography of Ginger juice, West African fresh ginger drink in a glass with ice, golden color, refreshing, with ginger root, appetizing, 4k food photography'
  },
  {
    category: 'boissons',
    filename: 'ataya.jpg',
    prompt: 'Professional food photography of Ataya, West African mint tea served in small glasses, green tea with fresh mint leaves, traditional tea ceremony, appetizing, 4k food photography'
  },
  
  // DESSERTS
  {
    category: 'desserts',
    filename: 'thiakry.jpg',
    prompt: 'Professional food photography of Thiakry, West African sweet millet pudding with yogurt and vanilla, served in a bowl with cinnamon sprinkle, traditional dessert, appetizing, 4k food photography'
  },
  {
    category: 'desserts',
    filename: 'fruits-saison.jpg',
    prompt: 'Professional food photography of West African fresh fruit platter with mango, pineapple, papaya, watermelon, banana, colorful tropical fruits, appetizing, 4k food photography'
  },
  
  // Category cover images
  {
    category: 'plats-ivoiriens',
    filename: 'category-cover.jpg',
    prompt: 'Ivorian cuisine collage showing attieké, grilled fish, alloco, and kedjenou, colorful West African food spread, professional food photography, appetizing'
  },
  {
    category: 'plats-senegalais',
    filename: 'category-cover.jpg',
    prompt: 'Senegalese cuisine collage showing thieboudienne, yassa, mafe, and dibi, colorful West African food spread, professional food photography, appetizing'
  },
  {
    category: 'plats-guineens',
    filename: 'category-cover.jpg',
    prompt: 'Guinean cuisine collage showing traditional dishes with peanut sauce, grilled fish, fonio, colorful West African food spread, professional food photography, appetizing'
  },
];

async function generateImages() {
  console.log('🍽️ KFM DELICE - Menu Image Generation\n');
  console.log('='.repeat(50));
  
  try {
    const zai = await ZAI.create();
    console.log('✅ Z-AI SDK initialized\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const image of MENU_IMAGES) {
      const categoryDir = path.join(OUTPUT_DIR, image.category);
      
      // Create directory if not exists
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      const outputPath = path.join(categoryDir, image.filename);
      
      // Skip if already exists
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping ${image.filename} (already exists)`);
        continue;
      }
      
      console.log(`🖼️  Generating: ${image.filename}`);
      console.log(`   Category: ${image.category}`);
      
      try {
        const response = await zai.images.generations.create({
          prompt: image.prompt,
          size: '1024x1024'
        });
        
        const imageBase64 = response.data[0].base64;
        const buffer = Buffer.from(imageBase64, 'base64');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`   ✅ Saved: ${outputPath}\n`);
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Generation Complete!');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📁 Output: ${OUTPUT_DIR}`);
    console.log('='.repeat(50) + '\n');
    
  } catch (error: any) {
    console.error('❌ Failed to initialize Z-AI SDK:', error.message);
    process.exit(1);
  }
}

// Run the script
generateImages();
