# Advanced Baccarat Assistant

A sophisticated Vue 3 application for advanced baccarat analysis, featuring edge calculations, pattern recognition, burned card tracking, and edge sorting capabilities.

## Features

### Core Functionality

- **Real-time Edge Calculations**: Dynamic calculation of house edges for all bet types
- **Burned Card Tracking**: Track and analyze the impact of burned cards on probabilities
- **Cut Card Analysis**: Calculate the impact of cut card position on game dynamics
- **Pattern Recognition**: Advanced streak and pattern analysis
- **Edge Sorting Support**: Tools for edge sorting analysis and advantage calculation

### Advanced Mathematical Features

- **Hypergeometric Distribution**: Accurate probability calculations based on remaining cards
- **Confidence Levels**: Statistical confidence in edge calculations
- **Penetration Analysis**: Track shoe penetration and its impact on accuracy
- **Conditional Probabilities**: Calculate probabilities based on recent outcomes

### User Interface

- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Real-time Updates**: Live updates of all calculations and statistics
- **Tabbed Navigation**: Organized interface with dedicated sections for different analyses
- **Customizable Settings**: Adjustable parameters for different game conditions

## Technology Stack

- **Vue 3**: Modern reactive framework with Composition API
- **TypeScript**: Type-safe development
- **Pinia**: State management
- **Supabase**: PostgreSQL database with real-time capabilities
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization
- **Vite**: Fast build tool
- **ESLint & Prettier**: Code quality and formatting
- **Husky**: Git hooks for code quality

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd improved_baccarat_assistant

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
yarn dev

# Build for production
yarn build

# Run linting and formatting
yarn lint
yarn format
```

## Database Setup

This application uses Supabase for data persistence. Follow the comprehensive setup guide:

**📖 [Supabase Setup Guide](./SUPABASE_SETUP.md)**

The database provides:

- **Persistent Game Sessions**: Save and resume baccarat games
- **Hand History**: Complete tracking of all hands played
- **Burned Card Analysis**: Store and analyze burned cards impact
- **Edge Calculation History**: Track edge calculations over time
- **Pattern Analysis**: Historical pattern recognition and trends

## Usage

### Basic Setup

1. Configure the number of decks (6 or 8)
2. Set the cut card position
3. Enable desired tracking features

### Tracking Burned Cards

1. Enable "Track Burned Cards" in settings
2. Input burned cards as they occur
3. Monitor the impact on edge calculations

### Pattern Analysis

1. Enable "Show Pattern Analysis" in settings
2. Input hand results to build pattern history
3. View streak analysis and trends

### Edge Sorting

1. Enable "Edge Sorting" in settings
2. Mark cards as high/low based on orientation
3. Monitor edge sorting advantage

## Mathematical Background

### Edge Calculations

The application uses precise mathematical formulas to calculate house edges:

- **Player Bet**: Standard edge of -1.06%
- **Banker Bet**: Standard edge of -1.06% (including commission)
- **Tie Bet**: Standard edge of -14.36%
- **Pair Bets**: Standard edge of -10.76%

These edges are dynamically adjusted based on:

- Burned card composition
- Cut card position
- Edge sorting information

### Burned Card Impact

The system tracks burned cards and calculates their impact using:

- Hypergeometric distribution for probability adjustments
- Confidence levels based on sample size
- Estimated impact on each bet type

### Pattern Analysis

Statistical analysis includes:

- Streak identification and analysis
- Chopping pattern recognition
- Alternating pattern detection
- Conditional probability calculations

## Development

### Project Structure

```
src/
├── components/          # Vue components
│   ├── card/           # Card-related components
│   ├── analysis/       # Analysis components
│   ├── tracking/       # Tracking components
│   └── ui/             # UI components
├── stores/             # Pinia stores
├── types/              # TypeScript type definitions
├── composables/        # Vue composables
├── utils/              # Utility functions
├── services/           # External service integrations
├── lib/                # Third-party library configurations
└── views/              # Page components
```

### Code Quality

This project includes comprehensive code quality tools:

- **ESLint**: Modern flat config with Vue 3 + TypeScript rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance
- **Commitlint**: Conventional commit message enforcement
- **TypeScript**: Strict type checking for better reliability

### Adding New Features

1. Define types in `src/types/`
2. Add database schema changes (if needed)
3. Update `src/services/databaseService.ts` for data operations
4. Add store actions in `src/stores/baccaratStore.ts`
5. Create composables for complex logic
6. Build UI components
7. Add tests
8. Ensure code passes linting and formatting checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is for educational and research purposes only. Gambling involves risk, and this tool does not guarantee winning outcomes. Use responsibly and in accordance with local laws and regulations.

## Acknowledgments

- Mathematical formulas based on established baccarat probability theory
- Inspired by the work of gambling mathematicians and researchers
- Built with modern web technologies for optimal performance
