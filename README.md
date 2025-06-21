# Clothing Inventory Management Application

A modern, full-stack web application for managing clothing inventory, built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## Features

- Add, view, update, and delete clothing items with images
- Search, filter, and paginate inventory
- Enquiry system: customers can send enquiries about items
- Email notifications to store owner and customer (configurable)
- Responsive, modern UI with image previews and modals
- RESTful API backend with authentication-ready structure

## Tech Stack

- **Frontend:** React, Tailwind CSS, Fetch API
- **Backend:** Node.js, Express, MongoDB (Mongoose), Nodemailer
- **Other:** Multer (file uploads), Dotenv, JWT-ready

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- (Optional) Gmail or SMTP credentials for email notifications

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd clothing-inventory
   ```

2. **Install dependencies:**
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the `backend` folder and fill in your MongoDB URI and email credentials.

4. **Start the backend server:**
   ```sh
   cd backend
   npm start
   ```

5. **Start the frontend app:**
   ```sh
   cd frontend
   npm start
   ```
   The app will run at [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/items` - List all items (with filters & pagination)
- `POST /api/items` - Add a new item (multipart/form-data)
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete (soft delete) an item
- `GET /api/items/:id` - Get item details
- `POST /api/email/enquiry` - Send an enquiry (triggers email)

## Email Configuration

- Set `EMAIL_USER`, `EMAIL_PASS`, and `STORE_EMAIL` in your `.env` file.
- Uses Gmail by default (App Password recommended).
- Both store owner and customer receive enquiry emails.

## Folder Structure

```
clothing-inventory/
  backend/
    controllers/
    models/
    routes/
    uploads/
    .env
    server.js
  frontend/
    public/
    src/
      components/
      services/
      App.js
      index.js
  README.md
```
## License

This project is licensed under the MIT License.

---

**Developed by K.Mounika**

For questions or support, please open an issue or contact the maintainer.
