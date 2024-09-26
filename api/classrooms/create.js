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
  }

  const { className } = req.body;

  if (typeof className !== 'string' || className.trim() === '') {
    return res.status(400).json({ message: 'Invalid classroom name.' });
  }

  try {
    const result = await db.collection('classrooms').insertOne({
      className,
      students: [],
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Classroom created', classID: result.insertedId });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ message: 'Failed to create classroom' });
  }
}
