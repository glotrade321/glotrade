# Admin Creation and Management Guide

## Creating the First Super Admin

To create the first super admin account for the platform, follow these steps:

### 1. Navigate to the API directory
```bash
cd apps/api
```

### 2. Run the create-admin script
```bash
npm run create-admin
```

### 3. Follow the prompts
The script will guide you through creating the super admin account:
- **Email**: admint@glotrade.online (pre-configured)
- **Username**: Enter your desired username (default: superadmin)
- **Password**: Enter a secure password (minimum 8 characters)
- **First Name**: Optional
- **Last Name**: Optional

### 4. Save your credentials
The script will display your account details. **Save these credentials securely!**

### 5. Login
You can now login at: http://localhost:3000/auth/login

---

## Admin Role Management

### Promoting a User to Admin

**Endpoint**: `POST /api/v1/admin/promote-user`

**Access**: Super Admin only

**Request Body**:
```json
{
  "userId": "user_id_here"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "User promoted to admin successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "role": "admin",
    "isSuperAdmin": false
  }
}
```

### Demoting an Admin to Buyer

**Endpoint**: `POST /api/v1/admin/demote-user`

**Access**: Super Admin only

**Request Body**:
```json
{
  "userId": "user_id_here"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "User demoted to buyer successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "role": "buyer"
  }
}
```

### Listing All Admins

**Endpoint**: `GET /api/v1/admin/list-admins`

**Access**: Admin or Super Admin

**Response**:
```json
{
  "status": "success",
  "data": {
    "admins": [
      {
        "_id": "admin_id",
        "email": "admin@example.com",
        "username": "admin",
        "role": "admin",
        "isSuperAdmin": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### Getting Admin Statistics

**Endpoint**: `GET /api/v1/admin/stats`

**Access**: Admin or Super Admin

**Response**:
```json
{
  "status": "success",
  "data": {
    "totalAdmins": 5,
    "superAdmins": 1,
    "regularAdmins": 4
  }
}
```

---

## Role Hierarchy

1. **Super Admin** (`isSuperAdmin: true`)
   - Can promote/demote users
   - Full access to all admin features
   - Cannot be demoted

2. **Admin** (`role: "admin"`)
   - Access to admin dashboard
   - Can manage users, products, orders
   - Cannot promote/demote other admins

3. **Buyer** (`role: "buyer"`)
   - Regular user access
   - Can make purchases
   - No admin access

---

## Security Notes

- Only super admins can promote or demote users
- Super admins cannot be demoted
- All admin endpoints require authentication
- Admin promotion/demotion actions are logged

---

## Troubleshooting

### Script fails with "Super admin already exists"
If you see this message, a super admin account already exists. You can:
1. Answer "yes" when prompted to update the existing user to super admin
2. Or use the existing credentials

### Cannot login after creating admin
1. Verify the email and password you entered
2. Check that the database connection is working
3. Ensure the user was created successfully by checking the database

### Permission denied errors
1. Verify you're logged in as a super admin
2. Check the Authorization header is being sent correctly
3. Ensure the token hasn't expired
