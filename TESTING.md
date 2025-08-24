# Testing T&C Guard Web Application

## How to Test if the Application is Working

### 1. **Start the Application**
```bash
npm run dev
```
The app should start at `http://localhost:5173`

### 2. **Basic Functionality Tests**

#### ✅ **Interface Loading Test**
- Open `http://localhost:5173` in your browser
- **Expected**: Clean interface with T&C Guard header, URL input field, and example buttons
- **Success**: No console errors, all elements visible

#### ✅ **URL Input Validation Test**
- Type various URLs in the input field
- **Expected**: 
  - Valid URLs enable the "Analyze" button (turns from gray to teal)
  - Invalid text keeps button disabled
- **Test URLs**: `google.com`, `https://example.com`, `not-a-url`

#### ✅ **Loading State Test**
- Enter any URL and click "Analyze"
- **Expected**: 
  - Loading screen appears with animated steps
  - Progress indicators show: "Fetching policy content..." → "Extracting legal text..." → etc.
  - Loading takes 2-4 seconds

### 3. **Analysis Results Tests**

#### ✅ **Successful Analysis**
For this to work, you need URLs that:
- Allow CORS requests (most sites block this)
- Contain policy-like content (privacy, terms, etc.)
- Have sufficient text content (>500 characters)

**Expected Results**:
- Trust score dial animates from 0 to calculated score
- Summary bullets appear with icons
- Red flags section (if any concerning content found)
- Score breakdown with colored progress bars
- Export buttons work (copy to clipboard)

#### ❌ **Expected Failures (Due to CORS)**
Most websites will show:
- Error message: "Unable to fetch content from this URL"
- Suggestion to try different URLs
- "Try Again" and "Try Different URL" buttons

### 4. **Error Handling Tests**

#### Test Invalid URLs
- Enter: `not-a-website`, `http://fake-site-12345.com`
- **Expected**: "Analysis failed" error with retry options

#### Test CORS-Blocked Sites
- Enter: `https://google.com/privacy`, `https://facebook.com/privacy`
- **Expected**: "Access Blocked" error explaining CORS restrictions

### 5. **UI/UX Tests**

#### ✅ **Responsive Design**
- Resize browser window
- **Expected**: Layout adapts smoothly, no horizontal scrolling

#### ✅ **Animations**
- Trust score dial should animate smoothly
- Hover effects on buttons and cards
- Loading spinners and progress indicators

#### ✅ **Theme & Styling**
- Dark "Midnight Glass" theme with teal accents
- Glass morphism effects (subtle transparency/blur)
- Proper contrast and readability

### 6. **Console Tests**

Open browser DevTools (F12) → Console:

#### ✅ **No Critical Errors**
- Should see minimal console output
- No red error messages during normal operation

#### ✅ **Network Requests**
- Check Network tab when analyzing URLs
- Should see fetch requests to the entered URLs
- CORS errors are expected for most sites

## Current Limitations & Expected Behavior

### 🚫 **CORS Restrictions**
**Problem**: Most websites block cross-origin requests for security
**Result**: Most URLs will fail with "FETCH_ERROR"
**This is Normal**: Real-world deployment would need a backend proxy

### ✅ **What Should Work**
- Interface loading and navigation
- URL validation and input handling
- Loading states and animations
- Error handling and user feedback
- UI responsiveness and styling

### ✅ **What Might Work**
- Sites with permissive CORS policies
- Local HTML files (file:// URLs)
- Development/testing sites that allow CORS

## Success Criteria

### ✅ **Minimum Working State**
- [ ] App loads without errors
- [ ] URL input accepts and validates URLs
- [ ] Loading state appears when analyzing
- [ ] Error handling works for failed requests
- [ ] UI is responsive and styled correctly

### 🎯 **Full Working State** (Requires CORS-friendly URLs)
- [ ] Successfully extracts content from policy URLs
- [ ] Displays trust scores and analysis results
- [ ] Shows red flags and evidence
- [ ] Export functionality works
- [ ] All animations and interactions work

## Troubleshooting

### App Won't Start
```bash
# Check if dependencies are installed
npm install

# Start development server
npm run dev
```

### Console Errors
- Check browser console (F12) for specific error messages
- Most CORS errors are expected and normal
- Look for TypeScript or React errors

### Styling Issues
- Ensure Tailwind CSS is working
- Check if all components render properly
- Verify responsive design at different screen sizes

## Next Steps for Production

To make this work with real URLs, you would need:
1. **Backend Proxy Server**: Handle URL fetching server-side
2. **CORS Proxy Service**: Use services like `cors-anywhere` or custom proxy
3. **Browser Extension**: Original extension approach bypasses CORS
4. **API Integration**: Use existing policy analysis APIs