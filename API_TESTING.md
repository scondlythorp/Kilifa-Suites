# KILIFA SUITES — REST API DOCUMENTATION & THUNDER CLIENT TESTING

## BASE URL
`http://localhost:3000/api`

---

## 1. SUITES ENDPOINTS

### `GET /api/suites`
Retrieves all 12 suites across House 1 and House 2.

**curl example:**
```bash
curl -X GET http://localhost:3000/api/suites
```

**Example Response (200 OK):**
```json
{
  "status": "success",
  "count": 12,
  "data": [
    {
      "id": "suite-01",
      "slug": "suite-01",
      "name": "[SUITE NAME 01]",
      "houseNumber": 1,
      "floor": "Ground",
      "pricePerNight": 120,
      "maxOccupancy": 2,
      "bedrooms": 1,
      "bathrooms": 1,
      "parlor": true
    }
  ]
}
```

---

### `GET /api/suites/:id`
Retrieves details for a specific suite by ID or slug (e.g. `suite-01`).

**curl example:**
```bash
curl -X GET http://localhost:3000/api/suites/suite-01
```

---

## 2. BOOKINGS ENDPOINTS

### `POST /api/bookings`
Creates a new suite reservation request.

**curl example:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Musa Njie",
    "email": "musa.njie@example.com",
    "phone": "+220 700 0000",
    "checkIn": "2026-08-20",
    "checkOut": "2026-08-25",
    "guestsCount": 2,
    "preferredSuite": "suite-01",
    "specialRequests": "Airport shuttle pickup requested"
  }'
```

**Example Response (201 Created):**
```json
{
  "status": "success",
  "message": "Thank you. Your booking request has been received. Our team will contact you to confirm availability and your reservation.",
  "data": {
    "id": "bkg-1754778000000",
    "bookingReference": "KS-882910",
    "fullName": "Musa Njie",
    "email": "musa.njie@example.com",
    "phone": "+220 700 0000",
    "checkIn": "2026-08-20",
    "checkOut": "2026-08-25",
    "guestsCount": 2,
    "preferredSuite": "suite-01",
    "suiteName": "[SUITE NAME 01]",
    "pricePerNight": 120,
    "totalNights": 5,
    "totalEstimatedPrice": 600,
    "specialRequests": "Airport shuttle pickup requested",
    "status": "pending",
    "createdAt": "2026-08-09T15:00:00.000Z"
  }
}
```

---

### `GET /api/bookings/:id`
Retrieves details for a booking by ID or reference number.

**curl example:**
```bash
curl -X GET http://localhost:3000/api/bookings/bkg-demo-101
```

---

## 3. GUESTS ENDPOINTS

### `GET /api/guests`
Retrieves registered guest profiles.

**curl example:**
```bash
curl -X GET http://localhost:3000/api/guests
```

### `GET /api/guests/:id`
Retrieves a single guest profile by ID.

**curl example:**
```bash
curl -X GET http://localhost:3000/api/guests/gst-101
```

---

## 4. CONTACT ENDPOINTS

### `POST /api/contact`
Submits a general inquiry or contact message.

**curl example:**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Fatou Sow",
    "email": "fatou.sow@example.com",
    "phone": "+220 711 1111",
    "subject": "Corporate Retreat Booking",
    "message": "Inquiring about booking House 1 for 5 days."
  }'
```

---

## 5. MEDIA ENDPOINTS

### `GET /api/media`
Retrieves real property photos and video media metadata.

**curl example:**
```bash
curl -X GET http://localhost:3000/api/media
```

---

## THUNDER CLIENT TESTING INSTRUCTIONS
1. Open VS Code / Thunder Client.
2. Click **Collections** -> **Import**.
3. Select `thunder-client-collection.json` at the root of the project.
4. Execute any request against `http://localhost:3000/api/...`.
