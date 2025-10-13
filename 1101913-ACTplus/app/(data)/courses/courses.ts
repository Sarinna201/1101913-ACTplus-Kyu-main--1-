export type Course = {
    id: number;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    instructor: string;
    rating: number;
    createdAt: string; // ISO date
};

export const coursesData: Course[] = [
    {
        id: 1,
        title: "Introduction to Web Development",
        description: "Learn the basics of HTML, CSS, and JavaScript to start building websites.",
        category: "Web Development",
        level: "Beginner",
        duration: "8 weeks",
        instructor: "Alice Johnson",
        rating: 4.7,
        createdAt: "2025-01-05"
    },
    {
        id: 2,
        title: "Advanced JavaScript",
        description: "Deep dive into modern JavaScript features including ES6+, async programming, and more.",
        category: "Programming",
        level: "Advanced",
        duration: "6 weeks",
        instructor: "David Kim",
        rating: 4.8,
        createdAt: "2025-02-12"
    },
    {
        id: 3,
        title: "UI/UX Design Fundamentals",
        description: "Learn principles of user interface and user experience design with hands-on projects.",
        category: "Design",
        level: "Beginner",
        duration: "5 weeks",
        instructor: "Sophia Lee",
        rating: 4.6,
        createdAt: "2025-03-03"
    },
    {
        id: 4,
        title: "Python for Data Science",
        description: "Master Python programming and data analysis libraries like NumPy, Pandas, and Matplotlib.",
        category: "Data Science",
        level: "Intermediate",
        duration: "10 weeks",
        instructor: "Michael Smith",
        rating: 4.9,
        createdAt: "2025-04-21"
    },
    {
        id: 5,
        title: "React.js Essentials",
        description: "Build dynamic web applications with React hooks, context API, and components.",
        category: "Web Development",
        level: "Intermediate",
        duration: "7 weeks",
        instructor: "Emma Davis",
        rating: 4.7,
        createdAt: "2025-05-18"
    },
    {
        id: 6,
        title: "Machine Learning Basics",
        description: "Introduction to supervised and unsupervised learning with Scikit-Learn.",
        category: "AI & Machine Learning",
        level: "Intermediate",
        duration: "9 weeks",
        instructor: "Dr. Alan Thompson",
        rating: 4.8,
        createdAt: "2025-06-07"
    },
    {
        id: 7,
        title: "Cybersecurity Essentials",
        description: "Understand security threats, encryption, and how to protect systems.",
        category: "IT & Security",
        level: "Beginner",
        duration: "6 weeks",
        instructor: "Rachel Green",
        rating: 4.5,
        createdAt: "2025-07-02"
    },
    {
        id: 8,
        title: "Mobile App Development with Flutter",
        description: "Learn to build cross-platform apps for iOS and Android using Flutter.",
        category: "Mobile Development",
        level: "Intermediate",
        duration: "8 weeks",
        instructor: "Jason Brown",
        rating: 4.7,
        createdAt: "2025-07-15"
    },
    {
        id: 9,
        title: "Cloud Computing with AWS",
        description: "Hands-on course for deploying and managing apps on Amazon Web Services.",
        category: "Cloud Computing",
        level: "Intermediate",
        duration: "7 weeks",
        instructor: "Liam Wilson",
        rating: 4.6,
        createdAt: "2025-08-01"
    },
    {
        id: 10,
        title: "Digital Marketing Strategy",
        description: "Learn SEO, social media marketing, and analytics to boost online presence.",
        category: "Business & Marketing",
        level: "Beginner",
        duration: "4 weeks",
        instructor: "Olivia Martin",
        rating: 4.5,
        createdAt: "2025-01-20"
    },
    {
        id: 11,
        title: "Database Design with SQL",
        description: "Master relational databases, SQL queries, and normalization concepts.",
        category: "Database",
        level: "Intermediate",
        duration: "6 weeks",
        instructor: "Ethan Harris",
        rating: 4.7,
        createdAt: "2025-02-25"
    },
    {
        id: 12,
        title: "Data Visualization with Tableau",
        description: "Learn how to create dashboards and tell stories with data using Tableau.",
        category: "Data Science",
        level: "Beginner",
        duration: "5 weeks",
        instructor: "Grace Taylor",
        rating: 4.6,
        createdAt: "2025-03-18"
    },
    {
        id: 13,
        title: "DevOps with Docker & Kubernetes",
        description: "Automate deployment pipelines with Docker containers and Kubernetes clusters.",
        category: "DevOps",
        level: "Advanced",
        duration: "8 weeks",
        instructor: "Daniel White",
        rating: 4.9,
        createdAt: "2025-04-10"
    },
    {
        id: 14,
        title: "Blockchain Fundamentals",
        description: "Learn blockchain concepts, smart contracts, and decentralized apps.",
        category: "Blockchain",
        level: "Beginner",
        duration: "7 weeks",
        instructor: "Sarah Parker",
        rating: 4.4,
        createdAt: "2025-05-04"
    },
    {
        id: 15,
        title: "Artificial Intelligence with TensorFlow",
        description: "Build neural networks and AI models using TensorFlow and Keras.",
        category: "AI & Machine Learning",
        level: "Advanced",
        duration: "10 weeks",
        instructor: "Prof. Kevin Moore",
        rating: 4.8,
        createdAt: "2025-06-22"
    },
    {
        id: 16,
        title: "Game Development with Unity",
        description: "Create 2D and 3D games with Unity engine and C# scripting.",
        category: "Game Development",
        level: "Intermediate",
        duration: "9 weeks",
        instructor: "Hannah Scott",
        rating: 4.7,
        createdAt: "2025-07-11"
    },
    {
        id: 17,
        title: "Project Management Professional (PMP) Prep",
        description: "Prepare for the PMP certification with project management frameworks and practices.",
        category: "Business & Management",
        level: "Advanced",
        duration: "12 weeks",
        instructor: "Mark Anderson",
        rating: 4.6,
        createdAt: "2025-08-05"
    },
    {
        id: 18,
        title: "Financial Analysis for Beginners",
        description: "Learn the basics of financial statements, ratios, and investment analysis.",
        category: "Finance",
        level: "Beginner",
        duration: "5 weeks",
        instructor: "Isabella Martinez",
        rating: 4.5,
        createdAt: "2025-01-28"
    },
    {
        id: 19,
        title: "Ethical Hacking & Penetration Testing",
        description: "Hands-on ethical hacking course with real-world penetration testing scenarios.",
        category: "IT & Security",
        level: "Advanced",
        duration: "8 weeks",
        instructor: "Chris Evans",
        rating: 4.8,
        createdAt: "2025-03-29"
    },
    {
        id: 20,
        title: "Introduction to Artificial Intelligence",
        description: "An overview of AI history, concepts, and real-world applications.",
        category: "AI & Machine Learning",
        level: "Beginner",
        duration: "6 weeks",
        instructor: "Natalie Walker",
        rating: 4.6,
        createdAt: "2025-04-14"
    }
];
