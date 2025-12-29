# Imposter Custom - Word Game

A modern multiplayer word game where players compete to identify imposters in a group sharing a secret word.

## 🎮 Features

- **Local Multiplayer**: Pass & play mode for 2-10 players
- **Online Multiplayer**: Real-time peer-to-peer gaming using PeerJS
- **AI-Powered Content**: Dynamic game generation using Google Gemini AI
- **Custom Categories**: Create and play with your own word categories
- **Multiple Difficulty Levels**: Easy, Average, and Hard modes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, dark theme with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Alvington/ImposterGame.git
   cd ImposterGame
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎯 How to Play

### Local Mode
1. Select "Pass & Play" mode
2. Enter player names (2-10 players)
3. Choose category and difficulty
4. Each player views their role secret
5. Discuss and vote to eliminate suspected imposters
6. Win by catching all imposters before they win!

### Online Mode
1. Select "Online" mode
2. Host creates a room and shares the code
3. Players join using the room code
4. Host configures game settings
5. Start game and enjoy multiplayer action!

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Real-time Communication**: PeerJS
- **AI Integration**: Google Gemini AI
- **Icons**: Lucide React

## 🏗️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npx tsc --noEmit
```

### Project Structure

```
src/
├── components/         # Reusable React components
├── services/          # API and external service integrations
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles

public/               # Static assets
dist/                # Production build output
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

## 🚀 Deployment

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Alvington/ImposterGame)

1. Click the deploy button above
2. Connect your GitHub account
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Deploy automatically on every push to main branch

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting service

### Supported Platforms

- ✅ Netlify (recommended)
- ✅ Vercel
- ✅ GitHub Pages
- ✅ Firebase Hosting
- ✅ Any static hosting service

## 🎮 Game Rules & Mechanics

### Core Gameplay
- **Objective**: Civilians must identify all imposters before they take over
- **Word Sharing**: All players receive a common word, except imposters who get a related hint
- **Discussion Phase**: Players discuss and debate who might be an imposter
- **Voting**: Players vote to eliminate suspected imposters
- **Win Conditions**:
  - **Civilians Win**: All imposters are eliminated
  - **Imposters Win**: They equal or outnumber the remaining players

### Difficulty Levels

- **Easy**: Obvious word relationships, more time for discussion
- **Average**: Moderate word relationships, standard timing
- **Hard**: Subtle word relationships, faster gameplay

### Categories
- Animals, Food, Places, Objects, Actions, Professions, and more
- Custom categories supported for personalized gameplay

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**: `npm run build && npm run preview`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript best practices
- Maintain responsive design for mobile devices
- Add appropriate error handling
- Test new features across different browsers
- Update documentation as needed

### Reporting Issues

Please use the [GitHub Issues](https://github.com/Alvington/ImposterGame/issues) page to:
- Report bugs
- Request features
- Ask questions
- Provide feedback

## 📱 Screenshots

*Screenshots will be added soon - showing the game interface and gameplay*

## 🔒 Privacy & Data

- **No user data collection**: The game doesn't store personal information
- **Local storage**: Game progress and settings are stored locally in your browser
- **Online mode**: Real-time communication without data persistence
- **Open source**: All code is transparent and auditable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vite** for the lightning-fast build tool
- **Tailwind CSS** for the utility-first styling approach
- **Google Gemini AI** for powering dynamic content generation
- **PeerJS** for enabling real-time peer-to-peer communication
- **Lucide** for the beautiful icon set

## 📞 Support

Need help or have questions?

- **GitHub Issues**: [Create an issue](https://github.com/Alvington/ImposterGame/issues)
- **Documentation**: Check this README and inline code comments
- **Discussions**: Use GitHub Discussions for general questions

---

<div align="center">

**Made with ❤️ by Alvington**

[⭐ Star this project](https://github.com/Alvington/ImposterGame) if you enjoy playing!

</div>
