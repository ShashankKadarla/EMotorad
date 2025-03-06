import express from 'express';
import { AppDataSource } from './data-source';
import { Contact } from './entities/Contact';

const app = express();
app.use(express.json());

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');

    app.post('/identify', async (req:any, res:any) => {
      console.log('📩 Received a POST request to /identify');
      console.log('Request Body:', req.body);

      const { email, phoneNumber } = req.body;

      if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'At least one contact info required' });
      }

      const contactRepository = AppDataSource.getRepository(Contact);

      try {
        // Find contacts matching email or phone number
        let matchingContacts = await contactRepository.find({
          where: [
            { email },
            { phoneNumber },
          ],
        });

        let primaryContact: Contact | null = null;

        if (matchingContacts.length > 0) {
          // Identify the primary contact
          primaryContact = matchingContacts.find((c) => c.linkPrecedence === 'primary') || matchingContacts[0];

          // Convert other primary contacts to secondary
          await Promise.all(
            matchingContacts
              .filter((c) => c.linkPrecedence === 'primary' && c.id !== primaryContact!.id)
              .map(async (contact) => {
                contact.linkPrecedence = 'secondary';
                contact.linkedId = primaryContact!.id;
                await contactRepository.save(contact);
              })
          );
        } else {
          // Create a new primary contact if none exists
          primaryContact = contactRepository.create({
            email,
            phoneNumber,
            linkPrecedence: 'primary',
          });
          await contactRepository.save(primaryContact);
        }

        // Ensure no duplicate secondary contact gets created
        const isNewEmail = email && !matchingContacts.some((c) => c.email === email);
        const isNewPhone = phoneNumber && !matchingContacts.some((c) => c.phoneNumber === phoneNumber);

        if ((isNewEmail || isNewPhone) && (email !== primaryContact.email || phoneNumber !== primaryContact.phoneNumber)) {
          const newSecondary = contactRepository.create({
            email,
            phoneNumber,
            linkPrecedence: 'secondary',
            linkedId: primaryContact.id,
          });
          await contactRepository.save(newSecondary);
        }

        // Fetch all linked contacts
        const allContacts = await contactRepository.find({
          where: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
        });

        // Prepare response
        const emails = Array.from(new Set(allContacts.map((c) => c.email).filter(Boolean)));
        const phoneNumbers = Array.from(new Set(allContacts.map((c) => c.phoneNumber).filter(Boolean)));
        const secondaryContactIds = allContacts.filter((c) => c.id !== primaryContact!.id).map((c) => c.id);

        return res.json({
          contact: {
            primaryContactId: primaryContact.id,
            emails,
            phoneNumbers,
            secondaryContactIds,
          }
        });

      } catch (error) {
        console.error('❌ Error in /identify:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Start the server
    app.listen(3001, () => {
      console.log('🚀 Server running on port 3001');
    });
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization:', err);
  });
