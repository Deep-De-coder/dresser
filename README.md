# Dresser - Smart Wardrobe Organizer with Agentic AI

> **Copyright © 2024 Deep Shahane. All rights reserved.**  
> This software is licensed under the MIT License. See [LICENSE](LICENSE) for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC)](https://tailwindcss.com/)
[![AI Agents](https://img.shields.io/badge/AI-Agents-purple)](https://github.com/features/ai)

A smart wardrobe organizer powered by autonomous AI agents that helps users manage their clothing with intelligent recommendations, outfit planning, and personalized style insights. Using advanced AI perception, planning, and learning systems, Dresser transforms your closet into an intelligent digital wardrobe.

## ✨ Features

### 🤖 Agentic AI System
- **🧠 Autonomous Agents**: Stylist, Perception, and Inventory agents with plan→act→reflect loops
- **🎯 Smart Recommendations**: AI-powered outfit suggestions based on weather, occasion, and preferences
- **📊 Learning System**: Feedback-driven learning that improves recommendations over time
- **🔍 Advanced Perception**: On-device and server-side image analysis with duplicate detection
- **📈 Wardrobe Insights**: Analytics on wear patterns, color preferences, and style gaps

### 🎨 User Experience
- **💬 Ask Dresser**: Natural language interface for outfit requests
- **⚡ Today's Fit**: One-tap outfit suggestions with weather integration
- **🧳 Trip Packer**: Intelligent packing lists for travel with laundry scheduling
- **📊 Style Analytics**: Comprehensive insights into your wardrobe usage
- **🔒 Privacy-First**: Local-first image processing with granular privacy controls

### 🛠️ Technical Features
- **🤖 AI-Powered Recognition**: Instantly identifies and categorizes clothing items from photos
- **📂 Smart Categorization**: Automatically sorts items into shirts, pants, jackets, and more
- **🗂️ Digital Inventory**: Transform your closet into a searchable digital wardrobe
- **🔄 Duplicate Prevention**: Avoid purchasing items you already own
- **🌐 Anytime Access**: Access your wardrobe inventory from anywhere
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🎨 Beautiful UI**: Modern, intuitive interface with smooth animations

## 🎯 Use Cases

Whether you're planning outfits, avoiding duplicate purchases, or just staying organized, Dresser turns your closet into a digital inventory you can access anytime.

### Perfect For:
- **👔 Fashion Enthusiasts**: Organize and showcase your style
- **🧳 Travelers**: Plan outfits for different destinations and seasons
- **🛍️ Shoppers**: Avoid buying duplicates and track your purchases
- **👗 Style Bloggers**: Create digital lookbooks and outfit inspiration
- **🏠 Minimalists**: Declutter and organize your wardrobe efficiently

## 🚀 Project Status

This project is currently in development for a hackathon. The goal is to bring this smart wardrobe organizer idea to life and demonstrate the power of AI in personal organization.

### 🎉 Current Milestones:
- ✅ **Core Application**: Complete Next.js application structure
- ✅ **UI Components**: All major components implemented
- ✅ **Photo Upload**: Drag-and-drop functionality with AI simulation
- ✅ **Wardrobe Management**: Digital inventory with filtering
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Error Handling**: Comprehensive error boundaries and loading states
- ✅ **SEO Optimization**: Meta tags, sitemap, and social sharing
- ✅ **PWA Ready**: Web app manifest and service worker support
- ✅ **Agentic AI System**: Complete autonomous agent architecture
- ✅ **Learning System**: Feedback-driven improvement with privacy controls
- ✅ **API Routes**: RESTful endpoints for all agentic features
- ✅ **Privacy Guardrails**: Comprehensive data protection and user control

### 🔮 Future Enhancements:
- 🚧 **Real AI Integration**: Connect to actual AI clothing recognition APIs
- 🚧 **User Authentication**: Secure user accounts and data
- 🚧 **Cloud Storage**: Persistent wardrobe data across devices
- 🚧 **Outfit Suggestions**: AI-powered outfit recommendations
- 🚧 **Social Features**: Share outfits and get style advice

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Deep-De-coder/dresser.git
   cd dresser
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # Azure Vision API (for image analysis)
   AZURE_VISION_ENDPOINT=https://your-cognitive-services.cognitiveservices.azure.com/
   AZURE_VISION_KEY=your_azure_vision_key

   # AI Assistant Configuration
   OLLAMA_URL=http://127.0.0.1:11434
   LLM_MODEL=phi3:instruct
   AI_PROVIDER=ollama

   # Optional: OpenAI Configuration (for future use)
   # OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set Up Ollama (for AI Assistant)**
   ```bash
   # Install Ollama (if not already installed)
   # Visit https://ollama.ai for installation instructions
   
   # Pull the required model
   ollama pull phi3:instruct
   
   # Start Ollama service
   ollama serve
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Testing the AI Assistant

Once you have Ollama set up, you can test the AI Assistant API:

```bash
# Test the assistant endpoint
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What should I wear for a business meeting tomorrow?",
    "weather": { "tempC": 12, "condition": "rain", "windKph": 18 },
    "preferences": { "style": "business-casual", "avoidColors": ["neon"] },
    "items": [
      { "id":"i1","name":"Navy blazer","category":"jacket","color":"navy","fabric":"wool","formality":"business" },
      { "id":"i2","name":"Light blue shirt","category":"shirt","color":"light blue","fabric":"cotton","formality":"business" },
      { "id":"i3","name":"Chinos","category":"pants","color":"khaki","formality":"business-casual" },
      { "id":"i4","name":"White sneakers","category":"shoes","color":"white","formality":"casual" }
    ]
  }'
```

Expected response:
```json
{
  "replyText": "For your business meeting in rainy weather, I recommend a professional yet weather-appropriate outfit...",
  "plan": {
    "top": "Light blue cotton shirt",
    "bottom": "Khaki chinos", 
    "shoes": "Brown leather oxfords (or clean white sneakers if casual is okay)",
    "outerwear": "Navy wool blazer",
    "accessories": ["Brown belt", "Minimal watch"]
  },
  "rationale": "This combination provides professional appearance while staying warm and dry.",
  "usedItems": ["i1","i2","i3"],
  "meta": { "provider": "ollama", "model": "phi3:instruct", "latencyMs": 1200 }
}
```
- `npm run lint` - Run ESLint

## ✅ Features Implemented

- **🎨 Modern UI/UX**: Beautiful, responsive design with smooth animations
- **📸 Photo Upload**: Drag-and-drop interface for uploading clothing photos
- **🤖 AI Processing Simulation**: Realistic AI categorization with confidence scores
- **🗂️ Wardrobe Management**: Digital inventory with filtering and organization
- **🔍 Category Filtering**: Filter items by clothing categories
- **❤️ Favorites System**: Mark and manage favorite clothing items
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **⚡ Performance**: Optimized with Next.js 14 and modern React patterns
- **♿ Accessibility**: Keyboard navigation and screen reader support
- **🌙 Dark Mode Ready**: Prepared for theme switching functionality

## 🧠 Agentic AI Architecture

Dresser implements a sophisticated multi-agent system with autonomous planning, execution, and learning capabilities:

### 🤖 Agent Types

#### **Stylist Agent**
- **Purpose**: Generates outfit recommendations based on user goals and constraints
- **Capabilities**: 
  - Plans outfit combinations using weather, occasion, and preferences
  - Executes wardrobe searches and scoring algorithms
  - Self-critiques and refines suggestions
  - Provides 2-3 outfit options with detailed rationales

#### **Perception Agent**
- **Purpose**: Analyzes uploaded clothing images and extracts attributes
- **Capabilities**:
  - On-device and server-side image analysis
  - Color, pattern, fabric, and formality detection
  - Duplicate detection using perceptual hashing
  - Embedding generation for semantic search

#### **Inventory Agent**
- **Purpose**: Manages wardrobe analytics and optimization
- **Capabilities**:
  - Tracks wear frequency and usage patterns
  - Identifies wardrobe gaps and suggests improvements
  - Analyzes color preferences and style trends
  - Provides data-driven wardrobe optimization

### 🔄 Plan→Act→Reflect Loop

Each agent follows a structured decision-making process:

1. **Plan**: Analyze goals, constraints, and available tools
2. **Act**: Execute planned actions using specialized tools
3. **Reflect**: Self-critique results and learn from outcomes
4. **Iterate**: Refine approach based on feedback and learning

### 🛠️ Tool Ecosystem

- **Weather Tool**: Real-time weather data for outfit planning
- **Wardrobe Tool**: Search, filter, and manage clothing items
- **Scoring Tool**: Evaluate outfit combinations with multi-factor analysis
- **Laundry Tool**: Track item cleanliness and wear status

### 📊 Learning System

- **Feedback Processing**: Extracts insights from user accept/reject decisions
- **Preference Learning**: Builds user style profiles over time
- **Rule Generation**: Creates adaptive rules for future recommendations
- **Performance Metrics**: Tracks accuracy and user satisfaction

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 14** - React framework with App Router
- **TypeScript 5.0** - Type-safe development
- **React 18** - Latest React features and hooks

### **Styling & UI**
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent iconography
- **Custom Design System** - Cohesive color palette and components

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Cross-browser CSS compatibility

### **File Handling**
- **React Dropzone** - Drag-and-drop file uploads
- **Image Optimization** - Next.js built-in image optimization

### **Performance & SEO**
- **Next.js Image Component** - Optimized image loading
- **Meta Tags** - Open Graph and Twitter Card support
- **Sitemap Generation** - SEO-friendly URL structure
- **PWA Support** - Progressive Web App capabilities

## 📁 Project Structure

```
dresser/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── stylist/       # Stylist agent endpoints
│   │   ├── items/         # Item management endpoints
│   │   ├── feedback/      # Learning system endpoints
│   │   └── gaps/          # Wardrobe analysis endpoints
│   ├── components/         # Reusable UI components
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page with AI features
│   ├── loading.tsx        # Loading state component
│   ├── error.tsx          # Error boundary
│   ├── not-found.tsx      # 404 page
│   └── [meta files]       # SEO and PWA configuration
├── components/             # React components
│   ├── agentic/           # AI agent UI components
│   │   ├── AskDresser.tsx # Natural language interface
│   │   ├── TodaysFit.tsx  # Quick outfit suggestions
│   │   ├── TripPacker.tsx # Travel planning
│   │   └── Insights.tsx   # Wardrobe analytics
│   ├── ui/                # Base UI components
│   ├── Header.tsx         # Navigation header
│   ├── PhotoUpload.tsx    # File upload component
│   ├── WardrobeGrid.tsx   # Wardrobe display grid
│   └── CategoryFilter.tsx # Category filtering
├── lib/                    # Core system libraries
│   ├── agents/            # AI agent implementations
│   │   ├── base-agent.ts  # Base agent class
│   │   ├── stylist-agent.ts # Outfit recommendation agent
│   │   ├── perception-agent.ts # Image analysis agent
│   │   └── inventory-agent.ts # Wardrobe analytics agent
│   ├── tools/             # Agent tool implementations
│   │   ├── weather.ts     # Weather data tool
│   │   ├── wardrobe.ts    # Wardrobe management tool
│   │   └── scoring.ts     # Outfit scoring tool
│   ├── db/                # Database layer
│   │   ├── types.ts       # Database types
│   │   ├── interface.ts   # Database interface
│   │   └── local-fallback.ts # Local storage fallback
│   ├── perception/        # Image analysis system
│   │   ├── embedding.ts   # Embedding generation
│   │   └── client-side.ts # Client-side processing
│   ├── learning/          # Learning system
│   │   └── feedback-processor.ts # Feedback processing
│   ├── privacy/           # Privacy controls
│   │   └── guardrails.ts  # Privacy guardrails
│   ├── config/            # Configuration management
│   ├── rate-limiting.ts   # API rate limiting
│   └── utils.ts           # Utility functions
├── types/                  # TypeScript type definitions
├── constants/              # Application constants
└── [config files]          # Build and development config
```

## 🧪 Testing the Agentic System

### Manual Test Plan

1. **Upload Items Test**
   - Upload 3 clothing items
   - Verify AI analysis appears with attributes
   - Check for duplicate detection warnings

2. **Ask Dresser Test**
   - Request "smart casual rainy day in NYC tomorrow"
   - Verify 2-3 outfit suggestions with rationales
   - Accept one suggestion and mark as worn

3. **Learning Test**
   - Reject an outfit with reason "too formal"
   - Request another outfit
   - Verify future suggestions reduce formality

4. **Privacy Test**
   - Toggle "Local-first images" setting
   - Upload an item
   - Verify server receives only tags/embeddings

5. **Trip Packer Test**
   - Create a 3-day trip to Paris
   - Add activities: business meetings, sightseeing
   - Verify packing list respects laundry cycles

### Environment Configuration

The system gracefully degrades when external services are unavailable:

- **No Database**: Uses in-memory local fallback
- **No Weather API**: Uses seasonal weather simulation
- **No AI Services**: Uses mock analysis and recommendations
- **No API Keys**: All features work with simulated data

### Privacy Controls

- **Local-First Images**: Keep raw photos client-side, upload only derived data
- **Data Retention**: Configurable retention periods (default: 365 days)
- **Analytics Opt-out**: Disable usage analytics and data sharing
- **Data Export/Delete**: Full user data control and GDPR compliance

## 🚀 System Capabilities

### 🎯 **Intelligent Recommendations**
- **Context-Aware**: Considers weather, occasion, and personal style
- **Multi-Factor Scoring**: Evaluates formality, color harmony, seasonality, and wear frequency
- **Adaptive Learning**: Improves suggestions based on user feedback
- **Rationale Generation**: Provides clear explanations for each recommendation

### 🧠 **Advanced AI Features**
- **Semantic Search**: Find items by description, not just categories
- **Duplicate Detection**: Prevents purchasing items you already own
- **Wear Pattern Analysis**: Tracks usage to optimize wardrobe rotation
- **Gap Identification**: Suggests missing pieces for complete outfits

### 🔒 **Privacy & Security**
- **Zero-Knowledge Architecture**: Your data stays private by default
- **Granular Controls**: Choose what data to share and for how long
- **Local Processing**: Image analysis happens on your device
- **Encrypted Storage**: All sensitive data is properly protected

### 📊 **Analytics & Insights**
- **Wardrobe Health**: Monitor item usage and identify underutilized pieces
- **Style Evolution**: Track how your preferences change over time
- **Cost Analysis**: Understand the value and ROI of your clothing investments
- **Seasonal Trends**: Adapt recommendations based on weather patterns

## 🎬 Quick Demo

### Example Interactions

**Ask Dresser:**
```
User: "What should I wear for a business meeting tomorrow in NYC?"
Dresser: "I recommend a navy blazer with a white shirt and charcoal pants. 
The weather will be 18°C with light rain, so I've included a waterproof 
jacket. This combination scores 92% for business formality and weather 
appropriateness."
```

**Today's Fit:**
```
Dresser: "Based on today's 22°C sunny weather, I suggest your blue 
cotton shirt with khaki chinos. You haven't worn this combination 
in 2 weeks, and it's perfect for casual Friday at the office."
```

**Trip Packer:**
```
User: "3-day trip to Paris, business meetings + sightseeing"
Dresser: "I've created a packing list with 2 business outfits, 1 
casual outfit, and essentials. The navy blazer can be worn for 
both business and dinner. Laundry scheduled for Day 2 evening."
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### License Summary
- ✅ **Commercial Use**: Allowed
- ✅ **Modification**: Allowed  
- ✅ **Distribution**: Allowed
- ✅ **Private Use**: Allowed
- ❌ **Liability**: Limited
- ❌ **Warranty**: Limited

## 🏆 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment solutions
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Lucide** - For beautiful icons
- **Hackathon Community** - For inspiration and support

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Deep-De-coder/dresser/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Deep-De-coder/dresser/discussions)
- **Email**: deep.shahane@example.com

---

## ⚖️ Copyright Notice

**Copyright © 2024 Deep Shahane. All rights reserved.**

### Intellectual Property Rights
This software and its documentation are protected by copyright laws and international treaties. Unauthorized reproduction or distribution of this software, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.

### Permitted Uses
- **Personal Use**: You may use this software for personal, non-commercial purposes
- **Educational Use**: Students and educators may use this software for learning and research
- **Open Source Development**: Developers may contribute to and improve this software
- **Commercial Use**: Businesses may use this software in accordance with the MIT License

### Restrictions
- **Redistribution**: You may not redistribute this software without proper attribution
- **Modification**: Modified versions must clearly indicate changes made
- **Trademark**: You may not use the project name or branding for commercial purposes without permission

### Attribution Requirements
When using, modifying, or distributing this software, you must include:
1. The original copyright notice
2. A link to the original repository
3. The MIT License text
4. Any modifications made

---

*Built with ❤️ for the hackathon community*

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Active Development  
**Author**: Deep Shahane  
**Copyright**: © 2024 Deep Shahane. All rights reserved.