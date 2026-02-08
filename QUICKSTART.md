# 🚀 Quick Start - Deploy to Vercel (5 Minutes)

[← Back to Main README](README.md)

## Prerequisites
- GitHub account
- Vercel account (free - sign up with GitHub)

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "v1.0.0 - Fully Responsive with Live Location & Distance Range"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/europe-treks.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   HF_API_TOKEN=your_hugging_face_token_here
   ```

6. Click "Deploy"

### 3. Done! 🎉
Your site will be live at: `https://europe-treks-XXXXX.vercel.app`

## Update Firebase Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `europe-treks`
3. Go to Firestore Database → Rules
4. Copy the rules from `firestore.rules` file
5. Click "Publish"

## Test Your Live Site
- [ ] 📍 **Live Location**: Click "Use My Location" (Home) or "Retry GPS" (Map) and find trails within 50km
- [ ] 📏 **Distance Range**: Select 5-10km and see exact matching results
- [ ] 🎨 **Responsive UI**: Test on phone, tablet, and desktop (Fixed Nav Dashboard on mobile)
- [ ] 📸 **Clickable Images**: Tap any trek image to view details
- [ ] 🎯 **Map Centering**: Use the "Center Map" button on mobile after GPS lock
- [ ] 🤖 **AI Discovery**: Try searching "Swiss Alps" and find more with AI
- [ ] ⭐ **Review System**: Submit a real review with a photo

## Custom Domain (Optional)
1. Buy a domain from Namecheap/Google Domains (~$12/year)
2. In Vercel dashboard → Settings → Domains
3. Add your domain
4. Update DNS records as instructed

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.
