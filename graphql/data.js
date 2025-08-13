// graphql/data.js
const campaigns = [
  {
    id: "1",
    name: "Masjid Area Extension",
    goal: 5000,
    currentAmount: 2200,
    description: "Refurnish and extend the masjid area.",
    imageUrl: "https://picsum.photos/seed/lib1/600/400",
    donors: [
      { name: "Lina", amount: 200 },
      { name: "Youssef", amount: 50 },
      { name: "Fatima", amount: 100 },
    ]
  },
  {
    id: "2",
    name: "Playground Repairs",
    goal: 8000,
    currentAmount: 1500,
    description: "Fix equipment and add safety surfacing.",
    imageUrl: "https://picsum.photos/seed/play1/600/400",
    donors: [{ name: "Amina", amount: 100 }]
  },
  {
    id: "3",
    name: "After School Tutors",
    goal: 12000,
    currentAmount: 7600,
    description: "Hire part-time tutors for math and science.",
    imageUrl: "https://picsum.photos/seed/tutor1/600/400",
    donors: [
      { name: "Youssef", amount: 50 },
    ]
  },
  {
    id: "4",
    name: "School Library Upgrade",
    goal: 19050,
    currentAmount: 7600,
    description: "Upgrade the school library with new books and resources.",
    imageUrl: "https://picsum.photos/seed/lib2/600/400",
    donors: []
  },
  {
    id: "5",
    name: "Community Garden",
    goal: 3000,
    currentAmount: 1200,
    description: "Create a community garden for local residents.",
    imageUrl: "https://picsum.photos/seed/garden1/600/400",
    donors: [{ name: "Omar", amount: 50 }]
  },
  {
    id: "6",
    name: "Sports Equipment Fund",
    goal: 4500,
    currentAmount: 2000,
    description: "Purchase new sports equipment for the school.",
    imageUrl: "https://picsum.photos/seed/sports1/600/400",
    donors: []
  },
];

module.exports = { campaigns };
