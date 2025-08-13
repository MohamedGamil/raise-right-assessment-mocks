// graphql/data.js
const campaigns = [
  {
    id: "1",
    name: "Masjid Area Extension",
    goal: 5000,
    currentAmount: 2200,
    description: "Refurnish and extend the masjid area.",
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
    donors: [{ name: "Amina", amount: 100 }]
  },
  {
    id: "3",
    name: "After School Tutors",
    goal: 12000,
    currentAmount: 7600,
    description: "Hire part-time tutors for math and science.",
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
    donors: []
  },
  {
    id: "5",
    name: "Community Garden",
    goal: 3000,
    currentAmount: 1200,
    description: "Create a community garden for local residents.",
    donors: [{ name: "Omar", amount: 50 }]
  },
  {
    id: "6",
    name: "Sports Equipment Fund",
    goal: 4500,
    currentAmount: 2000,
    description: "Purchase new sports equipment for the school.",
    donors: []
  },
];

module.exports = { campaigns };
