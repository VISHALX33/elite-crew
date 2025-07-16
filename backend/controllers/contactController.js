import ContactMessage from '../models/ContactMessage.js';

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const saved = await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Message received!', data: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 