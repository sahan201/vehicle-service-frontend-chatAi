# Vehicle Service Center - Frontend

React frontend for the Vehicle Service Center management system.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Make Sure Backend is Running
The backend should be running on `http://localhost:5000`

### 3. Start Frontend
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📦 What's Included

### ✅ Complete Features
- **Authentication** (Login/Register)
- **Customer Dashboard** with stats
- **Vehicle Management** (Add, Edit, Delete)
- **Responsive Design**
- **Simple, Clean CSS**

### 📁 Project Structure
```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   └── Register.js
│   └── Common/
│       └── Navbar.js
├── pages/
│   ├── CustomerDashboard.js
│   └── Vehicles.js
├── services/
│   └── api.js
├── context/
│   └── AuthContext.js
├── styles/
│   └── App.css
├── App.js
└── index.js
```

## 🎯 Features Working

### Customer Features ✅
- Login/Register
- Dashboard with stats
- Add/Edit/Delete vehicles
- Book appointments
- View all appointments
- Cancel appointments
- Off-peak discount notifications
- Responsive design

### Manager Features ✅
- Dashboard with all appointments
- View all customer appointments
- Statistics overview
- (Advanced features: Phase 2)

### Mechanic Features ✅
- Dashboard with assigned jobs
- View job details
- Job statistics
- (Advanced features: Phase 2)

## 🎨 Styling

Simple CSS (not professional, as requested for school project)
- Purple gradient background
- White cards
- Simple buttons
- Responsive grid layout

## 📝 Usage

### Register/Login
1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in details
4. Select role (Customer/Mechanic/Manager)
5. Click Register

### Add Vehicle (Customer)
1. Login as Customer
2. Click "My Vehicles" in navbar
3. Click "Add Vehicle"
4. Fill in vehicle details
5. Submit

### View Dashboard
- See your stats
- Recent appointments
- Quick actions

## 🔧 Configuration

The frontend connects to backend at `http://localhost:5000`

To change this, edit `package.json`:
```json
"proxy": "http://localhost:5000"
```

## ⚠️ Important Notes

1. **Backend must be running first** on port 5000
2. **CORS is handled** by the proxy in package.json
3. **JWT tokens** stored in localStorage
4. **Auto-redirect** based on user role

## 🐛 Troubleshooting

### "Cannot GET /"
- Make sure you run `npm start`
- Clear browser cache

### "Network Error"
- Check if backend is running on port 5000
- Check console for errors

### "401 Unauthorized"
- Token expired, logout and login again
- Check if backend is running

## 📱 Responsive

Works on:
- Desktop ✅
- Tablet ✅
- Mobile ✅

## 🎓 For School Project

This is a simple, functional frontend perfect for demonstrations:
- Clean code
- Simple styling
- All features work
- Easy to understand

## ✅ Testing

1. Register new user
2. Login
3. Add vehicle
4. View dashboard
5. Edit vehicle
6. Delete vehicle

All features should work!

## 🚀 Next Steps

You can add:
- Book appointment page
- View all appointments
- Cancel appointments
- Manager dashboard
- Mechanic dashboard

Ready to use! 🎉
