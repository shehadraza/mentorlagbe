
import "dotenv/config";
import { MongoClient } from "mongodb";

const demoTuitions = [
  {
    seedKey: "mentorlagbe-demo-english-class-6-8",
    title: "English Tutor for Class 6–8",
    subject: "English",
    classLevel: "Class 6-8",
    mode: "Offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 4000,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
    description:
      "Build strong English grammar, vocabulary, reading and writing skills through structured lessons, practice and regular assessments.",
    tutorName: "Nusrat Jahan",
    tutorEmail: "nusrat.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-physics-class-9-10",
    title: "Physics Tutor for SSC Candidates",
    subject: "Physics",
    classLevel: "Class 9-10",
    mode: "Online",
    location: "Online",
    monthlyFee: 5000,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1200",
    description:
      "Understand physics concepts, numerical problems and important SSC topics with focused explanations and exam preparation.",
    tutorName: "Arif Hasan",
    tutorEmail: "arif.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-chemistry-class-9-10",
    title: "Chemistry Coaching for Class 9–10",
    subject: "Chemistry",
    classLevel: "Class 9-10",
    mode: "Offline",
    location: "Uttara, Dhaka",
    monthlyFee: 4500,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200",
    description:
      "Learn chemistry through clear explanations of chemical reactions, equations, periodic properties and practical examples.",
    tutorName: "Farhan Ahmed",
    tutorEmail: "farhan.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-biology-hsc",
    title: "HSC Biology Complete Preparation",
    subject: "Biology",
    classLevel: "HSC",
    mode: "Online",
    location: "Online",
    monthlyFee: 5500,
    daysPerWeek: 4,
    bannerImage:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200",
    description:
      "Prepare for HSC Biology with chapter-based lessons, diagrams, creative questions and regular model tests.",
    tutorName: "Nusrat Jahan",
    tutorEmail: "nusrat.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-mathematics-class-6-8",
    title: "General Mathematics for Class 6–8",
    subject: "Mathematics",
    classLevel: "Class 6-8",
    mode: "Offline",
    location: "Mirpur, Dhaka",
    monthlyFee: 3500,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200",
    description:
      "Strengthen mathematical foundations through guided practice in arithmetic, algebra, geometry and problem solving.",
    tutorName: "Arif Hasan",
    tutorEmail: "arif.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-ict-hsc",
    title: "HSC ICT and Programming Basics",
    subject: "ICT",
    classLevel: "HSC",
    mode: "Online",
    location: "Online",
    monthlyFee: 4000,
    daysPerWeek: 2,
    bannerImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    description:
      "Learn ICT fundamentals, number systems, logic gates, HTML and programming concepts with practical examples.",
    tutorName: "Farhan Ahmed",
    tutorEmail: "farhan.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-english-hsc",
    title: "English 1st and 2nd Paper for HSC",
    subject: "English",
    classLevel: "HSC",
    mode: "Offline",
    location: "Bashundhara, Dhaka",
    monthlyFee: 5000,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200",
    description:
      "Improve writing, grammar, comprehension and exam techniques for both HSC English papers.",
    tutorName: "Maliha Rahman",
    tutorEmail: "maliha.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-chemistry-hsc",
    title: "HSC Chemistry 1st and 2nd Paper",
    subject: "Chemistry",
    classLevel: "HSC",
    mode: "Online",
    location: "Online",
    monthlyFee: 6000,
    daysPerWeek: 4,
    bannerImage:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=1200",
    description:
      "Master organic and inorganic chemistry with topic-wise lessons, equation practice and exam-focused problem solving.",
    tutorName: "Maliha Rahman",
    tutorEmail: "maliha.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-accounting-hsc",
    title: "HSC Accounting Complete Course",
    subject: "Accounting",
    classLevel: "HSC",
    mode: "Offline",
    location: "Mohammadpur, Dhaka",
    monthlyFee: 5000,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200",
    description:
      "Understand accounting principles, journal entries, financial statements and board-style problems step by step.",
    tutorName: "Arif Hasan",
    tutorEmail: "arif.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-mathematics-hsc",
    title: "Higher Mathematics for HSC",
    subject: "Mathematics",
    classLevel: "HSC",
    mode: "Online",
    location: "Online",
    monthlyFee: 6500,
    daysPerWeek: 4,
    bannerImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200",
    description:
      "Study calculus, trigonometry, vectors and analytical geometry with detailed explanations and regular problem-solving sessions.",
    tutorName: "Nusrat Jahan",
    tutorEmail: "nusrat.demo@mentorlagbe.test",
  },
  {
    seedKey: "mentorlagbe-demo-science-class-6-8",
    title: "All-in-One Science for Class 6–8",
    subject: "Science",
    classLevel: "Class 6-8",
    mode: "Offline",
    location: "Banani, Dhaka",
    monthlyFee: 3800,
    daysPerWeek: 3,
    bannerImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200",
    description:
      "Explore general science through understandable lessons, real-life examples, chapter exercises and revision sessions.",
    tutorName: "Maliha Rahman",
    tutorEmail: "maliha.demo@mentorlagbe.test",
  },
];

async function seedTuitions(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri?.trim()) {
    throw new Error("MONGODB_URI is missing from server/.env");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  try {
    console.log("\n========== MENTORLAGBE TUITION SEED ==========\n");
    console.log("Connecting to MongoDB...");

    await client.connect();

    // Use the database specified in the environment when available.
    // Otherwise, use the database configured in MONGODB_URI.
    const configuredDatabase = process.env.MONGODB_DATABASE?.trim();
    const database = configuredDatabase
      ? client.db(configuredDatabase)
      : client.db();

    const tuitions = database.collection("tuitions");

    console.log("Database:", database.databaseName);
    console.log("Collection: tuitions");

    const operations = demoTuitions.map((tuition) => ({
      updateOne: {
        filter: {
          seedKey: tuition.seedKey,
        },
        update: {
          $setOnInsert: {
            ...tuition,
            approvalStatus: "approved",
            isActive: true,
            isDemoSeed: true,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await tuitions.bulkWrite(operations, {
      ordered: true,
    });

    const total = await tuitions.countDocuments();

    const approvedActive = await tuitions.countDocuments({
      approvalStatus: "approved",
      isActive: true,
    });

    const demoTotal = await tuitions.countDocuments({
      isDemoSeed: true,
    });

    console.log("\n========== SEED RESULTS ==========\n");
    console.log("Demo listings prepared:", demoTuitions.length);
    console.log("New listings inserted:", result.upsertedCount);
    console.log("Existing demo listings skipped:", result.matchedCount);
    console.log("Total demo listings:", demoTotal);
    console.log("Total tuition records:", total);
    console.log("Approved and active listings:", approvedActive);

    console.log("\nSeeding completed successfully.");
  } catch (error) {
    console.error("\nTuition seeding failed.");

    if (error instanceof Error) {
      console.error("Reason:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    throw error;
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed.");
  }
}

seedTuitions().catch(() => {
  process.exitCode = 1;
});
