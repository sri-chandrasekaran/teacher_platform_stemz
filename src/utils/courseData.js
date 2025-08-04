// Fixed self-paced course data
export const courseData = {
  astronomy: {
    name: "Astronomy",
    title: "Astronomy",
    lessons: {
      lesson1: {
        title: "The Solar System",
        activities: ["video", "worksheet"],
      },
      lesson2: { title: "Galaxies", activities: ["video"] },
      lesson3: {
        title: "Space and Humans",
        activities: ["video", "worksheet"],
      },
      lesson4: { title: "The Universe", activities: ["video", "quiz"] },
    },
  },
  basicsOfCoding: {
    name: "Basics of Coding",
    title: "Basics of Coding",
    lessons: {
      lesson1: { title: "Introduction to Scratch", activities: ["video"] },
      lesson2: {
        title: "Conditional Statements & Loops",
        activities: ["video"],
      },
      lesson3: { title: "Wait & Sensors", activities: ["video"] },
      lesson4: { title: "Final Review", activities: ["video", "quiz"] },
    },
  },
  biochemistry: {
    name: "Biochemistry",
    title: "Biochemistry",
    lessons: {
      lesson1: { title: "Nucleic Acids", activities: ["video"] },
      lesson2: {
        title: "Proteins & Carbohydrates",
        activities: ["video", "worksheet", "quiz"],
      },
    },
  },
  chemistry: {
    name: "Chemistry",
    title: "Chemistry",
    lessons: {
      lesson1: { title: "Chemistry & Matter", activities: ["video"] },
      lesson2: { title: "Molecules & Atoms", activities: ["video"] },
      lesson3: { title: "Chemical Reactions", activities: ["video"] },
      lesson4: {
        title: "Putting It All Together",
        activities: ["video", "quiz"],
      },
    },
  },
  circuits: {
    name: "Circuits",
    title: "Circuits",
    lessons: {
      lesson1: { title: "Circuits & Circuit Boards", activities: ["video"] },
      lesson2: {
        title: "More Circuit Board Tools",
        activities: ["video", "worksheet"],
      },
      lesson3: {
        title: "Creating a Functioning Circuit",
        activities: ["video", "quiz"],
      },
    },
  },
  environmentalScience: {
    name: "Environmental Science",
    title: "Environmental Science",
    lessons: {
      lesson1: { title: "Biomes", activities: ["video", "worksheet"] },
      lesson2: { title: "Cycles of the Earth", activities: ["video"] },
      lesson3: {
        title: "Population in the Water & Air",
        activities: ["video"],
      },
      lesson4: {
        title: "3 R's and the Environment",
        activities: ["video", "quiz"],
      },
    },
  },
  psychology: {
    name: "Psychology",
    title: "Psychology",
    lessons: {
      lesson1: {
        title: "Psychology & Scientific Method",
        activities: ["video", "worksheet"],
      },
      lesson2: {
        title: "How the Brain Works",
        activities: ["video", "worksheet"],
      },
      lesson3: { title: "Memory", activities: ["video"] },
      lesson4: { title: "Mind Tricks", activities: ["video", "quiz"] },
    },
  },
  statistics: {
    name: "Statistics",
    title: "Statistics",
    lessons: {
      lesson1: { title: "Fractions", activities: ["video", "worksheet"] },
      lesson2: { title: "Advanced Percents", activities: ["video"] },
      lesson3: {
        title: "Advanced Percents",
        activities: ["video", "worksheet"],
      },
      lesson4: { title: "Types of Graphs", activities: ["video", "worksheet"] },
      lesson5: { title: "Surveys & Real World", activities: ["video", "quiz"] },
    },
  },
  zoology: {
    name: "Zoology",
    title: "Zoology",
    lessons: {
      lesson1: {
        title: "Classification & Taxonomy",
        activities: ["video", "worksheet"],
      },
      lesson2: { title: "Darwin's Theory", activities: ["video", "worksheet"] },
      lesson3: { title: "Distribution", activities: ["video"] },
      lesson4: { title: "Behavior", activities: ["video", "worksheet"] },
      lesson5: { title: "Anatomy & Physiology", activities: ["video", "quiz"] },
    },
  },
};

// Convert to array for dropdowns
export const courseList = Object.keys(courseData).map((key) => ({
  id: key,
  name: courseData[key].name,
  title: courseData[key].title,
}));

// Get course by ID
export const getCourseById = (courseId) => {
  return courseData[courseId] || null;
};

// Get all course names
export const getCourseNames = () => {
  return Object.keys(courseData);
};
