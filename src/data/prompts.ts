import { PromptItem } from '../types';

const premiumDetailingImg = require('../assets/images/premium_detailing/premium_detailing.jpg');
const beforeEnhancementImg = require('../assets/images/premium_detailing/before.jpg');
const afterEnhancementImg = require('../assets/images/premium_detailing/after.jpg');
const cinematicNoirImg = require('../assets/images/cinematic_noir/cinematic_noir.jpg');
const bwFashionStudioImg = require('../assets/images/bw_fashion_studio/bw_fashion_studio.png');
const wastelandSurvivorImg = require('../assets/images/wasteland_survivor/wasteland_survivor.jpg');
const diagonalSunlightImg = require('../assets/images/diagonal_sunlight_portrait/diagonal_sunlight_portrait.png');
const watercolorSketchImg = require('../assets/images/watercolor_sketch_portrait/watercolor_sketch_portrait.jpg');
const moodyCinematicImg = require('../assets/images/moody_cinematic_portrait/moody_cinematic_portrait.png');
const pixarNeonImg = require('../assets/images/pixar_neon_character/pixar_neon_character.jpg');
const gtaIvConceptImg = require('../assets/images/gta_iv_concept/gta_iv.png');
const rdr2RemakeImg = require('../assets/images/rdr2_remake/rdr2_remake.jpg');
const minecraftCloneImg = require('../assets/images/minecraft_clone/minecraft_clone.jpg');
const soloMinecraftTextureImg = require('../assets/images/solo_minecraft_texture/solo_minecraft_texture.jpg');
const minecraftSnowboardImg = require('../assets/images/minecraft_snowboard/minecraft_snowboard.jpg');
const goldenGreenRimImg = require('../assets/images/golden_green_rim_portrait/golden_green_rim_portrait.jpg');

export const CATEGORIES = [
  'Tümü',
  'Görsel',
];

// Marka renk sistemi — mor-mavi YOK
// Ana: Amber (#F59E0B) | Nötr: Slate (#1E293B) | Vurgu: Teal (#0D9488)
export const CATEGORY_PALETTE: Record<string, [string, string, string]> = {
  'Görsel': ['#F59E0B', '#D97706', '#92400E'],
  'Tümü': ['#64748B', '#475569', '#334155'],
};

export const PROMPTS: PromptItem[] = [
  // ── Görsel ──────────────────────────────────────────────────────────────────
  {
    id: 'img-1',
    title: 'Premium Görsel İyileştirme',
    prompt:
      'Ultra-premium professional image enhancement. Transform the uploaded low-quality, blurry, underexposed or overexposed image into extreme high-detail cinematic quality. Preserve 100% original identity, face structure, expression, pose, clothing, accessories, background, framing, and composition. Do NOT alter, redesign, replace, or add anything. Recover micro-details: sharp facial features natural skin texture visible pores realistic hair strands crisp eyes clean refined edges High-contrast clarity, deep depth, and balanced cinematic lighting. Poster-grade realism with dramatic but accurate detail. Output in 8K resolution, ProRes quality, studio-level sharpness. Photorealistic textures only. True-to-source enhancement only. Keep everything exactly the same — only enhance quality.',
    category: 'Görsel',
    tags: ['görsel iyileştirme', '8K', 'sinematik', 'upscale', 'fotogerçekçi'],
    emoji: 'P',
    gradient: ['#1a1a2e', '#16213e'],
    imageSource: premiumDetailingImg,
    beforeImage: beforeEnhancementImg,
    afterImage: afterEnhancementImg,
  },
  {
    id: 'img-2',
    title: 'Dramatik Tungsten & Kahve Noir Portre',
    prompt:
      'Bu görüntüyü, 64K DSLR ile çekilmiş, karanlık bir odada tek başına oturan gizemli bir genç adamın, tek bir sıcak tungsten ışık kaynağı altında dramatik bir yan profilden çekilmiş, ultra gerçekçi ve ultra sinematik bir düşük ışıklı noir fotoğrafına dönüştürün. Model, ışık kaynağının biraz altında konumlanmış, başını dik tutarak geriye yaslanmış ve iki eliyle göğsüne yakın tuttuğu buharı tüten bir fincan sıcak kahveyle poz veriyor. Kahve buharının ince girdapları ışık huzmesine doğru yükseliyor ve hafif bir atmosferik pusla karışarak melankolik bir sinematik ambiyans yaratıyor. Yüzü şimdi yumuşak, sinematik bir ışıkla kısmen aydınlatılmış ve güzel yüz hatları açıkça ortaya çıkıyor. Modelin yanlarda hafifçe kesilmiş, dağınık koyu saçları var; bol, büyük beden, vintage tarzı beyaz bir gömlek giyiyor, kumaşta belirgin kırışıklıklar var, üst kısmı açık, yumuşak kırışıklıkları ve kısmen kıvrılmış kolları ile rahat ve melankolik bir görünüm sergiliyor. Gömleği, yukarıdan gelen ışığın hafif, sıcak yansımalarını gösterirken, vücudunun büyük bir kısmı neredeyse tamamen karanlığa gömülüyor. Genel duruş, yalnızlığı, içe dönüklüğü, duygusal tükenmişliği, sessiz direnci ve sinematik gerilimi iletiyor. Aydınlatma son derece dramatik ve minimalist olup, çerçevenin sağ üst köşesine yerleştirilmiş tek, yoğun, kehribar sarısı tungsten lambayı içeriyor. Lamba, karanlığı çapraz olarak kesen güçlü bir yönlü ışın yayarak, derin siyahlar ve sıcak altın yansımalarla yoğun bir chiaroscuro kontrastı oluşturuyor. Özne ağırlıklı olarak arkadan aydınlatılıyor, bu da saç, omuzlar ve fincanı tutan parmakların etrafında ince kontur aydınlatmasıyla güçlü bir silüet etkisi yaratıyor. Kahve buharı sadece sıcak ışığın üzerine düştüğü yerlerde görünür hale geliyor ve havada narin dalgalanma desenleri oluşturuyor. Ortam kasıtlı olarak karanlık ve belirsiz olup, loş ışıklı eski bir daireyi, yeraltı bir caz kafesini, noir tarzı bir yatak odasını veya melankolik bir sinematik iç mekanı andırıyor. Arka plan neredeyse tamamen siyah olup, yumuşak analog gren ve hafif atmosferik pus ile yalnızlığı ve duygusal derinliği vurgulamaktadır.',
    category: 'Görsel',
    tags: ['noir', 'tungsten', 'sinematik', 'chiaroscuro', 'düşük ışık', 'dslr'],
    emoji: '✦',
    gradient: ['#12100E', '#2B1B17'],
    imageSource: cinematicNoirImg,
  },
  {
    id: 'img-3',
    title: 'Siyah Beyaz Stüdyo Moda Portresi',
    prompt:
      'Black-and-white fashion photo of a man seated on a simple metal stool in a white studio. He wears a clothing_color t-shirt, clothing_color trousers, and black boots. One leg is extended straight toward the camera with the boot sole dominating the foreground, the other leg bent. Hands rest loosely on thighs, torso relaxed, low-angle wide-lens perspective.\n\nImage 2: High-contrast black-and-white studio photo of a man seated on the floor wearing a clothing_color sweater, clothing_color trousers, and black leather ankle boots. Legs are bent and open toward the camera, with one boot sole prominently facing the lens. Upper body slightly reclined, calm expression. Clean background_type, dramatic low-angle composition. Don\'t change the face. (Use the attached image)',
    category: 'Görsel',
    tags: ['siyah beyaz', 'moda', 'stüdyo', 'low-angle', 'kontrast', 'fotogerçekçi'],
    emoji: '✦',
    gradient: ['#18181B', '#27272A'],
    imageSource: bwFashionStudioImg,
  },
  {
    id: 'img-4',
    title: 'Mad Max Çöl Savaşçısı & Sinematik Film Karesi',
    prompt:
      'Photorealistic cinematic film still, live-action (no CGI). Preserve the subject\'s identity exactly from the reference photo: same facial structure, asymmetry, skin texture, pores, dirt, sweat. No beautification. Three-quarter body portrait, vertical. Torso angled sideways, head toward camera. Hands gripping a shotgun at waist level. Wasteland survivor - Mad Max: Fury Road visual language. Practical, battle-worn realism. Environment: open desert wasteland, orange sand and dust clouds, saturated turquoise sky. Background: slightly blurred VEHICLES, sense of imminent chase. Subtle motion blur and heat haze. Lighting: harsh overhead desert sun, extremely hard shadows. Rich detail in sun-bleached highlights and deep crushed shadows. Sweat and grease catching sharp specular highlights. Wardrobe & details: distressed leather, scarf around neck, dusty welding goggles on forehead. Windblown messy hair. Face smeared with engine grease and sand (naturalistic). Look & color: shot on 35mm film, Kodak Vision3 feel. Organic film grain, high contrast. Strong teal & orange grading, realistic skin tones. Emphasis on tactile realism: rusted metal, sand particles, sweat, grease, fabric weave. Final: raw, tense, sun-blasted, high-energy cinematic still.',
    category: 'Görsel',
    tags: ['mad max', 'sinematik', 'çöl', 'fury road', 'fotogerçekçi', '35mm'],
    emoji: '✦',
    gradient: ['#78350F', '#B45309'],
    imageSource: wastelandSurvivorImg,
  },
  {
    id: 'img-5',
    title: 'Çapraz Güneş Işığı & Bordo Fon Portresi',
    prompt:
      'Bold ultra-realistic portrait with diagonal sunlight casting sharp triangular shadows across a deep burgundy background. Subject in a black blazer and turtleneck, wearing thin metal-framed glasses. Head tilted upward, off-camera gaze. Hard directional lighting from right, high micro-detail on skin and fabric, 4:5 vertical ratio, cinematic contrast, no oversaturation.',
    category: 'Görsel',
    tags: ['portre', 'güneş ışığı', 'chiaroscuro', 'bordo', 'fotogerçekçi', 'sinematik'],
    emoji: '✦',
    gradient: ['#4C0519', '#881337'],
    imageSource: diagonalSunlightImg,
  },
  {
    id: 'img-6',
    title: 'Modern İllüstrasyon & Suluboya Mimari Portre',
    prompt:
      'Use the uploaded image as reference, A blend of high-end illustrative realism, cinematic editorial illustration, modern fashion art with delicate ink lines and soft watercolor strokes. Highly detailed depictions of faces with porcelain skin texture, delicate blush, and expressive sparkling eyes. Dynamic dynamic compositions, close-up portraits, flowing strands of hair of close-up portraits. Crisp white negative space backgrounds overlaid with architectural outlines, geometric construction grids, and technical drawing elements. Flowing strands of hair and fabric edges dissolve into abstract, transparent shards of color and paint splatters. A soft blues, warm yellows, pale pinks, light grays with controlled saturation. An elegant balance between precise sketch lines and loose, atmospheric paint effects. A cinematic editorial illustration aesthetic with a modern fashion art feel, dreamy yet sharp, minimalist yet rich in detail. High-resolution, vertical portrait, 4k quality.',
    category: 'Görsel',
    tags: ['illüstrasyon', 'suluboya', 'moda', 'mimari', 'eskiz', '4k'],
    emoji: '✦',
    gradient: ['#1E293B', '#334155'],
    imageSource: watercolorSketchImg,
  },
  {
    id: 'img-7',
    title: 'Moody Sinematik & Doğal Işık Kadın Portresi',
    prompt:
      'Moody cinematic portrait of a young woman with referans görseldeki renk tonu skin and barely-there makeup, warm natural lips. Loose referans görseldeki renk tonu hair, softly textured. Calm, self-assured expression. She’s wearing a fitted fitted top with clean lines, understated elegance. Dark minimal background fading into black. Gentle diffused front light, soft shadows, subtle film grain, organic color grading, shallow depth of field, high-end editorial feel.',
    category: 'Görsel',
    tags: ['sinematik', 'portre', 'moody', 'doğal ışık', 'editorial', 'fotogerçekçi'],
    emoji: '✦',
    gradient: ['#18181B', '#292524'],
    imageSource: moodyCinematicImg,
  },
  {
    id: 'img-8',
    title: 'Disney-Pixar 3D Neon Karakter Portresi',
    prompt:
      '3D in the style of Disney-Pixar, a man in fluorescent green glasses, a man focused but smiling, red hair in a large neon green knitted sweater, white trousers, gray concrete background in the background, warm cinematic lighting, high detail, 8K, without text and numbers. The image is made with high detail, with subtle highlights of light on a glossy translucent body, which corresponds to the warm cinematic lighting of the stage, front view, portrait',
    category: 'Görsel',
    tags: ['pixar', 'disney', '3d', 'neon', 'karakter', '8k'],
    emoji: '✦',
    gradient: ['#14532D', '#15803D'],
    imageSource: pixarNeonImg,
  },
  {
    id: 'img-9',
    title: 'GTA IV Loading Screen Sanat Konsepti',
    prompt:
      'Create a Grand Theft Auto IV loading screen concept artwork in a 1:1 square aspect ratio, based on the uploaded image. Please apply the following artistic steps:\n\n1. Primary Style\nThe image should look like a hand-painted digital illustration with bold outlines, gritty realism, and high-contrast cel-shading, true to the GTA IV visual identity.\n\n2. Subject Handling and Scaling (IMPORTANT – STRICT RULE)\n• Detect Existing Subjects Only: Use the main person in the uploaded image as the base subject. Additionally, include rotweiller dog that are physically present next to this person in the reference image.\n• Prohibition (Negative Constraint): Do NOT generate or add any new people, animals, or living beings that are not present in the reference image. Preserve strictly what exists in the photo—nothing more.\n• Style and Color: The main subject and rotweiller dog must be fully colored, dramatically lit, and redrawn in the bold GTA IV art style, while preserving facial features and recognizable characteristics.\n• Composition (Pulled-Back Shot): Pull the camera back to a medium-wide shot relative to the subject group. Subjects must NOT fill the entire frame. Leave ample negative space around them (above their heads and on the sides) to add depth and allow room for motion in video editing.\n\n3. Pose and Accessory Combination\nUse faced up for the main subject’s pose and accessory. If rotweiller dog exist from the reference image, adapt the chosen pose to create a natural interaction with them.\n\n4. Background Processing – Randomized and Large Scale\nMake a random selection between the following two types:\n• TYPE A – Wide Cityscape (Wide Shot): Liberty City (NYC) skyscraper skyline, a panoramic view of the Istanbul Bosphorus, a crowded major intersection in Tokyo, or London’s Big Ben with the Thames.\n• TYPE B – Wide Street Scene (Bird’s-Eye View): A broad road with a few passing cars or taxis, surrounded by shops or buildings.\nCommon Rule: Regardless of the selected background type, it must be rendered entirely in blue, grey, hazy and desaturated, creating a strong contrast with the fully colored subjects.\n\n5. Interface Restriction (Negative Prompt)\nThe generated image must remain pure concept artwork. Do NOT add “Loading…”, game logos, progress bars, or any text or UI elements. The image must be completely clean.',
    category: 'Görsel',
    tags: ['gta iv', 'loading screen', 'cel-shading', 'illüstrasyon', 'rockstar', '1:1'],
    emoji: '✦',
    gradient: ['#0C4A6E', '#0284C7'],
    imageSource: gtaIvConceptImg,
  },
  {
    id: 'img-10',
    title: 'Red Dead Redemption 2 Sahne Rekonstrüksiyonu',
    prompt:
      '{\n  "CRITICAL_FAILURE_PREVENTION": {\n    "Must_Read": "Do NOT just apply a \'Wild West filter\' or color grading. The goal is a total reconstruction using game assets. Do not retain modern geometry.",\n    "Instruction": "You must interpret the input image purely as a layout blueprint. You must destroy the original pixels and regenerate the entire scene from scratch using 3D polygons and high-fidelity game textures that mimic the Red Dead Redemption 2 RAGE engine (set in 1899)."\n  },\n  "subject": "A complete remake of the provided reference image scene into a realistic in-game screenshot from Red Dead Redemption 2.",\n  "style_and_aesthetic": {\n    "primary_style": "RDR2 Gameplay Graphics. The image must look like a highly detailed, organic, and weathered realtime render from high-end PC hardware. It is NOT live-action film.",\n    "texture_replacement_rule": "MANDATORY: All surfaces must be RDR2 in-game textures. Modern fabrics turn into heavy wool, leather, and cotton with baked mud/dust. Pavement turns into mud, dirt paths with hoof prints, or wooden boardwalks."\n  },\n  "composition_and_framing": {\n    "blueprint_usage": "Use the reference image as a strict guide for camera angle, perspective, and placement of subjects.",\n    "allowed_deviation": "Deviations are expected where modern objects are replaced by bulkier period-appropriate models."\n  },\n  "scene_translation_details": {\n    "characters_and_clothing": "Rebuild all humans as detailed RDR2 character meshes. Strive to maintain the facial features and resemblance of the original persons as closely as the game engine allows. Convert modern clothing into 1899 attire while maintaining the original silhouette. SPECIFIC RULE: If a subject is wearing a modern helmet, replace it completely with a bandana covering the lower face and a period-appropriate cowboy hat.",\n    "vehicles_and_mounts": "Analyze modern vehicles and replace accordingly: 1. Motorcycles: Replace with a saddled horse of the exact same color tone as the motorcycle. 2. Normal Cars: Replace with appropriate wooden wagons or stagecoaches. 3. Ultra-Luxury Cars: Replace with rare, early-era motor carriages suitable for 1899 (to denote wealth) instead of wagons.",\n    "environment_and_buildings": "Substitute all modern architecture with 1899 American Frontier equivalents (weathered wood structures, brick saloons). Remove all modern tech (phones, streetlights become gas lamps)."\n  },\n  "lighting_and_atmosphere": "Recreate the lighting direction and mood from the reference using RDR2\'s volumetric lighting and weather system. Emphasize atmospheric dust and haze.",\n  "output_requirements": {\n    "type": "Clean 4K gameplay screenshot. No UI/HUD.",\n    "sharpness": "Standard gameplay camera focus. Detailed textures must be visible."\n  },\n  "negative_prompt": {\n    "forbidden_elements": [\n      "MODERN ITEMS (CARS, HELMETS, PHONES, TARMAC)",\n      "APPLYING A SIMPLE SEPIA FILTER",\n      "GTA V STYLE GRAPHICS",\n      "HYPER-REALISTIC PHOTOGRAPHY",\n      "HUD, UI, MINIMAP",\n      "CLEAN/PRISTINE TEXTURES"\n    ]\n  }\n}',
    category: 'Görsel',
    tags: ['rdr2', 'vahşi batı', '1899', 'rockstar', 'oyun grafiği', '4k'],
    emoji: '✦',
    gradient: ['#451A03', '#78350F'],
    imageSource: rdr2RemakeImg,
  },
  {
    id: 'img-11',
    title: 'Minecraft Voksel Klon & Karlı Dağ Portresi',
    prompt:
      'Use the attached reference image to create a realistic photo of the same person, with identity perfectly preserved and no facial changes.\nThe person is standing in a snowy mountain landscape, without sunglasses, wearing a thick puffer jacket in a [JACKET COLOR].\nBeside him stands a life-size 3D Minecraft-style character version of the same person, made entirely of blocks (voxel style), wearing the exact same puffer jacket in the same [JACKET COLOR 2], perfectly matching the real outfit.\nThe lighting is cinematic and natural, with realistic shadows and highlights.\nHigh resolution, 8K quality.\nPhotorealistic style for the real person, contrasted with clean voxel art for the Minecraft character.\nSharp focus, professional color grading.',
    category: 'Görsel',
    tags: ['minecraft', 'voksel', '3d blok', 'portre', 'fotogerçekçi', '8k'],
    emoji: '✦',
    gradient: ['#166534', '#15803D'],
    imageSource: minecraftCloneImg,
  },
  {
    id: 'img-12',
    title: 'Solo Minecraft Texture',
    prompt:
      '{\n  "task": "image_transformation",\n  "style": {\n    "overall_aesthetic": "High-quality cinematic Minecraft screenshot.",\n    "rendering_technique": "Mixed-media: Photorealistic subject embedded in a voxel-based environment."\n  },\n  "subject_rules": {\n    "main_subject": "The human person from the reference image must remain completely photorealistic and unchanged. No pixelation or block filters on their body, clothing, or face.",\n    "interacting_objects": "CRITICAL: Any nonhuman object in direct physical contact with the subject e.g. or nearby pets dogs MUST be converted into Minecraft block models or mobs. A real dog becomes a Minecraft wolf."\n  },\n  "environment_rules": {\n    "background_analysis": "Analyze the reference image background structure and recreate it entirely out of Minecraft voxel blocks.",\n    "elements": "Trees, terrain, paths, water, and foliage must be cubic blocks with pixel art textures.",\n    "atmosphere": "Replicate the foggy forest atmosphere using blocky volumetric fog layers appropriate for Minecraft."\n  },\n  "composition_and_lighting": {\n    "camera": "Maintain the exact camera angle and framing from the reference photo.",\n    "lighting": "Minecraft daylight with gentle haze and consistent block-based shadows."\n  }\n}',
    category: 'Görsel',
    tags: ['minecraft', 'voksel', 'mixed-media', 'doku', 'oyun dünyası', '4k'],
    emoji: '✦',
    gradient: ['#065F46', '#047857'],
    imageSource: soloMinecraftTextureImg,
  },
  {
    id: 'img-13',
    title: 'Minecraft Kayak & Voksel Kar Dünyası',
    prompt:
      '{\n  "task": "image_transformation",\n  "style": {\n    "overall_aesthetic": "High-quality cinematic Minecraft screenshot.",\n    "rendering_technique": "Mixed-media: Photorealistic subject embedded in a voxel-based environment."\n  },\n  "subject_rules": {\n    "main_subject": "The human person from the reference image must remain completely photorealistic and unchanged. No pixelation or block filters on their body, clothing, or face.",\n    "interacting_objects": "CRITICAL: Any nonhuman object in direct physical contact with the subject e.g. or nearby pets dogs MUST be converted into Minecraft block models or mobs. A real dog becomes a Minecraft wolf."\n  },\n  "environment_rules": {\n    "background_analysis": "Analyze the reference image background structure and recreate it entirely out of Minecraft voxel blocks.",\n    "elements": "Trees, terrain, paths, snow, and foliage must be cubic blocks with pixel art textures.",\n    "atmosphere": "Replicate the foggy forest atmosphere using blocky volumetric fog layers appropriate for Minecraft."\n  },\n  "composition_and_lighting": {\n    "camera": "Maintain the exact camera angle and framing from the reference photo.",\n    "lighting": "Minecraft daylight with gentle haze and consistent block-based shadows."\n  }\n}',
    category: 'Görsel',
    tags: ['minecraft', 'snowboard', 'voksel', 'karlı dağ', 'kurt', '4k'],
    emoji: '✦',
    gradient: ['#0369A1', '#0284C7'],
    imageSource: minecraftSnowboardImg,
  },
  {
    id: 'img-14',
    title: 'Altın Rim Işık & Yeşil Kontrast Portresi',
    prompt:
      'Ultrarealistic artistic portrait of the model from the reference photo, preserving all real features. Wearing a stylish black sweatshirt, hair glowing with golden backlighting, contrasted by cool green light on the face and chest, against a deep black background. The model is posed slightly in profile, head turned gently to the side with a thoughtful expression, avoiding direct eye contact with the camera. [DO NOT ALTER THE FACE IN THE SUBMITTED PHOTO]',
    category: 'Görsel',
    tags: ['portre', 'rim light', 'altın ışık', 'kontrast', 'sanatsal', 'fotogerçekçi'],
    emoji: '✦',
    gradient: ['#78350F', '#14532D'],
    imageSource: goldenGreenRimImg,
  },
];
