# WhiteTag Database Setup

Complete PostgreSQL database schema for the WhiteTag pet tracking application (Supabase compatible).

## Quick Setup

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/whitetag_schema.sql`
4. Click "Run"

### Option 2: Command Line
```bash
# If using local PostgreSQL
psql -U postgres -d your_database_name -f database/whitetag_schema.sql
```

## Database Overview

### 📊 **Core Tables**

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User accounts | Email/password auth, contact info, demo users |
| `pets` | Pet profiles | Name, breed, privacy settings, QR codes |
| `subscriptions` | Payment plans | ₹599/year annual plans, status tracking |
| `admins` | Admin accounts | Role-based access, permissions |
| `qr_scans` | Analytics | Location tracking, WhatsApp sharing logs |
| `support_tickets` | Customer support | Help desk system |

### 🔑 **Key Relationships**

```
users (1) ─→ (many) pets
users (1) ─→ (many) subscriptions  
pets (1) ─→ (many) qr_scans
users (1) ─→ (many) support_tickets
```

## Schema Features

### ✅ **Authentication & Users**
- Secure password hashing support
- Email verification system
- Demo user flag for testing
- Contact information (phone, WhatsApp, Instagram)

### ✅ **Pet Management**
- Unique usernames for profile URLs
- Privacy toggles for each contact method
- QR code generation tracking
- Lost/found status management
- Photo URL storage

### ✅ **Subscription System**
- Annual (₹599) and monthly plans
- Status tracking (active/expired/cancelled)
- Payment method recording
- Automatic expiry date management

### ✅ **Analytics & Tracking**
- QR code scan logging with geolocation
- WhatsApp sharing tracking
- Pet profile view statistics
- IP address and device tracking

### ✅ **Admin Panel Support**
- Role-based permissions (super_admin, admin, support)
- JSON permission storage
- Last login tracking
- User and pet management capabilities

### ✅ **Customer Support**
- Ticket categorization (technical, billing, lost_pet)
- Priority levels (low, medium, high, urgent)
- Status workflow (open → in_progress → resolved → closed)
- Links to users and pets

## Sample Data Included

The schema includes demo data for testing:

- **Admin Account**: `admin@whitetag.com` (password: `admin123`)
- **Demo User**: `demo@whitetag.com` (password: `demo123`, marked as demo)
- **Real User**: `jagannath@whitetag.com` (password: `password123`)
- **Sample Pets**: Fluffy (cat), Bruno (dog), Whiskers (cat)
- **QR Scan Data**: Sample scans from Kochi, Mumbai, Delhi
- **Support Ticket**: Sample technical issue

**Password Security**: All passwords are stored as bcrypt hashes with salt rounds = 10.

## Common Queries

```sql
-- View all users with subscription status
SELECT u.name, u.email, s.status, s.end_date 
FROM users u 
LEFT JOIN subscriptions s ON u.id = s.user_id;

-- View pets with owner info
SELECT p.name as pet_name, p.username, p.type, u.name as owner_name 
FROM pets p 
JOIN users u ON p.user_id = u.id;

-- QR scan analytics
SELECT p.name, p.total_scans, COUNT(qs.id) as scan_events 
FROM pets p 
LEFT JOIN qr_scans qs ON p.id = qs.pet_id 
GROUP BY p.id;

-- Check expired subscriptions
SELECT u.name, u.email, s.end_date 
FROM users u 
JOIN subscriptions s ON u.id = s.user_id 
WHERE s.end_date < CURDATE() AND s.status = 'active';
```

## Privacy & Security

- **Password Hashing**: Support for bcrypt/argon2 hashes
- **Email Verification**: Built-in verification workflow
- **Privacy Controls**: Per-pet privacy settings for contact info
- **Data Cleanup**: CASCADE deletes for data consistency
- **Index Optimization**: Performance indexes on frequently queried fields

## Production Considerations

1. **Change Default Passwords**: Update all demo passwords before production
2. **Environment Variables**: Store DB credentials securely (Supabase provides these)
3. **Row Level Security**: Enable RLS in Supabase for data protection
4. **SSL Connections**: Supabase uses encrypted connections by default
5. **Backup Strategy**: Supabase handles automated backups
6. **Monitoring**: Set up alerts for failed logins and subscription expiries

## PostgreSQL/Supabase Features Used

- **SERIAL**: Auto-incrementing primary keys
- **TIMESTAMPTZ**: Timezone-aware timestamps
- **JSONB**: Efficient JSON storage for admin permissions
- **CHECK Constraints**: Data validation instead of ENUMs
- **Triggers**: Automatic updated_at timestamp management
- **CASCADE**: Proper foreign key relationships

## Next Steps

1. **Backend API**: Connect this schema to Node.js/Express backend
2. **Authentication**: Implement JWT-based auth with password hashing
3. **File Upload**: Add image upload for pet photos
4. **Payment Gateway**: Integrate with Razorpay/Stripe for subscriptions
5. **WhatsApp API**: Connect to WhatsApp Business API
6. **Analytics Dashboard**: Build admin analytics using scan data

---

🏷️ **WhiteTag** - Premium Pet Protection Made in India 