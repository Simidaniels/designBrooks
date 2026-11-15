/* Design Brooks — public website content (portfolio and insights).
   This is marketing copy for the live site, not client/demo records. */
import type { PortfolioProject, InsightPost } from "./types";

/* ————— Portfolio (public site) ————— */
export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "hudson-innovation-hub",
    title: "Hudson Innovation Hub",
    category: "Workplace",
    location: "New York, USA",
    year: "2026",
    image: "/images/glass.webp",
    services: ["Interior Architecture", "Workplace Strategy", "Detailed Design"],
    summary: "A contemporary workplace designed for flexibility, daylight performance, and collaborative use.",
    body: [
      "Whitfield Group asked for more than an office: they needed a working environment that could host clients, prototype products, and grow with the team. The answer is a light-washed nine-storey floorplate organised around a central daylit forum.",
      "Every element was performance-driven — from the 45-degree façade fins that cut afternoon glare to the demountable partitions that let entire teams reconfigure in a weekend. Materials are deliberately honest: exposed concrete, oak, blackened steel and low-sheen mineral plaster.",
      "The result is a workplace that reads calm and architectural in photographs, and performs quietly, measurably well in daily use.",
    ],
    featured: true,
  },
  {
    slug: "ikoyi-duplex-house",
    title: "Ikoyi Duplex House",
    category: "Residential",
    location: "Ikoyi, Lagos",
    year: "2026",
    image: "/images/house.jpg",
    services: ["Architectural Design", "Interior Architecture", "Project Coordination"],
    summary: "A contemporary family home shaped around shaded balconies and warm natural finishes.",
    body: [
      "The brief called for a family home that felt private without turning inward — generous, secure, and quietly luxurious. Deep overhangs and a shaded double-height balcony cool the front elevation while framing views back to the street.",
      "Inside, the plan separates public and family wings across two floors, connected by a floating oak stair and a top-lit gallery. Local stone, limewash and fumed oak anchor the palette in West African craft.",
    ],
    featured: true,
  },
  {
    slug: "childrens-museum-renewal",
    title: "Children's Museum Renewal",
    category: "Cultural",
    location: "Berlin, DE",
    year: "2025",
    image: "/images/museum.jpg",
    services: ["Adaptive Reuse", "Wayfinding", "Public Engagement"],
    summary: "An adaptive reuse that opens circulation, improves wayfinding, and encourages discovery.",
    body: [
      "The Stiftung Kindermuseum inherited a handsome but impenetrable 1910 gallery. Our renewal strips the visitor experience back to first principles: one clear arrival sequence, legible floor markings for young readers, and exhibition rooms tuned to changing shows.",
      "Existing vaults were retained wherever possible; new insertions are expressed in lightweight steel and birch ply so the building's layers remain readable.",
    ],
    featured: true,
  },
  {
    slug: "coastal-house-retreat",
    title: "Coastal House Retreat",
    category: "Interior Design",
    location: "Sydney, AU",
    year: "2026",
    image: "/images/portable.webp",
    services: ["Interior Architecture", "Lighting Direction", "Furniture Curation"],
    summary: "Quiet material transitions, framed views, and generous indoor-outdoor living.",
    body: [
      "For a cliff-edge site above the Pacific, the interiors were designed as a sequence of decompression — limewashed walls, linen, travertine and brushed brass against the blue-grey horizon.",
      "Every room borrows the view differently: framed obliquely from the entry, panoramic from the living wing, and as a single held slot from the principal bath.",
    ],
  },
  {
    slug: "north-gallery-rooms",
    title: "North Gallery Rooms",
    category: "Gallery",
    location: "Ottawa, CA",
    year: "2025",
    image: "/images/art.webp",
    services: ["Exhibition Design", "Lighting", "Visitor Flow"],
    summary: "A restrained exhibition environment where architecture supports art and rhythm.",
    body: [
      "Three former industrial bays were reimagined as a continuous enfilade of exhibition rooms. Acoustic plaster, 4-metre daylight slots and track-mounted museum lighting give curators a neutral, forgiving canvas.",
      "The gallery reopened to record membership in its first quarter.",
    ],
  },
  {
    slug: "ribeira-warehouse-conversion",
    title: "Ribeira Warehouse Conversion",
    category: "Adaptive Reuse",
    location: "Lisbon, PT",
    year: "2026",
    image: "/images/office.webp",
    services: ["Feasibility", "Concept Design", "Heritage Strategy"],
    summary: "Feasibility for converting a riverside warehouse into live-work lofts.",
    body: [
      "A 19th-century customs warehouse on the Ribeira is being tested for live-work conversion. Our study covers heritage retention, daylight modelling for deep floor plates, and a phased structural strategy.",
      "Concept design is expected to complete by early 2027.",
    ],
  },
];

/* ————— Insights (public site) ————— */
export const insightPosts: InsightPost[] = [
  {
    slug: "designing-for-restraint",
    title: "Designing for restraint in an age of maximalism",
    category: "Studio Notes",
    date: "2026-10-19",
    readTime: "6 min read",
    excerpt: "Why the most durable architecture we admire is often the quietest — and how we hold that line with clients.",
    body: [
      "Every few years the visual culture swings toward excess: more colour, more pattern, more surface. Restraint is harder to sell — it asks the client to trust proportion, light and material rather than decoration.",
      "Our method is to make the quiet option feel rich. We present pairs of schemes — one expressive, one restrained — and let the material logic make the case. In seven of ten projects the client chooses restraint once they see it drawn at 1:50.",
      "Restraint is not absence. It is the discipline of removing the unnecessary until what remains is inevitable.",
    ],
  },
  {
    slug: "watermarked-previews-client-trust",
    title: "Why private previews make better client relationships",
    category: "Practice",
    date: "2026-09-28",
    readTime: "5 min read",
    excerpt: "Controlled drawing release is not about distrust. It is about keeping work-in-progress honest and legible.",
    body: [
      "Drawings circulate; that is their nature. But when work-in-progress drawings leak out of sequence — before structure is verified, before heritage sign-off — the studio carries the risk without the context.",
      "Controlled, watermarked previews let clients see real progress, every week, without ambiguity about what is approved. Full drawings are released the moment the work is complete and cleared.",
      "The studio's obligation to the client is not just beautiful work. It is orderly, honest delivery.",
    ],
  },
  {
    slug: "material-palette-lagos-interiors",
    title: "Building a material palette for Lagos interiors",
    category: "Materials",
    date: "2026-08-15",
    readTime: "8 min read",
    excerpt: "Local stone, limewash and engineered oak — what survives the climate, what ages well, and what to avoid.",
    body: [
      "Humidity is the great editor of West African interiors. We favour limewash over acrylic, engineered oak over veneer, and locally quarried stone that gains character in the heat rather than fighting it.",
      "The Ikoyi Duplex palette — honed sandstone, fumed oak, handmade brass — was selected for how it will look in year fifteen: burnished, not worn.",
      "Material honesty is not austerity. It is the confidence to let one perfect surface carry a room.",
    ],
  },
];
