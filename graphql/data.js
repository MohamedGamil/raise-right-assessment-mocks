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
      { name: "Youssef", amount: 50 }
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
    donors: []
  }
];

module.exports = { campaigns };
