# Testing T&C Guard Browser Extension

## 1. Load the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/` in Chrome
   - Or go to Chrome menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the project folder containing `manifest.json`
   - The T&C Guard extension should appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "T&C Guard" and click the pin icon to keep it visible

## 2. Test Policy Detection

### Test Sites with Privacy Policies:
- **Google Privacy Policy**: https://policies.google.com/privacy
- **Facebook Data Policy**: https://www.facebook.com/privacy/policy/
- **Twitter Privacy Policy**: https://twitter.com/en/privacy
- **GitHub Privacy Statement**: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
- **Stripe Privacy Policy**: https://stripe.com/privacy

### What to Look For:
1. **Auto-Detection Badge**: A small teal badge should appear in the top-right saying "T&C detected"
2. **Extension Icon**: Should be clickable in the toolbar
3. **Content Analysis**: The popup should show loading, then analysis results

## 3. Test Extension Popup

1. **Click the T&C Guard icon** in the toolbar on any policy page
2. **Loading State**: Should show spinning loader with "Parsing legal documents..."
3. **Analysis Results**: Should display:
   - Site favicon and domain name
   - Animated trust score dial (0-100)
   - Confidence percentage
   - Key points summary (bullet points)
   - Red flags section (if any detected)
   - Action buttons (Accept/Reject/Alternatives/Export)

## 4. Test Core Features

### Trust Score Animation:
- The semicircle dial should animate from 0 to the calculated score
- Color should change based on score (red <50, yellow 50-74, green ≥75)

### Summary Bullets:
- Should show 6-10 plain language points
- Each bullet should have an appropriate icon
- Clicking bullets should show evidence (currently shows alert)

### Red Flags:
- Should appear for policies with concerning clauses
- Each flag should have severity rating (1-5)
- Should show evidence quotes and explanations

### Export Feature:
- Click "Export Report" button
- Should copy formatted report to clipboard
- Button should show "✅ Copied!" feedback

## 5. Test on Different Page Types

### Policy Pages (Should Work):
- Privacy policies
- Terms of service
- Cookie policies
- Data policies

### Non-Policy Pages (Should Show "No Policy"):
- Regular website homepages
- Product pages
- Blog posts

### Error Cases:
- Pages with very short content
- Pages that fail to load
- Should show error state with retry option

## 6. Debug Console Testing

1. **Open Developer Tools** (F12)
2. **Check Console Tab** for any errors
3. **Check Extension Background Page**:
   - Go to `chrome://extensions/`
   - Find T&C Guard extension
   - Click "service worker" link to see background script logs

## 7. Test Content Script

1. **Open any website**
2. **Check if content script loads**:
   - Open DevTools → Console
   - Look for T&C Guard related logs
   - Badge should appear on policy pages

## 8. Expected Behavior Examples

### On Google Privacy Policy:
- Trust score: ~60-70 (moderate)
- Red flags: Data sharing, broad data collection
- Summary: Should mention data collection, sharing with partners, user controls

### On GitHub Privacy Policy:
- Trust score: ~75-85 (good)
- Fewer red flags
- Summary: Should mention limited data collection, user rights

### On Facebook Data Policy:
- Trust score: ~40-60 (concerning)
- Multiple red flags: Data selling, broad licenses, tracking
- Summary: Should highlight extensive data collection and sharing

## 9. Troubleshooting Common Issues

### Extension Won't Load:
- Check manifest.json syntax
- Ensure all referenced files exist
- Check Chrome DevTools for errors

### Popup Won't Open:
- Check popup.html and popup.js for errors
- Verify popup dimensions in manifest
- Check browser console for JavaScript errors

### Analysis Not Working:
- Check background.js for errors
- Verify content script injection
- Test on different websites

### No Badge Appearing:
- Check content.js is loading
- Verify content script matches in manifest
- Test on known policy pages

## 10. Performance Testing

- **Load Time**: Popup should open within 1-2 seconds
- **Analysis Speed**: Should complete within 3-5 seconds
- **Memory Usage**: Check Chrome Task Manager for reasonable memory usage
- **Cache Testing**: Revisit same page - should load from cache faster

## Success Criteria

✅ Extension loads without errors
✅ Auto-detects policy pages with badge
✅ Popup opens and shows analysis
✅ Trust score animates correctly
✅ Red flags appear with evidence
✅ Export functionality works
✅ No console errors
✅ Responsive design works at different sizes
✅ All buttons and interactions work
✅ Cache system improves repeat visits