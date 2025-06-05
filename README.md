# Advanced Baccarat Assistant

A sophisticated Vue 3 application for advanced baccarat analysis, featuring professional-grade edge calculations, pattern recognition, burned card tracking, and cutting-edge professional burn estimation algorithms.

## Features

### Core Functionality

- **Real-time Edge Calculations**: Dynamic calculation of house edges for all bet types
- **Professional Burn Card Analysis**: Advanced algorithms from Jacobson, Griffin, and Wong methods
- **Cut Card Analysis**: Calculate the impact of cut card position on game dynamics
- **Pattern Recognition**: Advanced streak and pattern analysis with 5 professional tracking systems
- **Edge Sorting Support**: Tools for edge sorting analysis and advantage calculation
- **Interactive Card Interface**: Click-to-deal cards with real-time shoe composition tracking

### Professional Burn Estimation Algorithms

- **Jacobson Method**: Statistical analysis based on casino burn procedures and frequency data
- **Griffin Method**: High vs low card bias analysis adapted from "The Theory of Blackjack"
- **Wong Method**: Adaptive pattern recognition system from Stanford Wong's research
- **Bayesian Updates**: Modern probabilistic approach that updates estimates with new evidence
- **Weighted Scenario Analysis**: Combines all methods for optimal accuracy

### Advanced Mathematical Features

- **Hypergeometric Distribution**: Accurate probability calculations based on remaining cards
- **Professional Kelly Criterion**: Advanced bet sizing with burn card adjustments
- **Penetration Analysis**: Track shoe penetration and its impact on accuracy
- **Monte Carlo Risk Assessment**: Advanced risk analysis with burn card uncertainty
- **Confidence Intervals**: Statistical confidence ranges for all calculations
- **Edge Sorting Advantage**: Real-time calculation of edge sorting opportunities

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

**📖 [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)** - Database configuration and setup

**🎓 [Professional Burn Card System](./docs/PROFESSIONAL_ALGORITHMS.md)** - Complete burn card analysis documentation

**⚡ [Quick Setup Guide](./docs/QUICK_SETUP.md)** - Fast database table creation

**🎴 [Card Assets Setup](./docs/CARD_SETUP.md)** - Playing card image configuration

**📊 [Schema Migrations](./docs/schema-migrations.md)** - Database schema change tracking

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

### Professional Burn Card Analysis

1. **Automatic Analysis**: Professional algorithms run automatically when sufficient data is available
2. **Manual Analysis**: Click "🔄 Analyze" button to run professional burn estimation
3. **Multiple Scenarios**: View results from Jacobson, Griffin, and Wong methods
4. **Weighted Recommendations**: Get combined professional recommendations with confidence levels
5. **Kelly Integration**: Burn analysis automatically adjusts Kelly Criterion calculations
6. **Monte Carlo Integration**: Burn uncertainty factors into risk assessments

### Pattern Analysis

1. Enable "Show Pattern Analysis" in settings
2. Input hand results to build pattern history
3. View streak analysis and trends

### Edge Sorting

1. Enable "Edge Sorting" in settings
2. Mark cards as high/low based on orientation
3. Monitor edge sorting advantage

### Professional Burn Card Algorithms

The application implements four professional-grade burn card estimation algorithms:

1. **Jacobson Method**: Statistical analysis based on casino burn procedures
2. **Griffin Method**: High vs low card bias analysis from dealer behavior
3. **Wong Method**: Adaptive pattern recognition that learns from hand history
4. **Bayesian Updates**: Modern probabilistic approach with evidence weighting

These algorithms automatically combine to provide weighted recommendations with confidence intervals, Kelly Criterion adjustments, and Monte Carlo risk assessments. See the [Professional Algorithms Documentation](./docs/PROFESSIONAL_ALGORITHMS.md) for detailed technical information.

## Monte Carlo Simulations & Advanced Analytics

The application features sophisticated Monte Carlo simulation capabilities for risk analysis and outcome projections.

### Monte Carlo Features

#### **Automatic Simulation Triggers**

The Monte Carlo system runs simulations automatically under two conditions:

1. **Interval-Based Auto-Run**

   - Configurable to run every N hands (default: 3 hands)
   - Can be enabled/disabled via checkbox
   - Maintains consistent simulation schedule
   - Shows countdown: "Auto-run: In 2 hands"

2. **Edge-Triggered Auto-Run**
   - Monitors all edge calculations continuously
   - Triggers when significant changes detected
   - Works regardless of auto-run on/off setting
   - Shows status: "Edge-triggered" when activated

#### **Edge Change Thresholds**

Simulations trigger automatically when edges change by:

- **Player/Banker Edges**: ≥0.5% change
- **Pair Bet Edges**: ≥2.0% change (more volatile)
- **Edge Sorting Advantage**: ≥1.0% change

#### **Smart Logic**

- **No Double-Triggers**: Prevents multiple runs on same hand
- **Pattern Preservation**: Regular intervals continue unaffected
- **Universal Monitoring**: Edge detection works with auto-run on/off
- **Threshold-Based**: Only triggers on meaningful changes

### Simulation Results

Each Monte Carlo run provides:

- **Expected Value**: Projected outcome over 100 hands
- **Probability of Profit**: Likelihood of positive returns
- **95% Confidence Range**: Statistical outcome boundaries
- **Risk of Ruin**: Probability of losing entire bankroll

### Kelly Criterion & Optimal Betting

Advanced bankroll management using the Kelly Criterion for mathematically optimal bet sizing:

#### **Real-Time Kelly Calculations**

- **Optimal Bet Size**: Precise dollar amount based on current bankroll
- **Kelly Percentage**: Recommended percentage of total bankroll
- **Win Probability**: Dynamic calculation based on current edges
- **Average Win/Loss**: Historical performance metrics
- **Edge Analysis**: Current mathematical advantage

#### **Dynamic Updates**

The Kelly system updates automatically when:

- **Cards are dealt/burned**: Shoe composition changes
- **Betting statistics change**: Win/loss history updates
- **Edge calculations shift**: House edge modifications
- **Significant changes detected**: ≥25% bet size changes trigger visual indicators

#### **Visual Change Indicators**

- **Kelly Notifications**: Temporary notifications for significant changes (5-second display)
- **Change Badges**: Green (↗️ increase) or Red (↘️ decrease) percentage indicators
- **Animation Effects**: Subtle pulsing and bouncing for attention
- **Previous Value Display**: Shows last bet size for comparison

#### **Safety Features**

- **High Kelly Warnings**: Alerts when Kelly percentage >25% of bankroll
- **Fractional Kelly Recommendation**: Suggests 25-50% of calculated Kelly for safety
- **Risk Assessment**: Integrated with Monte Carlo risk scenarios
- **Bankroll Protection**: Conservative approach to prevent over-betting

#### **Kelly Formula Implementation**

```
f = (bp - q) / b

Where:
f = Kelly percentage
b = Odds received (average win / average loss)
p = Probability of winning
q = Probability of losing (1 - p)
```

#### **Practical Usage**

1. **Monitor Real-Time Updates**: Kelly bet size updates with each card dealt
2. **Follow Change Indicators**: Pay attention to significant change notifications
3. **Consider Fractional Kelly**: Use 25-50% of calculated amount for safety
4. **Integrate with Risk Analysis**: Combine with Monte Carlo risk scenarios
5. **Adjust for Bankroll**: Ensure bet sizes align with actual bankroll

### Usage Modes

#### **Auto-Run Enabled**

```
☑️ Auto-run every [3] hands
Status: "Auto-run: In 2 hands" or "Auto-run: Edge-triggered"
```

#### **Auto-Run Disabled**

```
☐ Auto-run every [3] hands (greyed out)
Status: "Edge-monitoring: Edge-monitoring active" or "Edge-monitoring: Edge-triggered"
```

### Configuration

1. **Enable/Disable Auto-Run**: Check/uncheck the auto-run checkbox
2. **Set Interval**: Adjust the number field (1-20 hands)
3. **Manual Override**: Click "Run Monte Carlo" anytime
4. **Instant Changes**: All settings take effect immediately

### Visual Indicators

- **Purple Badges**: Auto-run mode active
- **Orange Badges**: Edge-monitoring only mode
- **Countdown Display**: Shows hands until next scheduled run
- **Trigger Status**: Indicates reason for last simulation

### Performance Metrics

The system calculates advanced performance analytics:

- **Sharpe Ratio**: Risk-adjusted return measurement
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Profit Factor**: Gross profit ÷ Gross loss ratio
- **Recovery Factor**: Net profit ÷ Maximum drawdown
- **Variance Analysis**: Standard deviation and risk metrics

### Risk Scenario Detection

The Monte Carlo system automatically detects and visually highlights high-risk scenarios without intrusive alerts:

#### **Risk Categories**

1. **High Risk of Ruin** ⚠️

   - Triggers: ≥15% chance of losing entire bankroll
   - Critical: ≥30% risk of ruin
   - Visual: Red/orange border on risk metrics

2. **Low Profit Probability** 📉

   - Triggers: ≤40% chance of profit
   - Critical: ≤25% profit probability
   - Visual: Color-coded probability display

3. **Negative Expected Value** 💸

   - Triggers: Any negative expected value
   - Critical: ≤-$100 expected loss
   - Visual: Red highlighting with warning icons

4. **High Volatility** 🎢
   - Triggers: >$500 confidence range spread
   - Critical: >$1000 range spread
   - Visual: Yellow borders and volatility indicators

#### **Visual Risk Indicators**

- **Risk Level Badges**: CRITICAL/HIGH/MEDIUM/LOW risk labels
- **Color-Coded Metrics**: Red (critical), Orange (high), Yellow (medium), Green (low)
- **Icon Warnings**: Emoji indicators for specific risk types
- **Border Highlights**: Colored borders around risky metrics
- **Scenario Details**: Comprehensive risk breakdown with recommendations

#### **Risk Recommendations**

The system provides contextual advice based on detected scenarios:

- **Critical Risk**: "Consider stopping or significantly reducing bet sizes"
- **High Risk**: "Exercise caution and consider smaller bet sizes"
- **Medium Risk**: "Monitor closely and adjust strategy as needed"

#### **Real-Time Monitoring**

- **Continuous Assessment**: Risk levels update with each Monte Carlo run
- **No Intrusive Alerts**: Visual indicators only, no pop-ups or notifications
- **Comprehensive Coverage**: All major risk factors monitored simultaneously
- **Actionable Intelligence**: Clear recommendations for risk mitigation

## Advanced Settings & Configuration

The application provides comprehensive configuration options for all major systems, accessible through the **Advanced Settings** panel (⚙️ button).

### Settings Panel Overview

The Advanced Settings panel features three main tabs:

1. **Calculation Triggers**: Edge change detection and auto-calculation settings
2. **Kelly Optimization**: Kelly Criterion parameters and behavior
3. **Monte Carlo**: Simulation parameters and risk thresholds

All settings take effect **immediately** upon change, providing real-time control over system behavior.

### Calculation Triggers Configuration

#### **Auto-Calculate Edges**

- **Purpose**: Automatically recalculate edges when conditions change
- **Default**: Enabled
- **Impact**: Ensures edge calculations stay current with shoe composition

#### **Edge Change Thresholds**

Configure sensitivity for triggering recalculations:

| Setting            | Default | Range    | Purpose                            |
| ------------------ | ------- | -------- | ---------------------------------- |
| Player/Banker Edge | 0.5%    | 0.1%-10% | Main bet edge sensitivity          |
| Pair Edges         | 0.5%    | 0.1%-10% | Pair bet edge sensitivity          |
| Edge Sorting       | 0.5%    | 0.1%-10% | Edge sorting advantage sensitivity |

#### **Shoe Composition Triggers**

- **Significant Card Change**: 10% (1%-50%)
  - Triggers when card composition changes by this percentage
- **Minimum Penetration**: 0.5 (0.1-1.0)
  - Only trigger after this much shoe penetration

#### **Quick Presets**

- **Conservative (0.01%)**: Very sensitive, frequent recalculations
- **Balanced (0.005%)**: Moderate sensitivity (default)
- **Aggressive (0.001%)**: Extremely sensitive, maximum responsiveness

### Kelly Optimization Configuration

#### **Core Kelly Settings**

| Setting              | Default    | Range    | Purpose                                    |
| -------------------- | ---------- | -------- | ------------------------------------------ |
| **Enable Kelly**     | ✓          | On/Off   | Master toggle for Kelly calculations       |
| **Bankroll Amount**  | $1,000     | $100-$1M | Total bankroll for percentage calculations |
| **Fractional Kelly** | 0.5 (50%)  | 0.1-1.0  | Safety multiplier for Kelly percentage     |
| **Max Kelly %**      | 0.25 (25%) | 0.01-0.5 | Maximum percentage of bankroll to bet      |

#### **Kelly Notifications**

- **Change Threshold**: 0.25 (25%) - Notify when bet size changes by this percentage
- **Auto-Adjust Bet Size**: Off - Automatically adjust recommendations

#### **Kelly Safety Features**

- **Fractional Kelly**: Reduces full Kelly by safety factor (e.g., 50% of calculated)
- **Maximum Limits**: Caps Kelly percentage regardless of calculation
- **High Kelly Warnings**: Visual alerts when exceeding safe thresholds
- **Change Notifications**: 5-second notifications for significant changes

#### **Kelly Presets**

| Preset           | Fractional | Max % | Threshold | Auto-Adjust |
| ---------------- | ---------- | ----- | --------- | ----------- |
| **Conservative** | 25%        | 15%   | 50%       | Off         |
| **Balanced**     | 50%        | 25%   | 25%       | On          |
| **Aggressive**   | 75%        | 40%   | 15%       | On          |

### Monte Carlo Configuration

#### **Simulation Parameters**

| Setting               | Default | Range    | Purpose                   |
| --------------------- | ------- | -------- | ------------------------- |
| **Simulations**       | 10,000  | 1K-100K  | Number of simulation runs |
| **Hands to Simulate** | 100     | 10-1,000 | Projection horizon        |

**Performance vs. Accuracy Trade-offs:**

- **1K-5K simulations**: Fast but less precise
- **10K-25K simulations**: Balanced accuracy and speed
- **50K+ simulations**: High accuracy but slower

#### **Risk Alert Thresholds**

Configure when risk scenarios trigger visual warnings:

| Risk Type                   | Default | Range        | Triggers When                            |
| --------------------------- | ------- | ------------ | ---------------------------------------- |
| **High Risk of Ruin**       | 15%     | 1%-50%       | Bankruptcy probability exceeds threshold |
| **Low Profit Probability**  | 40%     | 10%-80%      | Profit chance falls below threshold      |
| **Negative Expected Value** | $0      | Any negative | Expected value becomes negative          |
| **High Volatility**         | $500    | $100-$5K     | Confidence range exceeds threshold       |

#### **Monte Carlo Presets**

| Preset       | Simulations | Hands | Risk Thresholds | Use Case         |
| ------------ | ----------- | ----- | --------------- | ---------------- |
| **Fast**     | 5K          | 50    | Relaxed         | Quick estimates  |
| **Balanced** | 10K         | 100   | Standard        | General use      |
| **Accurate** | 25K         | 200   | Strict          | Precise analysis |

### Real-Time Configuration Benefits

#### **Immediate Effect**

- All settings changes apply instantly
- No restart or reload required
- Real-time feedback on setting impacts

#### **Dynamic Adaptation**

- Adjust sensitivity based on game conditions
- Fine-tune risk tolerance during play
- Optimize performance vs. accuracy trade-offs

#### **Contextual Optimization**

- **High-Stakes Games**: Use accurate Monte Carlo, conservative Kelly
- **Practice Sessions**: Use fast Monte Carlo, aggressive Kelly
- **Tournament Play**: Use balanced settings with strict risk thresholds

### Configuration Best Practices

#### **For Beginners**

1. Start with **Balanced** presets across all systems
2. Enable all auto-calculation features
3. Use conservative Kelly settings (25% fractional)
4. Monitor risk indicators closely

#### **For Advanced Users**

1. Customize thresholds based on playing style
2. Use aggressive edge detection for maximum responsiveness
3. Adjust Kelly parameters based on risk tolerance
4. Fine-tune Monte Carlo parameters for specific scenarios

#### **For Professional Play**

1. Use accurate Monte Carlo settings (25K+ simulations)
2. Implement strict risk thresholds
3. Enable all monitoring and notification features
4. Regularly review and adjust based on performance

### Settings Persistence

- All settings are automatically saved to browser storage
- Settings persist across sessions
- Database integration preserves settings across devices
- Export/import functionality for settings backup

### Best Practices

1. **Keep Auto-Run Enabled**: Ensures regular risk assessment
2. **Monitor Edge Triggers**: Pay attention to edge-triggered runs
3. **Use Kelly Sizing**: Follow optimal bet size recommendations
4. **Review Confidence Intervals**: Understand outcome ranges
5. **Track Performance Metrics**: Monitor long-term statistics
6. **Watch Risk Indicators**: Pay attention to visual risk warnings
7. **Follow Risk Recommendations**: Adjust strategy based on detected scenarios
8. **Use Fractional Kelly**: Consider 25-50% of calculated Kelly for safety
9. **Monitor Kelly Changes**: React to significant bet size change notifications
10. **Integrate All Systems**: Combine Monte Carlo, Kelly, and risk analysis for optimal decisions
11. **Customize Settings**: Adjust thresholds and parameters based on your playing style
12. **Use Presets**: Start with presets and fine-tune based on experience
13. **Monitor Performance**: Regularly review how settings affect your results

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

## Documentation

This project includes comprehensive documentation for all major features:

### 📚 Core Documentation

- **[README.md](./README.md)** - Main project documentation (this file)
- **[Professional Burn Card Algorithms](./docs/PROFESSIONAL_ALGORITHMS.md)** - Detailed technical documentation of Jacobson, Griffin, Wong, and Bayesian methods
- **[Card Setup Guide](./docs/CARD_SETUP.md)** - SVG card integration and customization options

### 🗄️ Database Documentation

- **[Supabase Setup Guide](./docs/SUPABASE_SETUP.md)** - Complete database setup instructions
- **[Quick Setup Guide](./docs/QUICK_SETUP.md)** - Fast database table creation for experienced users
- **[Schema Migrations](./docs/schema-migrations.md)** - Database schema change tracking and version history

### 📁 File Structure

```
docs/
├── ARCHITECTURE.md              # Architecture and development standards
├── PROFESSIONAL_ALGORITHMS.md   # Burn card estimation algorithms
├── CARD_SETUP.md               # SVG card integration guide
├── SUPABASE_SETUP.md           # Database setup guide
├── QUICK_SETUP.md              # Quick database setup
├── ENHANCEMENT_SUMMARY.md      # Feature enhancement documentation
├── IMPLEMENTATION_SUMMARY.md   # Implementation details
└── schema-migrations.md        # Schema change tracking
```

### 🔗 Quick Links

- **Getting Started**: [Installation](#installation) → [Database Setup](#database-setup) → [Usage](#usage)
- **Professional Features**: [Burn Card Analysis](#professional-burn-card-algorithms) → [Algorithm Documentation](./docs/PROFESSIONAL_ALGORITHMS.md)
- **Database Setup**: [Full Guide](./docs/SUPABASE_SETUP.md) → [Quick Setup](./docs/QUICK_SETUP.md)
- **Advanced Features**: [Monte Carlo](#monte-carlo-simulations--advanced-analytics) → [Kelly Criterion](#kelly-criterion--optimal-betting)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation if needed
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is for educational and research purposes only. Gambling involves risk, and this tool does not guarantee winning outcomes. Use responsibly and in accordance with local laws and regulations.

## Acknowledgments

- Mathematical formulas based on established baccarat probability theory
- Inspired by the work of gambling mathematicians and researchers
- Built with modern web technologies for optimal performance

## Pattern Analysis Debug Checklist (Current Session)

### Issues Fixed:

1. ✅ Removed debug overlay numbers from pattern views
2. ✅ Removed data-debug attributes showing unwanted data
3. ✅ Fixed pattern analysis algorithm grid filling logic
4. ✅ Fixed configuration access for PATTERN_DOT sizing
5. ✅ Added comprehensive debugging throughout the flow

### IMPORTANT: Pattern Analysis Requirements

**Pattern analysis REQUIRES multiple hands with different results:**

- **Big Eye Boy**: Needs at least **2 columns** (2 different results like Player → Banker)
- **Small Road**: Needs at least **3 columns** (3 different result changes)
- **Cockroach Pig**: Needs at least **4 columns** (4 different result changes)

**Example to test patterns:**

1. Play hand 1: Player wins → Creates column 1
2. Play hand 2: Banker wins → Creates column 2 (Big Eye Boy can now generate patterns)
3. Play hand 3: Player wins → Creates column 3 (Small Road can now generate patterns)
4. Play hand 4: Banker wins → Creates column 4 (Cockroach Pig can now generate patterns)

### Console Messages Explained:

- `"Insufficient columns for analysis, returning empty grid"` = **CORRECT** when < required hands
- `"nonEmptyPatternCells: 0"` = **NORMAL** until enough hands are played
- Pattern analysis will automatically start working once sufficient hands are played

### Test Sequence for Verification:

1. Start new session
2. Play: Player, Banker, Player, Banker (4 different results)
3. Switch to pattern views → Should see red/blue dots
4. Check console for `cellsGenerated` > 0 in pattern analysis logs

---
