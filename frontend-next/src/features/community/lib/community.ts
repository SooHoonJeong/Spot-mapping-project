export type CommunityMedia = {
  type: "image" | "video";
  url: string;
  name: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  handle: string;
  timeAgo: string;
  title?: string;
  content: string;
  tag?: string;
  media?: CommunityMedia[];
  likes: number;
  comments: number;
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    author: "Maya Chen",
    handle: "mayaruns",
    timeAgo: "2h",
    content:
      "The Sunrise Run Club this morning was unreal. 40+ people showed up and we grabbed coffee after. If you've been on the fence, come next Sunday!",
    tag: "Sunrise Run Club",
    media: [{ type: "image", url: "/events/run-club.png", name: "Run club" }],
    likes: 128,
    comments: 24,
  },
  {
    id: "p2",
    author: "Diego Alvarez",
    handle: "diegoeats",
    timeAgo: "5h",
    content:
      "Pro tip for the Downtown Night Market: get there right at 6:30 before the dumpling stall sells out. Last week the line was 30 minutes by 7:15.",
    tag: "Downtown Night Market",
    media: [{ type: "image", url: "/events/food-market.png", name: "Night market" }],
    likes: 96,
    comments: 41,
  },
  {
    id: "p3",
    author: "Priya Nair",
    handle: "priyabuilds",
    timeAgo: "1d",
    content:
      "Anyone going to the Founders & Builders Meetup Wednesday? Would love to carpool from Brooklyn. Drop a comment if you're in.",
    tag: "Founders & Builders Meetup",
    media: [{ type: "image", url: "/events/tech-meetup.png", name: "Meetup" }],
    likes: 54,
    comments: 18,
  },
  {
    id: "p4",
    author: "Sam Whitfield",
    handle: "samsound",
    timeAgo: "2d",
    content:
      "Just listed a small acoustic night at my cafe next Friday. First community event I'm hosting through Spot, come say hi and support local musicians.",
    tag: "Acoustic Night",
    likes: 212,
    comments: 33,
  },
];
