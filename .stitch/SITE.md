# Hotel Hoang Minh - Customer Account Area

**Stitch Project ID:** 12806413409878354001

## 1. Project Vision
Implement a complete Customer Account experience for the luxury Hotel Hoang Minh website. This system allows registered guests to manage their bookings, view account summary statistics, check loyalty points and benefits, manage coupons/vouchers, edit their personal profile, change passwords, and configure notification preferences.

## 2. Tech Stack
- Frontend Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Design System: Shadcn UI, Custom Tailwind theme mirroring Material Design / Hotel Hoang Minh specifications.

## 3. Sitemap
- [x] `/login` - Customer login page & Forgot Password Dialog
- [x] `/register` - Customer registration page
- [x] `/account` - Dashboard overview page with statistics and membership status
- [x] `/account/bookings` - History of customer bookings
- [x] `/account/bookings/[id]` - Detailed booking status, rooms details, history timeline
- [x] `/account/profile` - Edit profile, update avatar, and change password
- [x] `/account/rewards` - Detailed loyalty points status, progress bar, and tier benefits (STANDARD, SILVER, GOLD, PLATINUM)
- [x] `/account/vouchers` - Available promotional coupons with discount % and copy options
- [x] `/account/settings` - Preferences for notifications and site languages

## 4. API Endpoints Integrated
- `POST /customer-auth/register`
- `POST /customer-auth/login`
- `GET /customer-auth/me`
- `GET /customer/dashboard`
- `GET /customer/bookings`
- `GET /customer/bookings/:id`
- `PATCH /customer/bookings/:id/cancel`
- `GET /customer/vouchers`
- `PATCH /customer-auth/profile`
- `PATCH /customer-auth/change-password`
