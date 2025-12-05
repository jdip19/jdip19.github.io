# Firebase Security Setup Guide

## Quick Setup Steps

### 1. Apply Security Rules to Firebase

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **imager-678f0**
3. Go to **Realtime Database** → **Rules** tab
4. Copy the entire content from `firebase-security-rules.json`
5. Paste it into the Rules editor
6. Click **Publish**

### 2. Verify Rules Are Active

After publishing, test by:
- Reading stats: Should work ✅
- Writing invalid data: Should be rejected ❌
- Writing valid increments: Should work ✅

### 3. Optional: Enable App Check (Recommended)

1. Go to Firebase Console → **App Check**
2. Click **Get Started**
3. Register your extension
4. This adds an extra layer of protection

## Security Features Implemented

✅ **Path Validation** - Only allows access to predefined paths  
✅ **Rate Limiting** - Max 60 updates/minute per user  
✅ **Batch Size Limits** - Max 100 updates per batch  
✅ **Value Validation** - Only allows increments, max +100 per write  
✅ **Read-Only Version Field** - Version cannot be modified  

## What the Rules Do

- **svgStats/copied** and **svgStats/downloaded**: 
  - Can be read by anyone (for display)
  - Can only be incremented (not set to arbitrary values)
  - Maximum increment of +100 per write (prevents abuse)
  - Must be non-negative numbers

- **ueVersion**: 
  - Can be read by anyone
  - Cannot be written (read-only)

- **All other paths**: 
  - Blocked by default (read and write disabled)

## Testing Security

Try these in Firebase Console → Realtime Database → Data:

1. ✅ **Valid increment**: `svgStats/copied = 5` → `6` (should work)
2. ❌ **Invalid decrement**: `svgStats/copied = 5` → `4` (should fail)
3. ❌ **Large jump**: `svgStats/copied = 5` → `1000` (should fail)
4. ❌ **Write to version**: `ueVersion = "2.5"` (should fail)
5. ❌ **Write to other path**: `unauthorized/path = "test"` (should fail)

## Monitoring

Check Firebase Console → Usage regularly for:
- Unusual read/write patterns
- Rate limit violations
- Suspicious activity

## Need Help?

If you see errors or need to adjust rules:
1. Check Firebase Console → Realtime Database → Rules for syntax errors
2. Review `SECURITY.md` for detailed security information
3. Test rules in Firebase Console → Rules → Simulator

