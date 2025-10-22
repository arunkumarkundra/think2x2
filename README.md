# Think2x2 – The Power of Four Squares

A responsive, no-login web application for creating beautiful, shareable 2×2 matrix visualizations. Perfect for strategic planning, decision making, prioritization, and quadrant analysis.

![Think2x2 Logo](assets/favicon.svg)

## 🌟 Features

- **Visual Matrix Creation**: Create stunning 2×2 matrices with custom axes and data points
- **Multiple Templates**: Choose from Minimal, Modern, or Vibrant design styles
- **Export Options**: Download as PNG or SVG with professional formatting
- **Shareable Links**: Generate URLs that preserve your entire matrix state
- **No Login Required**: Everything runs client-side in your browser
- **Privacy First**: Your data never leaves your device
- **Fully Accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Deployment

Think2x2 is a static web application that can be deployed to any static hosting service:

#### GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to Settings → Pages
4. Select the branch to deploy (usually `main`)
5. Your site will be live at `https://yourusername.github.io/think2x2/`

#### Netlify

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your repository or drag & drop the folder
3. No build settings needed – deploy as static site
4. Your site will be live instantly

#### Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Import your repository
3. Framework preset: None
4. Deploy – done!

#### Other Hosting Options

- **AWS S3 + CloudFront**: Upload files to S3, enable static website hosting
- **Cloudflare Pages**: Connect repository and deploy
- **Azure Static Web Apps**: Deploy directly from GitHub
- **Firebase Hosting**: Use `firebase deploy`

### Local Development

To run Think2x2 locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/think2x2.git
cd think2x2

# Serve with any static server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (http-server)
npx http-server -p 8000

# Option 3: PHP
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

## 📁 Project Structure

```
think2x2/
├── index.html              # Main HTML structure
├── style.css               # Complete styling
├── app.js                  # Main application logic
├── js/
│   ├── utils.js           # Utility functions
│   ├── templates.js       # Visual templates
│   ├── matrix.js          # SVG matrix generation
│   ├── export.js          # PNG/SVG export
│   └── share.js           # URL encoding/sharing
├── assets/
│   └── favicon.svg        # App icon
└── README.md              # This file
```

## 🎯 How to Use

1. **Enter Matrix Details**
   - Add a title (required)
   - Optionally add a subtitle
   - Name your X and Y axes

2. **Add Data Points**
   - Click "Add Point" to add items to your matrix
   - Enter a label and X/Y values (0-100 scale)
   - Add as many points as needed

3. **Customize Appearance**
   - Choose from three visual templates:
     - **Minimal**: Clean monochrome design
     - **Modern**: Contemporary with color accents (default)
     - **Vibrant**: Bold colors for maximum impact

4. **Export & Share**
   - **PNG**: Download high-quality raster image
   - **SVG**: Download vector format (editable in design tools)
   - **Share**: Copy a link that preserves your entire matrix

## 🔧 Technical Details

### Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: SVG-based rendering
- **Export**: Canvas API for PNG conversion
- **Sharing**: Base64 URL encoding (no backend required)
- **Fonts**: Inter, Poppins (Google Fonts)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Key Features

- **No Dependencies**: Pure vanilla JavaScript – no frameworks
- **Module-based Architecture**: Clean separation of concerns
- **Responsive**: Mobile-first design with breakpoints at 480px, 768px, 992px, 1200px
- **Accessible**: Full keyboard navigation, ARIA labels, screen reader support
- **Performance**: Debounced updates, efficient SVG rendering
- **Security**: Input sanitization, XSS prevention

## 🎨 Customization

### Templates

Templates are defined in `js/templates.js`. Each template includes:

- Color schemes (background, quadrants, axes)
- Typography settings
- Point styling (colors, sizes, shadows)
- Visual effects (grids, labels)

To add a custom template:

```javascript
export const templates = {
    // ... existing templates
    custom: {
        name: 'Custom',
        description: 'Your custom design',
        background: '#ffffff',
        // ... add all required properties
    }
};
```

### Styling

All styles are in `style.css` with CSS custom properties for easy customization:

```css
:root {
    --color-primary: #2196f3;      /* Change primary color */
    --font-primary: 'Inter', sans-serif;  /* Change font */
    --spacing-lg: 24px;            /* Adjust spacing */
    /* ... more variables */
}
```

## 🔒 Privacy & Security

- **No Tracking**: No analytics or tracking scripts by default
- **No Backend**: Everything runs client-side
- **No Cookies**: No data persistence on server
- **Data Privacy**: Your matrices never leave your browser
- **XSS Protection**: All user inputs are sanitized
- **HTTPS Recommended**: For secure clipboard access

## 📝 License

MIT License - Feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please open an issue with:

- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

Have an idea? Open an issue with the "enhancement" label and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## 📞 Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Website**: https://think2x2.com

## 🎓 Use Cases

Think2x2 is perfect for:

- **Product Management**: Feature prioritization (Impact vs. Effort)
- **Strategy**: Risk assessment (Likelihood vs. Impact)
- **Decision Making**: Option evaluation (Cost vs. Value)
- **Project Planning**: Task prioritization (Urgency vs. Importance)
- **Business Analysis**: Market positioning (Quality vs. Price)
- **Personal Growth**: Goal setting (Difficulty vs. Reward)

## 🔮 Roadmap

Potential future enhancements:

- [ ] Additional template themes
- [ ] Custom quadrant labels
- [ ] Data import from CSV
- [ ] Collaborative editing
- [ ] Print optimization
- [ ] PDF export
- [ ] Custom color pickers
- [ ] Undo/redo functionality
- [ ] Matrix duplication
- [ ] Bulk data editing

## 📊 Examples

### Product Strategy Matrix

```
Title: Q4 Product Strategy
X-Axis: Technical Feasibility
Y-Axis: Business Impact

Points:
- Mobile App Redesign (85, 90)
- AI Chatbot Integration (45, 85)
- Performance Optimization (95, 60)
- Dark Mode (90, 40)
```

### Risk Assessment

```
Title: Project Risk Analysis
X-Axis: Likelihood
Y-Axis: Impact

Points:
- Budget Overrun (70, 85)
- Timeline Delays (60, 75)
- Resource Shortage (40, 90)
- Technical Debt (55, 65)
```

## 🙏 Acknowledgments

- Google Fonts for Inter and Poppins typefaces
- The open-source community for inspiration
- All users and contributors

---

**Think2x2** – Making strategic decisions visible, one matrix at a time.

*Built with ❤️ using vanilla JavaScript*
