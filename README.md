# Dresser - Smart Wardrobe Organizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC)](https://tailwindcss.com/)

A smart wardrobe organizer that helps users keep track of their clothing with just a photo. Using AI, it instantly identifies and categorizes each item, like shirts, pants, or jackets, making it easy to manage, search, and visualize your entire wardrobe.

## ✨ Features

- **🤖 AI-Powered Recognition**: Instantly identifies and categorizes clothing items from photos
- **📂 Smart Categorization**: Automatically sorts items into shirts, pants, jackets, and more
- **🗂️ Digital Inventory**: Transform your closet into a searchable digital wardrobe
- **👗 Outfit Planning**: Easily plan and organize outfits from your digital collection
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

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
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
│   ├── components/         # Reusable UI components
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── loading.tsx        # Loading state component
│   ├── error.tsx          # Error boundary
│   ├── not-found.tsx      # 404 page
│   └── [meta files]       # SEO and PWA configuration
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── Header.tsx         # Navigation header
│   ├── PhotoUpload.tsx    # File upload component
│   ├── WardrobeGrid.tsx   # Wardrobe display grid
│   └── CategoryFilter.tsx # Category filtering
├── lib/                    # Utility functions
├── types/                  # TypeScript type definitions
├── constants/              # Application constants
└── [config files]          # Build and development config
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
- **Email**: [Your Email]

---

## ⚖️ Copyright Notice

**Copyright © 2024 [Your Name/Organization]. All rights reserved.**

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