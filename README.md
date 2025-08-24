# T&C Guard - Terms & Privacy Policy Analyzer

A privacy-first browser extension that instantly analyzes Terms & Conditions and Privacy Policies, providing plain-language summaries, risk detection, and actionable insights.

## Features

- **Instant Detection**: Automatically detects T&C and Privacy Policy pages
- **Plain Language Summaries**: Converts legal jargon into 6-10 easy-to-understand bullet points  
- **Risk Assessment**: Identifies and highlights red flags with severity ratings
- **Trust Score**: Comprehensive scoring across 9 key privacy dimensions
- **Evidence Linking**: Every summary point links back to specific policy clauses
- **Privacy-First**: On-device analysis by default, with optional cloud mode
- **Export Reports**: Copy or download detailed analysis reports

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The T&C Guard icon will appear in your toolbar

## Usage

1. **Automatic Detection**: Visit any website - the extension automatically detects policy pages and shows a badge
2. **Manual Analysis**: Click the extension icon on any page to trigger analysis
3. **Review Results**: View trust score, summary bullets, and red flags in the popup
4. **Take Action**: Accept with caveats, reject, view alternatives, or export the report
5. **Full Report**: Click "Full Report" for detailed evidence and scoring breakdown

## Architecture

- **Manifest V3**: Modern extension architecture with service worker
- **Content Scripts**: DOM analysis and text extraction
- **Background Service**: Analysis engine and caching system
- **Rule-Based Analysis**: Pattern matching for common policy risks
- **Local Storage**: Cached results using IndexedDB for performance

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or store personal data
- **Local Processing**: Analysis runs on your device by default
- **Minimal Permissions**: Only requests necessary browser permissions
- **Open Source**: Full transparency in code and algorithms

## Development

Built with:
- Vanilla JavaScript (ES6+)
- Chrome Extensions API (Manifest V3)  
- CSS Grid & Flexbox
- Inter font family
- SVG icons

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## Support

For issues, feature requests, or questions, please open an issue on GitHub.