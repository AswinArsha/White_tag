# WhiteTag Login Credentials

This file contains all the login credentials for testing your WhiteTag application.

## 🔐 **User Accounts**

### Demo User (No real authentication)
- **Email**: `demo@whitetag.com`
- **Password**: `demo123`
- **Access**: User dashboard with demo data
- **Note**: This is a demo account for testing purposes

### Regular User
- **Email**: `jagannath@whitetag.com`
- **Password**: `password123`
- **Access**: Full user dashboard with real data
- **Note**: Main user account with subscription

## 👨‍💼 **Admin Accounts**

### WhiteTag Admin
- **Email**: `admin@whitetag.com`
- **Password**: `admin123`
- **Access**: Full admin dashboard
- **Role**: `super_admin`
- **Permissions**: All access (users, pets, subscriptions, analytics)

## 🔧 **Password Hashes**

For direct database editing in Supabase dashboard:

```sql
-- Demo User (password: demo123)
'$2b$10$HAChsNhyDOX6NjRnm1y6/.9RbpiwaveqBicAwETx5Eb7hUTfx0LNy'

-- Regular User (password: password123)  
'$2b$10$Hb8zHSytD1xWYXxGqlLLQ.moBgjC/WJE4JgKJAx0emG12tCeAMHaG'

-- Admin (password: admin123)
'$2b$10$vcNQkqJTBoYqDLnd1QPlJegjrrs0qlJ2dlQ14BIq/mj7oM0XRK4ye'

-- Alternative strong password (password: whitetag2024)
'$2b$10$InOfIZik39Zli7i82qDdKehcHTBbE5kcICPQ606k6/Ufh3xZOVMUW'
```

## 🔄 **Demo Login Buttons**

The app includes "Demo Login" buttons that don't require passwords:

- **User Demo**: Click "Try Demo (No Login Required)" on `/login`
- **Admin Demo**: Click "Admin Demo (No Login Required)" on `/admin/login`

## 🛠️ **Generating New Password Hashes**

To create new password hashes for your database:

```bash
# Run the password hash generator
node scripts/generate-password-hash.cjs

# Or generate a specific password hash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('your_new_password', 10).then(hash => console.log(hash));
"
```

## 🔐 **Security Notes**

- **Production**: Change all default passwords before going live
- **Database**: Password hashes are stored using bcrypt with salt rounds = 10
- **Authentication**: Uses custom database authentication (no Supabase Auth)
- **Session Management**: localStorage-based sessions for simplicity
- **Demo Accounts**: Clearly marked as demo in the database (`is_demo: true`)

## 📱 **Testing Flow**

1. **Landing Page**: `http://localhost:8081/`
2. **User Login**: Click "Login" → Use demo login or real credentials
3. **Admin Login**: Click "Admin Login" → Use admin demo or real credentials
4. **Dashboard**: Access respective dashboards after login
5. **Logout**: Use logout buttons to clear session

---

💡 **Quick Access**: Use demo logins for immediate testing without entering credentials! 