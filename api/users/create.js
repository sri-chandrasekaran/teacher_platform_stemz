import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const db = await connectToDatabase();

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email are required' });
  }

  try {
    const result = await db.collection('users').insertOne({
      name,
      email,
      isStudent: 0,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'User created', userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
