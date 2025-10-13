export type Module = {
    id: number;
    cid: number; // course id
    title: string;
    description: string;
    order: number;
    duration: string;
};

export const modulesData: Module[] = [
    { id: 1, cid: 1, title: "HTML Basics", description: "Introduction to HTML structure, tags, and semantic markup.", order: 1, duration: "2 weeks" },
    { id: 2, cid: 1, title: "CSS Fundamentals", description: "Learn styling, layouts, and responsive design with CSS.", order: 2, duration: "3 weeks" },
    { id: 3, cid: 1, title: "JavaScript Essentials", description: "Understand core JavaScript concepts and DOM manipulation.", order: 3, duration: "3 weeks" },

    // course 2
    { id: 4, cid: 2, title: "Git & GitHub", description: "Basics of version control and setting up GitHub repositories.", order: 1, duration: "1 week" },
    { id: 5, cid: 2, title: "Branching & Merging", description: "Learn how to work with branches and resolve merge conflicts.", order: 2, duration: "2 weeks" },
    { id: 6, cid: 2, title: "Collaboration Workflow", description: "Team collaboration practices with pull requests and reviews.", order: 3, duration: "2 weeks" },

    // course 3
    { id: 7, cid: 3, title: "Python Syntax", description: "Learn the basics of Python syntax, variables, and control flow.", order: 1, duration: "2 weeks" },
    { id: 8, cid: 3, title: "Data Structures", description: "Lists, dictionaries, tuples, and sets in Python.", order: 2, duration: "3 weeks" },
    { id: 9, cid: 3, title: "OOP in Python", description: "Introduction to object-oriented programming in Python.", order: 3, duration: "3 weeks" },

    // course 4
    { id: 10, cid: 4, title: "Database Basics", description: "Introduction to relational databases and schema design.", order: 1, duration: "2 weeks" },
    { id: 11, cid: 4, title: "SQL Queries", description: "Learn SELECT, INSERT, UPDATE, DELETE statements.", order: 2, duration: "3 weeks" },
    { id: 12, cid: 4, title: "Joins & Relationships", description: "Master INNER JOIN, LEFT JOIN, and many-to-many relations.", order: 3, duration: "3 weeks" },

    // course 5
    { id: 13, cid: 5, title: "Networking Basics", description: "Understand IP, DNS, and basic networking concepts.", order: 1, duration: "2 weeks" },
    { id: 14, cid: 5, title: "HTTP & HTTPS", description: "Learn request/response cycle, headers, and SSL.", order: 2, duration: "2 weeks" },
    { id: 15, cid: 5, title: "APIs", description: "Introduction to REST APIs and JSON data exchange.", order: 3, duration: "3 weeks" },

    // course 6
    { id: 16, cid: 6, title: "Linux Commands", description: "Basic commands for navigating and managing files.", order: 1, duration: "2 weeks" },
    { id: 17, cid: 6, title: "Shell Scripting", description: "Automating tasks with bash scripts.", order: 2, duration: "2 weeks" },
    { id: 18, cid: 6, title: "Process Management", description: "Learn about processes, jobs, and signals in Linux.", order: 3, duration: "2 weeks" },

    // course 7
    { id: 19, cid: 7, title: "Java Basics", description: "Introduction to Java syntax and JVM.", order: 1, duration: "2 weeks" },
    { id: 20, cid: 7, title: "OOP in Java", description: "Encapsulation, inheritance, and polymorphism.", order: 2, duration: "3 weeks" },
    { id: 21, cid: 7, title: "Java Collections", description: "Lists, sets, maps, and queues in Java.", order: 3, duration: "3 weeks" },

    // course 8
    { id: 22, cid: 8, title: "C# Basics", description: "Learn the fundamentals of C# language.", order: 1, duration: "2 weeks" },
    { id: 23, cid: 8, title: "OOP in C#", description: "Work with classes, objects, and inheritance.", order: 2, duration: "3 weeks" },
    { id: 24, cid: 8, title: "LINQ", description: "Query data structures with LINQ.", order: 3, duration: "2 weeks" },

    // course 9
    { id: 25, cid: 9, title: "Frontend Basics", description: "HTML, CSS, and JavaScript for building UIs.", order: 1, duration: "2 weeks" },
    { id: 26, cid: 9, title: "React Basics", description: "Introduction to React components and props.", order: 2, duration: "3 weeks" },
    { id: 27, cid: 9, title: "React State", description: "State, hooks, and lifecycle management.", order: 3, duration: "3 weeks" },

    // course 10
    { id: 28, cid: 10, title: "Node.js Basics", description: "Getting started with Node.js runtime.", order: 1, duration: "2 weeks" },
    { id: 29, cid: 10, title: "Express.js", description: "Building APIs with Express.js framework.", order: 2, duration: "3 weeks" },
    { id: 30, cid: 10, title: "Middleware", description: "Learn middleware patterns in Express.js.", order: 3, duration: "2 weeks" },

    // course 11
    { id: 31, cid: 11, title: "PHP Basics", description: "Introduction to PHP syntax and variables.", order: 1, duration: "2 weeks" },
    { id: 32, cid: 11, title: "Forms & Validation", description: "Handling forms and validating user input in PHP.", order: 2, duration: "3 weeks" },
    { id: 33, cid: 11, title: "Sessions & Cookies", description: "Learn session management and cookies in PHP.", order: 3, duration: "2 weeks" },

    // course 12
    { id: 34, cid: 12, title: "Ruby Basics", description: "Getting started with Ruby syntax and control flow.", order: 1, duration: "2 weeks" },
    { id: 35, cid: 12, title: "Ruby OOP", description: "Object-oriented programming concepts in Ruby.", order: 2, duration: "3 weeks" },
    { id: 36, cid: 12, title: "Ruby on Rails Intro", description: "Introduction to building apps with Ruby on Rails.", order: 3, duration: "3 weeks" },

    // course 13
    { id: 37, cid: 13, title: "C++ Basics", description: "Understand syntax, variables, and pointers.", order: 1, duration: "2 weeks" },
    { id: 38, cid: 13, title: "OOP in C++", description: "Classes, inheritance, and polymorphism.", order: 2, duration: "3 weeks" },
    { id: 39, cid: 13, title: "STL", description: "Using Standard Template Library (STL).", order: 3, duration: "3 weeks" },

    // course 14
    { id: 40, cid: 14, title: "Mobile App Basics", description: "Overview of mobile app development ecosystems.", order: 1, duration: "2 weeks" },
    { id: 41, cid: 14, title: "Android Intro", description: "Building apps using Android SDK.", order: 2, duration: "3 weeks" },
    { id: 42, cid: 14, title: "iOS Intro", description: "Introduction to iOS app development with Swift.", order: 3, duration: "3 weeks" },

    // course 15
    { id: 43, cid: 15, title: "Cloud Basics", description: "Introduction to cloud computing concepts.", order: 1, duration: "2 weeks" },
    { id: 44, cid: 15, title: "AWS Services", description: "Overview of key AWS services (EC2, S3, Lambda).", order: 2, duration: "3 weeks" },
    { id: 45, cid: 15, title: "Deploying Apps", description: "Deploy applications to cloud environments.", order: 3, duration: "2 weeks" },

    // course 16
    { id: 46, cid: 16, title: "Cybersecurity Basics", description: "Understand security principles and threats.", order: 1, duration: "2 weeks" },
    { id: 47, cid: 16, title: "Encryption", description: "Learn about symmetric and asymmetric encryption.", order: 2, duration: "2 weeks" },
    { id: 48, cid: 16, title: "Web Security", description: "Protect against XSS, CSRF, and SQL Injection.", order: 3, duration: "3 weeks" },

    // course 17
    { id: 49, cid: 17, title: "DevOps Basics", description: "Introduction to DevOps culture and practices.", order: 1, duration: "2 weeks" },
    { id: 50, cid: 17, title: "CI/CD", description: "Set up continuous integration and delivery pipelines.", order: 2, duration: "3 weeks" },
    { id: 51, cid: 17, title: "Containerization", description: "Docker and container orchestration basics.", order: 3, duration: "3 weeks" },

    // course 18
    { id: 52, cid: 18, title: "Data Science Basics", description: "Introduction to data science and data analysis.", order: 1, duration: "2 weeks" },
    { id: 53, cid: 18, title: "Data Visualization", description: "Use charts and plots to visualize data.", order: 2, duration: "3 weeks" },
    { id: 54, cid: 18, title: "Machine Learning Intro", description: "Basic concepts of machine learning models.", order: 3, duration: "3 weeks" },

    // course 19
    { id: 55, cid: 19, title: "AI Basics", description: "Introduction to artificial intelligence concepts.", order: 1, duration: "2 weeks" },
    { id: 56, cid: 19, title: "Neural Networks", description: "Understand perceptrons and neural architectures.", order: 2, duration: "3 weeks" },
    { id: 57, cid: 19, title: "Deep Learning", description: "Intro to deep learning with popular frameworks.", order: 3, duration: "3 weeks" },

    // course 20
    { id: 58, cid: 20, title: "Blockchain Basics", description: "Introduction to blockchain technology and concepts.", order: 1, duration: "2 weeks" },
    { id: 59, cid: 20, title: "Smart Contracts", description: "Learn about Ethereum and smart contracts.", order: 2, duration: "3 weeks" },
    { id: 60, cid: 20, title: "Web3 Apps", description: "Introduction to decentralized applications (dApps).", order: 3, duration: "3 weeks" },

];

