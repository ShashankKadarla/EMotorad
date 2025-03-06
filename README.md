# Contact Management System

This project is built using Node.js, Express, and TypeORM with PostgreSQL as the database. Follow the steps below to set up and run the application.

## Prerequisites

Before you begin, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (Ensure you have the latest LTS version)
- [PostgreSQL](https://www.postgresql.org/download/) (Ensure PostgreSQL is installed and running)

## Project Structure

The project is organized as follows:
```
contact-manager/
├── src/
│   ├── entities/
│   │   ├── Contact.ts
│   ├── routes-identify.ts
│   ├── data-source.ts
│   ├── server.ts
├── package.json
├── tsconfig.json
```

## Database Schema

The system uses a single `Contact` table with the following structure:

| Column Name   | Data Type  | Description |
|--------------|-----------|-------------|
| id           | INT (PK)  | Unique identifier for each contact |
| phoneNumber  | VARCHAR   | Phone number of the contact (nullable) |
| email        | VARCHAR   | Email address of the contact (nullable) |
| linkPrecedence | ENUM ('primary', 'secondary') | Indicates whether the contact is primary or secondary |
| linkedId     | INT (FK)  | References another contact if this is a secondary contact |
| createdAt    | TIMESTAMP | Timestamp when the record was created |
| updatedAt    | TIMESTAMP | Timestamp when the record was last updated |

## Setup Instructions

1. Clone this repository to your local machine:
   ```sh
   git clone <repository-url>
   cd contact-manager
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure your PostgreSQL database:
   - Open `src/data-source.ts` and update the `username`, `password`, and `database` fields with your PostgreSQL credentials.
   
4. Run database migrations:
   ```sh
   npm run run-migrations
   ```

5. Start the server:
   - In development mode:
     ```sh
     npm run dev
     ```
   - In production mode:
     ```sh
     npm start
     ```

## How the System Works

### Step 1: Receiving an Identify Request
When a `POST` request is sent to `/identify`, the system receives a JSON object containing `email` and/or `phoneNumber`.

### Step 2: Searching for Existing Contacts
The system searches the database for contacts that match either the given email or phone number.

### Step 3: Determining Primary and Secondary Contacts
- If a matching contact exists, it is designated as the **primary contact**.
- Any other contacts that match but were previously marked as **primary** are converted to **secondary contacts** and linked to the primary contact.
- If no matching contact is found, a new **primary contact** is created.
- If a new email or phone number is introduced that doesn’t match existing contacts, a **secondary contact** is created and linked to the primary contact.

### Step 4: Returning the Response
The system returns a JSON response containing:
- The `primaryContactId`
- A list of all associated `emails`
- A list of all associated `phoneNumbers`
- A list of `secondaryContactIds`

## API Usage

### Identify Contact Endpoint
- **Endpoint:** `POST /identify`
- **Request 1:**
  ```json
  {
    "email": "shashank@example.com",
    "phoneNumber": "1234567890"
  }
  ```
- **Response:**
  ```json
  {
    "contact": {
      "primaryContactId": 1,
      "emails": ["shashank@example.com"],
      "phoneNumbers": ["1234567890"],
      "secondaryContactIds": []
    }
  }
  ```

#### Request 2:
```json
{ "email": "shashank@example.com", "phoneNumber": "9876543210" }
```
#### Response:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["shashank@example.com"],
    "phoneNumbers": ["1234567890", "9876543210"],
    "secondaryContactIds": [2]
  }
}
```

#### Request 2:
```json
{ "email": "bob@example.com", "phoneNumber": "9876543210" }
```
#### Response:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["alice@example.com", "bob@example.com"],
    "phoneNumbers": ["1234567890", "9876543210"],
    "secondaryContactIds": [2, 3]
  }
}
```

#### Request 3:
```json
{ "email": "charlie@example.com", "phoneNumber": "5555555555" }
```
#### Response:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["alice@example.com", "bob@example.com", "charlie@example.com"],
    "phoneNumbers": ["1234567890", "9876543210", "5555555555"],
    "secondaryContactIds": [2, 3, 4]
  }
}
```

This should guide you through setting up and running the code that i have shared, same as the video that i made, please let me know for further queries/ if the code doesnt work.






















