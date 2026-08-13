export type EventCategory =
  | "Music"
  | "Food & Drink"
  | "Art"
  | "Tech"
  | "Wellness"
  | "Social";

export type EventFormat = "In person" | "Online";

export type AppEvent = {
  id: string;
  title: string;
  category: EventCategory;
  format: EventFormat;
  date: string;
  time: string;
  venue: string;
  address: string;
  price: string;
  image: string;
  description: string;
  attendees: number;
  lat: number;
  lng: number;
};

export const CATEGORIES: EventCategory[] = [
  "Music",
  "Food & Drink",
  "Art",
  "Tech",
  "Wellness",
  "Social",
];

// Centered around New York City
export const MAP_CENTER: [number, number] = [40.7178, -73.9857];

export const EVENTS: AppEvent[] = [
  {
    id: "sunset-sounds",
    title: "Sunset Sounds Festival",
    category: "Music",
    format: "In person",
    date: "Sat, Jul 12",
    time: "5:00 PM",
    venue: "Pier 17 Rooftop",
    address: "89 South St, New York, NY",
    price: "$45",
    image: "/events/music-festival.png",
    description:
      "An open-air live music festival featuring local bands and DJs as the sun sets over the river. Food trucks, dancing, and good vibes all night.",
    attendees: 842,
    lat: 40.7058,
    lng: -74.0027,
  },
  {
    id: "night-market",
    title: "Downtown Night Market",
    category: "Food & Drink",
    format: "In person",
    date: "Fri, Jul 11",
    time: "6:30 PM",
    venue: "Canal Street Plaza",
    address: "200 Canal St, New York, NY",
    price: "Free",
    image: "/events/food-market.png",
    description:
      "Over 40 street food vendors serving dishes from around the world. Come hungry and explore flavors from every corner of the city.",
    attendees: 1230,
    lat: 40.7185,
    lng: -74.0,
  },
  {
    id: "gallery-opening",
    title: "New Voices Gallery Opening",
    category: "Art",
    format: "In person",
    date: "Thu, Jul 10",
    time: "7:00 PM",
    venue: "Lumen Contemporary",
    address: "525 W 22nd St, New York, NY",
    price: "$15",
    image: "/events/art-gallery.png",
    description:
      "A reception celebrating emerging artists. Meet the creators, enjoy complimentary drinks, and be the first to see this season's collection.",
    attendees: 318,
    lat: 40.7472,
    lng: -74.0048,
  },
  {
    id: "founders-meetup",
    title: "Founders & Builders Meetup",
    category: "Tech",
    format: "Online",
    date: "Wed, Jul 9",
    time: "6:00 PM",
    venue: "The Hub Coworking",
    address: "55 Broadway, New York, NY",
    price: "Free",
    image: "/events/tech-meetup.png",
    description:
      "Lightning talks from local startup founders followed by open networking. Bring your ideas, your questions, and your business cards.",
    attendees: 426,
    lat: 40.7069,
    lng: -74.0113,
  },
  {
    id: "sunrise-run",
    title: "Sunrise Run Club",
    category: "Wellness",
    format: "In person",
    date: "Sun, Jul 13",
    time: "6:30 AM",
    venue: "Central Park Loop",
    address: "Grand Army Plaza, New York, NY",
    price: "Free",
    image: "/events/run-club.png",
    description:
      "A community 5K through the park to start your weekend right. All paces welcome, with coffee and stretching afterwards.",
    attendees: 210,
    lat: 40.7644,
    lng: -73.9732,
  },
  {
    id: "rooftop-social",
    title: "Skyline Rooftop Social",
    category: "Social",
    format: "In person",
    date: "Sat, Jul 12",
    time: "8:00 PM",
    venue: "The Crown Terrace",
    address: "123 W 30th St, New York, NY",
    price: "$25",
    image: "/events/rooftop-party.png",
    description:
      "Mingle with new friends under the city lights. Live DJ set, signature cocktails, and the best skyline views in town.",
    attendees: 564,
    lat: 40.7484,
    lng: -73.9911,
  },
  {
    id: "virtual-songwriting",
    title: "Virtual Songwriting Session",
    category: "Music",
    format: "Online",
    date: "Tue, Jul 15",
    time: "7:30 PM",
    venue: "Live on Spot Stream",
    address: "Online event",
    price: "Free",
    image: "/events/music-festival.png",
    description:
      "Join fellow songwriters from anywhere for a guided co-writing session. Bring an instrument or just your ideas and leave with a new hook.",
    attendees: 173,
    lat: 40.73,
    lng: -73.99,
  },
  {
    id: "design-critique",
    title: "Open Design Critique",
    category: "Tech",
    format: "Online",
    date: "Thu, Jul 17",
    time: "12:00 PM",
    venue: "Spot Video Room",
    address: "Online event",
    price: "Free",
    image: "/events/tech-meetup.png",
    description:
      "Share work-in-progress and get friendly, actionable feedback from designers and product folks. Sign up to present or just come to learn.",
    attendees: 289,
    lat: 40.72,
    lng: -73.98,
  },
];

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Music: "#ff6a00",
  "Food & Drink": "#e8590c",
  Art: "#f08c00",
  Tech: "#d9480f",
  Wellness: "#f76707",
  Social: "#fd7e14",
};
