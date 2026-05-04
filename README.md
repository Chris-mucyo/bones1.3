# 🛍️ ShopHub

A full-stack e-commerce platform designed to connect buyers and sellers with a modern, scalable architecture. Built with a focus on performance, clean data modeling, and real-world usability.

---

## 🚀 Features

- 🔐 Authentication & Role-Based Access (Buyer, Seller, Admin)
- 🏪 Seller storefronts with product management
- 📦 Product listing, filtering, and search
- 🛒 Shopping cart & order management
- 📊 Seller analytics dashboard
- ⚡ Fast API with optimized database queries
- 📱 Responsive UI for mobile and desktop

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](./screenshots/home.png)

### 🛍️ Product Listings
![Products](./screenshots/products.png)

### 🔐 Authentication
![Login](./screenshots/login.png)

---

## 🧱 Tech Stack

### Frontend
- React (TypeScript)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL

### Tools
- Git & GitHub
- GitHub Actions (CI/CD)

---

## 📂 Project Structure

```
shophub/
│
├── frontend/        
├── backend/         
├── prisma/          
├── screenshots/     
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Chris-mucyo/shophub.git
cd shophub
```

---

### 2. Setup Backend
```bash
cd backend
pnpm install
```

Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/shophub"
JWT_SECRET="your_secret"
```

Run migrations:
```bash
npx prisma migrate dev
```

Start backend:
```bash
pnpm dev
```

---

### 3. Setup Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

---

## 🧠 Database Design (Prisma)

Main models:
- User
- Product
- Order
- Shop

---

## 📊 Analytics Dashboard

- Revenue tracking
- Product performance
- Sales trends

---

## 🔒 Security

- Password hashing
- JWT authentication
- Role-based authorization
- Input validation

---

## 🧪 Future Improvements

- 💳 Payment integration
- 🌍 Multi-language support
- 🔔 Notifications
- 📦 Order tracking
- 🤖 AI recommendations

---

## 🤝 Contributing

Pull requests are welcome.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Mucyo Chris**  
GitHub: https://github.com/Chris-mucyo  
 

---

## 💡 Note

This project demonstrates:
- API design
- Database modeling
- Frontend architecture
- Real-world collaboration
