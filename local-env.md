# JOMS Frontend — Local ENV

Copy this block into `Joms-Frontend/.env`, then restart the Vite dev server.

**Frontend:** `http://localhost:5173`  
**Backend:** local per-service ports (`Joms-backend/local-env.md`)

| Service      | Local API URL           | Port |
| ------------ | ----------------------- | ---- |
| auth         | `http://localhost:8000` | 8000 |
| admin        | `http://localhost:8001` | 8001 |
| kyc          | `http://localhost:8003` | 8003 |
| services     | `http://localhost:8004` | 8004 |
| venues       | `http://localhost:8005` | 8005 |
| membership   | `http://localhost:8006` | 8006 |
| settings     | `http://localhost:8007` | 8007 |
| payment      | `http://localhost:8008` | 8008 |
| chat         | `http://localhost:8009` | 8009 |
| notification | `http://localhost:8010` | 8010 |

---

## `.env` (local development)

```env
# Local development (per-service ports)
VITE_AUTH_API_BASE_URL=http://localhost:8000
VITE_ADMIN_API_BASE_URL=http://localhost:8001
VITE_SERVICE_API_BASE_URL=http://localhost:8004
VITE_VENUE_API_BASE_URL=http://localhost:8005
VITE_KYC_API_BASE_URL=http://localhost:8003
VITE_MEMBERSHIP_API_BASE_URL=http://localhost:8006
VITE_SETTINGS_API_BASE_URL=http://localhost:8007
VITE_PAYMENT_API_BASE_URL=http://localhost:8008
VITE_CHAT_API_BASE_URL=http://localhost:8009
VITE_NOTIFICATION_API_BASE_URL=http://localhost:8010

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAW1cl6kuGDB_sgw_6InqoJWVd9NZN7GBM
VITE_FIREBASE_AUTH_DOMAIN=iscorre.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=iscorre
VITE_FIREBASE_MESSAGING_SENDER_ID=435569350567
VITE_FIREBASE_APP_ID=1:435569350567:web:685382fb9a81aecea80882
VITE_FIREBASE_VAPID_KEY=BBfuVBoFza7u6mHuLiCIVAUU46AYulTx1sd0_lxOSMzPjhOborWMb9JbgCWOkWwiRfIGyCtQI3HqK6YSlc6UhyA

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC7gzHb0335ZzYsdSLRdkDF7uFhWjlxYus
```

---

## Notes

1. Do **not** set a shared `VITE_API_BASE_URL` unless you want every unset service to use `http://localhost:<port>` via `src/config/env.ts` defaults.
2. Restart after changing `.env`:

```bash
npm run dev
```

3. Make sure matching backend services are running on the ports above (see `Joms-backend/local-env.md`).
