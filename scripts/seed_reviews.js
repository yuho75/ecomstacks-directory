const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tools = [
  {"id":"358e15b3-f09c-4762-a2ba-53ebb5ff7d90","title":"Pixelcut","cat":"Visual & Design"},
  {"id":"fab06d6f-ae65-413f-96ea-a567bfeaf05b","title":"AdCreative.ai","cat":"Copywriting & Marketing"},
  {"id":"92dbb166-4fbc-4f17-a9ed-8d82f79f46b8","title":"Alloy Automation","cat":"Automation"},
  {"id":"6a32eb45-175c-4760-a1a8-058a98798008","title":"Photoroom","cat":"Visual & Design"},
  {"id":"0a47ef52-cbe9-4fc8-a04b-424f5f23b619","title":"Predis.ai","cat":"Copywriting & Marketing"},
  {"id":"f54813a1-4607-4397-bc62-0207895e71a3","title":"Claid.ai","cat":"Visual & Design"},
  {"id":"428f4a6a-f31d-48b3-b544-bcb1f9346157","title":"Tidio Lyro","cat":"Automation"},
  {"id":"0e6e6594-d7f6-4ad2-b931-9fb34a7297cf","title":"GlossAi","cat":"Copywriting & Marketing"},
  {"id":"87e8bb3f-aaea-4aad-88dc-dc743cb4fb65","title":"OmniSearch","cat":"Store Optimization"},
  {"id":"52515bb3-d126-42a9-bdf4-c047b0c7440f","title":"Copy.ai","cat":"Copywriting & Marketing"},
  {"id":"201e13db-da68-4b1c-acef-377e3a8f332d","title":"ThoughtMetric","cat":"Automation"},
  {"id":"92dc1f9e-af81-4b5f-80c1-3f10070248bd","title":"Loox","cat":"Store Optimization"},
  {"id":"5ef420e4-cece-4ff9-baf7-182ca5f23cfb","title":"Jasper","cat":"Copywriting & Marketing"},
  {"id":"89f25f26-5a1f-450c-b195-bab39ff03ae5","title":"Matrixify","cat":"Automation"},
  {"id":"c39795ab-0ea2-4728-bcee-f55baf20cd46","title":"Flair AI","cat":"Visual & Design"},
  {"id":"20285b5b-cf41-45e4-a14f-27a112463c0a","title":"Pebblely","cat":"Visual & Design"},
  {"id":"75af6a33-0cd2-41b8-bf1a-b96244fd8687","title":"Octane AI","cat":"Store Optimization"},
  {"id":"848c3f9b-fef1-43c9-a924-b0413264db91","title":"Gorgias","cat":"Automation"},
  {"id":"e765ae30-e97d-4f1a-add7-e524fa6b344a","title":"Instant","cat":"Store Optimization"},
  {"id":"fbb8171a-3a8f-4e84-8e68-eb1b2be21a3c","title":"Alia Popups","cat":"Store Optimization"}
];

const reviewContents = {
  "Pixelcut": [
    "Pixelcut completely changed my workflow. Background removal is incredibly precise, and it saves me hours every week when listing new items.",
    "This is by far the fastest editing app I've used for e-commerce. The shadows and lighting corrections are top-notch.",
    "No more hiring expensive freelancers for simple product cutouts. Highly recommended for solo founders.",
    "Great app! The batch editing feature alone is worth the subscription price. Flawless execution."
  ],
  "AdCreative.ai": [
    "Our CTR doubled within a week of using AdCreative. The AI understands exactly what formats perform best on Meta.",
    "Generating hundreds of ad variations in minutes is a superpower. Saves our agency so much time on creative testing.",
    "I was skeptical at first, but the generated banners actually outperform our hand-designed ones. Amazing tool.",
    "Integration with our ad accounts was seamless. The text suggestions are also surprisingly persuasive."
  ],
  "Alloy Automation": [
    "Alloy connects my Shopify store to my fulfillment center effortlessly. The pre-built recipes are a lifesaver.",
    "Way better and more e-commerce focused than Zapier. It handles complex conditional logic for our VIP customers easily.",
    "Set it and forget it. We automated our entire returns process using Alloy and haven't had a single hiccup.",
    "The visual builder is intuitive, and their customer support team helped us set up a custom webhook perfectly."
  ],
  "Photoroom": [
    "Photoroom is a must-have for our jewelry store. It makes everything look like it was shot in a high-end studio.",
    "Super intuitive interface. The AI backgrounds are incredibly realistic and adapt to the lighting of our products.",
    "I use this daily to update our Instagram catalog. Removing backgrounds has never been this easy and clean.",
    "Fantastic tool for small business owners. The batch mode is incredibly fast and maintains high resolution."
  ],
  "Predis.ai": [
    "We use Predis to generate all our weekly TikToks and Reels. It turns boring text prompts into engaging videos in seconds.",
    "The carousel generator is brilliant. It literally does the work of a social media manager for a fraction of the cost.",
    "I love how it analyzes competitors and suggests trending content formats. It gave us a huge organic boost.",
    "Very easy to use, and the output quality is impressive. Perfect for keeping our social feeds active."
  ],
  "Claid.ai": [
    "Claid drastically improved the quality of our user-generated content. Blurry customer photos now look professional.",
    "We use it to upscale supplier images that are too small. The AI fills in the details beautifully without artifacts.",
    "Essential API for our marketplace. It standardized the look of thousands of vendor listings automatically.",
    "The color correction and sharpness enhancements are mind-blowing. Our conversion rate increased significantly!"
  ],
  "Tidio Lyro": [
    "Lyro handles 70% of our repetitive customer queries. Our support team can now focus on complex issues. Incredible ROI.",
    "The setup was surprisingly fast. It learned from our FAQs and past tickets within hours and sounds very human.",
    "We saw a drop in cart abandonment because Lyro answers shipping questions instantly, 24/7.",
    "Great chatbot. The interface is clean, and the seamless handoff to a human agent works flawlessly."
  ],
  "GlossAi": [
    "GlossAi turns our boring 30-minute founder interviews into punchy, viral YouTube shorts. A massive time saver.",
    "The AI accurately picks the most engaging moments and adds dynamic captions automatically. So good for repurposing content.",
    "Our organic reach exploded after we started posting the clips generated by GlossAi. Highly recommended for D2C brands.",
    "Incredible tool for video marketing. It even understands the context and highlights key emotional moments."
  ],
  "OmniSearch": [
    "Our store has over 10k SKUs, and OmniSearch handles semantic queries effortlessly. Customers find what they want instantly.",
    "The typo-tolerance and natural language understanding are way better than default Shopify search.",
    "Analytics dashboard is a goldmine. We learned exactly what products people are searching for but couldn't find.",
    "Setup took less than 10 minutes. Search speed is lightning fast and the visual results look great."
  ],
  "Copy.ai": [
    "Copy.ai generates our entire email welcome sequence. The brand voice feature ensures it always sounds like us.",
    "I use it to write bulk product descriptions. It takes features and turns them into compelling benefits instantly.",
    "The brainstorming tools are fantastic. We use it to come up with catchy ad headlines and social media hooks.",
    "A massive productivity boost for our small marketing team. The quality of the output requires very little editing."
  ],
  "ThoughtMetric": [
    "Finally, an attribution tool that actually works. We can see our true ROAS across TikTok and Meta without the iOS 14 noise.",
    "The post-purchase survey feature combined with pixel tracking gives us the complete picture of our customer journey.",
    "ThoughtMetric helped us cut wasted ad spend by 30%. The dashboard is incredibly intuitive and actionable.",
    "Their data modeling is top-tier. It's the only source of truth we rely on for scaling our campaigns."
  ],
  "Loox": [
    "Loox makes collecting photo reviews so easy. The automated email requests have a crazy high conversion rate.",
    "Social proof is everything in e-commerce, and the Loox widgets look beautiful on our Shopify theme.",
    "The video review feature is a game-changer. Customers love seeing real people using our products.",
    "Easy to install, great customer support, and it genuinely increases our conversion rates. 5 stars."
  ],
  "Jasper": [
    "Jasper's enterprise features are unmatched. We use it to localize our entire product catalog into different languages.",
    "The boss mode is incredible for writing long-form SEO blog posts that actually rank and drive organic traffic.",
    "It has completely replaced our freelance copywriting budget. The e-commerce templates are highly optimized.",
    "Incredible AI. It adapts to our brand tone perfectly and generates high-converting ad copy in seconds."
  ],
  "Matrixify": [
    "I don't know how any large Shopify store operates without Matrixify. Bulk updating prices and tags is a breeze.",
    "We used it to migrate from WooCommerce to Shopify. It handled thousands of complex product variants flawlessly.",
    "The scheduled exports feature is great for backing up our store data and syncing with our ERP system.",
    "It looks intimidating at first, but it is the most powerful app in our entire tech stack. Phenomenal tool."
  ],
  "Flair AI": [
    "Flair lets us create entire branded campaigns without a photoshoot. The AI rendering is incredibly high-end.",
    "We use it to generate seasonal banners. Placing our products into custom AI environments is so fast and fun.",
    "The drag-and-drop interface is super intuitive. It understands lighting and shadows perfectly for our cosmetics line.",
    "A must-have for creative directors. It speeds up the mock-up process and delivers production-ready assets."
  ],
  "Pebblely": [
    "Pebblely is magic. We shot our products on a phone, and Pebblely turned them into professional studio shots.",
    "The pre-made themes are gorgeous. It saves us thousands of dollars on hiring photographers and renting studios.",
    "I love how it preserves the original lighting of the product while blending it perfectly into the AI background.",
    "Incredible tool! We generate all our Instagram content using Pebblely now. It's so fast and easy."
  ],
  "Octane AI": [
    "The shop quiz we built with Octane AI increased our email capture rate by 40%. Customers love the personalized recommendations.",
    "Zero-party data is the future, and Octane makes it incredibly easy to collect and sync with Klaviyo.",
    "The quiz builder is highly customizable and looks totally native to our brand's theme.",
    "It significantly increased our Average Order Value because the quiz recommends perfectly matched bundles."
  ],
  "Gorgias": [
    "Gorgias centralizes all our IG, email, and live chat tickets into one dashboard. Our support response time dropped by half.",
    "The Shopify integration is seamless. Agents can refund or edit orders directly from the chat window.",
    "Automated rules and macros handle all our 'Where is my order?' questions. It's an absolute lifesaver.",
    "Great analytics and team management features. It scales perfectly as your e-commerce business grows."
  ],
  "Instant": [
    "Instant is exactly what it sounds like. We built and published a high-converting landing page for BFCM in under an hour.",
    "The drag-and-drop builder is buttery smooth and the pre-built sections actually follow e-commerce best practices.",
    "It integrates perfectly with our Shopify theme without slowing down page load speeds. Love it.",
    "No coding required, but the design flexibility is amazing. It's the best page builder on the market right now."
  ],
  "Alia Popups": [
    "Alia completely changed how we handle cart abandonment. The behavioral triggers are incredibly smart.",
    "Instead of annoying popups, Alia offers gamified incentives that customers actually enjoy interacting with.",
    "Our conversion rate jumped 15% in the first week. The dashboard makes it easy to track the exact revenue generated.",
    "Super easy to set up and customize. It doesn't look spammy and genuinely helps push hesitant buyers over the edge."
  ]
};

const names = ["Alex W.", "Sarah J.", "Michael C.", "Emily R.", "David L.", "Jessica K.", "Chris B.", "Amanda T.", "Ryan M.", "Olivia S."];

async function generateReviews() {
  const reviewsToInsert = [];
  
  for (const tool of tools) {
    const contents = reviewContents[tool.title] || [];
    for (let i = 0; i < 4; i++) {
      reviewsToInsert.push({
        item_id: tool.id,
        author: names[(i + tool.title.length) % names.length], // randomize names slightly
        rating: i === 3 ? 4 : 5, // Mostly 5 stars, one 4 star
        content: contents[i] || "Great tool, highly recommended for any e-commerce business!",
        status: "approved",
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString() // Random date in the past
      });
    }
  }

  console.log(`Inserting ${reviewsToInsert.length} reviews...`);
  
  const { data, error } = await supabase.from('reviews').insert(reviewsToInsert);
  
  if (error) {
    console.error("Error inserting reviews:", error);
  } else {
    console.log("Successfully inserted all reviews!");
  }
}

generateReviews();
