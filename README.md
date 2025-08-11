# 🤖 AI CodeNeir - Free AI Text & Image Generator

A modern, free AI-powered web application for text generation and image creation using Pollinations.AI. Built with Next.js 15, React 18, and Tailwind CSS.

![AI CodeNeir Preview](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=AI+CodeNeir+Preview)

## ✨ Features

### 🎯 **AI Text Generation**
- **Free unlimited text generation** using Pollinations.AI
- **Multiple AI models**: OpenAI, Mistral, LLaMA, Gemma, Claude
- **Real-time streaming responses** with typewriter effect
- **Markdown support** with **bold**, *italic*, `code`, and lists
- **Chat history** with copy and regenerate options
- **System prompts** for customized AI behavior
- **Safe mode** for family-friendly content

### 🎨 **AI Image Generation**
- **Free unlimited image generation** using Pollinations.AI
- **Multiple models**: Flux, Turbo, Stability AI, Flux-Realism
- **Customizable dimensions**: Square, Portrait, Landscape, Mobile
- **Advanced settings**: Seed control, enhancement, safety filters
- **Image variations** and regeneration
- **Download and share** generated images
- **No watermarks** on generated images

### 🌟 **User Experience**
- **Modern glassmorphism UI** with dark theme
- **Fully responsive** - works on desktop, tablet, and mobile
- **Fast and lightweight** - optimized for performance
- **No registration required** - start using immediately
- **No API keys needed** - completely free to use
- **Offline-ready** when deployed as static site

## 🚀 Live Demo

Try it out: [AI CodeNeir Live Demo]( https://ai.codeneir.com/ )

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **AI Provider**: Pollinations.AI (Free)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Deployment**: Static export compatible

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/thushan912/ai.codeneir.git
cd ai.codeneir
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

That's it! No API keys or configuration needed.

## 🌐 Deployment

### Static Hosting (Recommended)
Perfect for shared hosting, Netlify, Vercel, GitHub Pages:

```bash
# Build for static export
npm run build

# Files will be in the 'out' folder
# Upload contents to your hosting provider
```

### Server Deployment
For VPS or dedicated servers:

```bash
# Build and start
npm run build
npm start
```

See [deployment guides](./shared-hosting-guide.md) for detailed instructions.

## 🎮 Usage

### Text Generation
1. Navigate to the **Chat** tab
2. Type your question or prompt
3. Choose your preferred AI model
4. Enable/disable streaming mode
5. Get instant AI responses with markdown formatting

### Image Generation
1. Navigate to the **Image Studio** tab
2. Describe the image you want to create
3. Select model and dimensions
4. Adjust advanced settings if needed
5. Click "Generate" and get your image instantly

## 🔧 Configuration

### Available AI Models

**Text Models:**
- `openai` - GPT-based responses
- `mistral` - Mistral AI model
- `llama-3.1-8b` - Meta's LLaMA
- `gemma-2-9b-it` - Google's Gemma
- `claude-3-haiku` - Anthropic's Claude

**Image Models:**
- `flux` - High-quality general images
- `turbo` - Fast generation
- `stability` - Stability AI model
- `flux-realism` - Photorealistic images
- `flux-3d` - 3D-style images

### Environment Variables (Optional)
No environment variables required! The app works out of the box with Pollinations.AI.

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── ChatPanel.tsx  # AI chat interface
│   ├── ImageStudio.tsx # Image generation
│   └── Header.tsx     # Navigation
└── lib/               # Utilities
    ├── pollinations.ts # AI API integration
    ├── store.ts       # State management
    └── utils.ts       # Helper functions
```

## 🎨 Customization

### Themes
The app uses a dark theme by default. To customize:

1. Edit `src/app/globals.css` for global styles
2. Modify `tailwind.config.js` for color schemes
3. Update components in `src/components/` for UI changes

### AI Models
To add new models or providers:

1. Update `src/lib/pollinations.ts`
2. Add model options in components
3. Test with the new configurations

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design
- Test on multiple devices
- Keep bundle size optimized

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pollinations.AI** - For providing free AI services
- **Vercel** - For Next.js framework
- **shadcn/ui** - For beautiful UI components
- **Tailwind CSS** - For utility-first styling

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/thushan912/ai.codeneir/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/thushan912/ai.codeneir/discussions)
- **Documentation**: [Wiki](https://github.com/thushan912/ai.codeneir/wiki)

## 🎯 Roadmap

- [ ] Voice input/output support
- [ ] Image editing capabilities  
- [ ] Custom model fine-tuning
- [ ] Multi-language support
- [ ] Browser extension
- [ ] Mobile app versions

---

**Made with ❤️ by CodeNeir**

*Free AI for everyone - no limits, no costs, no compromises.*
