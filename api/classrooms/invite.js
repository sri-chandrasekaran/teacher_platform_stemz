import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  // connect to client
  const db = await connectToDatabase();

  // prevent db conn failure
  if (!db) {
    return res.status(500).json({ message: 'Database connection failed' });
  } else {
    console.log("DB connection successful.");
  }

  const { className, student } = req.body;

  try {
    // Fetch the existing classroom
    const existingClass = await db.collection('classrooms').findOne({ className });

    if (!existingClass) {
      return res.status(404).json({ message: 'Classroom not found.' });
    }

    // TODO: check student exists in users document

    // Check if the student already exists in the classroom
    if (existingClass.students && existingClass.students.includes(student)) {
      return res.status(409).json({ message: 'Student already exists in the classroom.' });
    }

    // Add the student to the classroom
    const result = await db.collection('classrooms').updateOne(
      { $push: { students: student } } // Add the student to the students array
    );

    if (result.modifiedCount === 1) {
      return res.status(201).json({ message: 'Student added successfully.' });
    } else {
      return res.status(500).json({ message: 'Failed to add student.' });
    }
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({ message: 'Failed to add student.' });
  }
}
