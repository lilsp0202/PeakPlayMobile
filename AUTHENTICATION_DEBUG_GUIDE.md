# 🔍 AUTHENTICATION & BUTTON VISIBILITY DEBUG GUIDE

## 🚨 **Issue Identified: 401 Unauthorized Error**

The View Demo/View Proof buttons aren't showing because the Actions API is returning **401 Unauthorized** errors, which means the authentication is failing.

## 🔧 **Immediate Fixes Required**

### **Step 1: Fix Session/Authentication Issue**

The problem is likely one of these:

1. **URL Mismatch**: You're accessing the app via `192.168.1.75:3000` but the server is on `localhost:3000`
2. **Session Expired**: Your coach session may have expired
3. **Coach Profile Missing**: The coach profile might not be properly linked to your user

### **Step 2: Try These Solutions (In Order)**

#### **Solution A: Use Localhost URL**
- **Instead of:** `http://192.168.1.75:3000`
- **Use:** `http://localhost:3000`
- This ensures session cookies work properly

#### **Solution B: Clear Session & Re-login**
1. Go to: `http://localhost:3000/api/auth/signout`
2. Clear browser cookies/localStorage 
3. Go to: `http://localhost:3000/auth/signin`
4. Login with: `coach1@transform.com` / `password123`

#### **Solution C: Check Coach Profile**
- The API expects a coach profile linked to your user account
- Verify you're logged in as a coach, not a student

## 🎯 **Button Logic Requirements**

The buttons appear when these conditions are met:

### **View Demo Button:**
```javascript
item.demoMediaType && item.demoFileName
```

### **View Proof Button:**
```javascript
item.proofMediaType && item.proofFileName  
```

## 📊 **Current Database Status**

**✅ Sample Actions Created:**
- "Shooting Technique Demo" - Has both demo + proof media
- "Dribbling Drill Practice" - Has demo media only  
- "Fitness Challenge Completion" - Has proof media only
- "Free Throw Form Check" - Has both demo + proof media
- "Speed Test Results" - Has proof media only

## 🔍 **Debugging Steps**

### **1. Check Authentication Status**
Visit: `http://localhost:3000/api/auth/session`
- **Expected:** JSON with user info
- **If 401:** Session expired - re-login required

### **2. Test Track API Access**  
Visit: `http://localhost:3000/api/track?type=actions&student=all&category=all&priority=all&status=all&dateRange=week`
- **Expected:** JSON with actions array
- **If 401:** Authentication issue - try re-login

### **3. Check Browser Developer Tools**
1. Open DevTools → Network tab
2. Navigate to Actions tab
3. Look for failed API calls (red status codes)
4. Check if calls are returning 401 errors

## 🚀 **Quick Resolution Steps**

1. **Access via localhost**: `http://localhost:3000`
2. **Sign out**: `/api/auth/signout`  
3. **Sign in**: `/auth/signin` with `coach1@transform.com`
4. **Navigate to**: Coach Dashboard → Students → Track → Actions
5. **Verify**: Actions load and buttons appear

## 💡 **Expected Behavior After Fix**

You should see:
- ✅ Actions load within 3 seconds
- ✅ Blue "View Demo" buttons on actions with demo media
- ✅ Green "View Proof" buttons on actions with proof media  
- ✅ File sizes shown next to buttons (e.g., "2MB")
- ✅ No 401 errors in browser developer tools

---

**If the issue persists after following these steps, the next debugging step is to check the coach profile creation and user-coach relationship in the database.** 