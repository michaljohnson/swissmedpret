# SwissMedPreter Frontend

A React-based medical translation application for Swiss hospitals. This single-page app helps healthcare professionals communicate with patients who don't speak German by providing real-time translation and medical pictogram support.

## Features

- **Bilingual conversation view**: Patient language (top) and staff German (bottom)
- **Medical keyword highlighting**: Automatically highlights medical terms in bold
- **Medical pictograms**: Displays SVG illustrations with medical terms in both languages when keywords are detected
- **Language support**: 20+ languages for patient communication
- **Touch-friendly UI**: Designed for hospital tablets and desktop use
- **WebSocket integration**: Real-time communication with backend translation service
- **Fallback mode**: Works with mock data when backend is unavailable
- **High contrast design**: Clean medical color palette with excellent accessibility

## Project Structure

```
swissmedpreter-frontend/
├── src/
│   ├── components/
│   │   ├── ConversationPage.jsx      # Main page layout & state management
│   │   ├── Header.jsx                 # Top bar with logo and patient info
│   │   ├── TranscriptPanel.jsx        # Chat-style conversation display
│   │   ├── PictogramPanel.jsx         # Side panel with medical pictograms
│   │   ├── ControlBar.jsx             # Bottom controls & message input
│   │   ├── LanguageSelector.jsx       # Language dropdown
│   │   └── MedicalPictograms.jsx      # SVG pictogram components
│   ├── App.jsx                        # Root component
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Tailwind CSS styles
├── tailwind.config.js                 # Tailwind configuration
├── postcss.config.js                  # PostCSS configuration
├── vite.config.js                     # Vite configuration
└── package.json                       # Dependencies and scripts
```

## Setup

### Requirements
- Node.js 16+ (recommended 18+)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd swissmedpreter-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for production:
```bash
npm run build
```

Output will be in the `dist/` directory.

## Usage

### Starting a Conversation

1. **Select Language**: Choose the patient's language from the dropdown (20+ languages available)
2. **Type Message**: Enter text in the input field as if it were transcribed from the patient
3. **Send**: Click "Send" or press Enter to submit
4. **View Translation**: The message appears in the patient's language (top), and the German translation appears in the staff section (bottom)

### Recording Controls

- **Start/Stop Recording**: Toggle to simulate speech capture
- **Hands-Free Mode**: Enable for voice-activated workflow (toggle button)

### Medical Pictograms

When a medical keyword is detected (e.g., "Kopf", "Herz", "Schmerzen"), a side panel automatically slides in showing:
- SVG illustration of the body part/symptom
- The term in German
- The term in the patient's language
- Lexicon definition (if backend available)

The panel auto-hides after 5 seconds.

### Connection Status

A status indicator in the control bar shows:
- **Green**: Connected to backend
- **Yellow**: Connecting...
- **Red**: Disconnected (will retry automatically)

When disconnected, the app uses mock data for demo purposes.

## Backend Integration

### WebSocket Connection

The app connects to `ws://localhost:8080/ws/conversation`

**Send Format:**
```json
{
  "text": "patient message in their language",
  "sourceLang": "ar",
  "targetLang": "de"
}
```

**Expected Response:**
```json
{
  "originalText": "original message",
  "targetText": "translated to German",
  "detectedKeywords": ["kopf", "schmerzen"]
}
```

### REST API Endpoints

The app fetches data from:
- `GET /api/languages` - List of available languages
- `GET /api/lexicon/search?term=X` - Definitions and translations for medical terms

If these endpoints are unavailable, fallback data is used.

## Supported Medical Pictograms

The following terms automatically display pictograms:
- **Handgelenk** (wrist)
- **Kopf** (head)
- **Herz** (heart)
- **Knie** (knee)
- **Schmerzen** (pain)
- **Fieber** (fever)

Pictograms are rendered as clean SVG line drawings with medical styling.

## Technologies

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **WebSocket API** - Real-time communication

## Styling

All components use Tailwind CSS utility classes. Custom component styles are defined in `src/index.css` using `@layer components`:
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-toggle` - Toggle button
- `.card` - Card container
- `.medical-keyword` - Medical term highlighting

## Accessibility

- High contrast text for readability
- Large touch targets (minimum 48px)
- Keyboard navigation support
- Screen reader friendly semantic HTML
- Proper ARIA labels on interactive elements

## Demo Mode

When the backend is unavailable, the app demonstrates with:
- Mock translations for common phrases
- Keyword detection on patient messages
- Pictogram display for detected medical terms
- Fallback language list with 10 languages

Type messages like:
- "hello"
- "i have pain"
- "my head hurts"
- "fever"
- "wrist pain"

And watch them translate to German!

## Development

### Hot Module Replacement (HMR)

The dev server supports HMR - changes to React components will update in the browser instantly without losing state.

### Debugging

Browser DevTools:
1. Open Chrome DevTools (F12)
2. Check the **Console** tab for WebSocket messages and errors
3. Use the **Network** tab to inspect WebSocket frames

### Building Components

To add a new component:

1. Create a new file in `src/components/NewComponent.jsx`
2. Use Tailwind CSS classes for styling
3. Import and use in `ConversationPage.jsx`

Example:
```jsx
export default function MyComponent({ prop }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-bold text-gray-900">{prop}</h3>
    </div>
  );
}
```

## Performance Notes

- Build size: ~205KB (gzipped: ~65KB)
- CSS size: ~19KB (gzipped: ~4KB)
- Fast startup: ~150ms to ready state
- Responsive design works on tablets and desktop

## Troubleshooting

### "Cannot find module" errors
Run `npm install` to ensure all dependencies are installed.

### WebSocket connection fails
The app will automatically retry. Check that your backend is running on `localhost:8080`.

### Tailwind styles not applying
Ensure `src/index.css` is imported in `src/main.jsx` and that the content paths in `tailwind.config.js` include all template files.

### Build fails
Clear the cache and reinstall:
```bash
rm -rf node_modules dist
npm install
npm run build
```

## License

Part of the SwissMedPreter project for Swiss medical translation.
