# Church Centrepoint API Testing

## Base URL
```
http://localhost:3001
```

---

## Authentication Endpoints

### 1. Register New User
```http
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com",
  "password": "Test@123456",
  "phone": "+254712345678"
}
```

### 2. Login
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@churchcentrepoint.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "first_name": "Super",
      "last_name": "Admin",
      "email": "admin@churchcentrepoint.com",
      "role": "super_admin",
      "status": "active"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User Profile
```http
GET http://localhost:3001/auth/profile
Authorization: Bearer {{access_token}}
```

### 4. Get Current User (Me)
```http
GET http://localhost:3001/auth/me
Authorization: Bearer {{access_token}}
```

---

## Test Credentials (After Seed)

### Super Admin
- **Email:** `admin@churchcentrepoint.com`
- **Password:** `Admin@123`
- **Role:** `super_admin`
- **Access:** Full system access

### GCI Tenant Admin
- **Email:** `admin@gci.org`
- **Password:** `GCI@Admin123`
- **Role:** `tenant_admin`
- **Access:** Full GCI tenant access

### Nairobi Branch Admin
- **Email:** `admin@nairobi-hq.gci.org`
- **Password:** `Branch@123`
- **Role:** `branch_admin`
- **Access:** Nairobi branch management

### Mombasa Branch Admin
- **Email:** `admin@mombasa.gci.org`
- **Password:** `Branch@123`
- **Role:** `branch_admin`
- **Access:** Mombasa branch management

### Kisumu Branch Admin
- **Email:** `admin@kisumu.gci.org`
- **Password:** `Branch@123`
- **Role:** `branch_admin`
- **Access:** Kisumu branch management

### Regular User
- **Email:** `jane.smith@gci.org`
- **Password:** `User@123`
- **Role:** `user`
- **Access:** Basic user access

---

## Testing Workflow

### 1. Login as Super Admin
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@churchcentrepoint.com",
    "password": "Admin@123"
  }'
```

### 2. Save the access_token from response

### 3. Get Profile
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Role-Based Access Testing

### Super Admin Can:
- Access all tenants
- Manage global templates
- View all users
- System configuration

### Tenant Admin Can:
- Manage their tenant
- Create/edit branches
- Manage tenant users
- Upload tenant templates

### Branch Admin Can:
- Manage their branch
- Create events for their branch
- Manage branch ministries
- View branch reports

### User Can:
- View events
- Create designs from templates
- Export designs
- Update their profile

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### 409 Conflict (Email exists)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

### 400 Bad Request (Validation error)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

---

## Next Steps

1. **Test Authentication** - Use the endpoints above
2. **Verify JWT Token** - Check token expiration (7 days)
3. **Test Role Guards** - Try accessing protected routes
4. **Build Frontend Auth** - Integrate with Next.js
