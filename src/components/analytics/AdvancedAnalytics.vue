<template>
  <!-- Kelly Change Notification -->
  <div v-if="showKellyNotification" class="fixed top-4 right-4 z-50 kelly-notification">
    <div
      class="bg-white border-l-4 p-4 rounded-lg shadow-lg max-w-sm"
      :class="[getKellyChangeDirection() === 'increase' ? 'border-green-500' : 'border-red-500']"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <span v-if="getKellyChangeDirection() === 'increase'" class="text-green-500 text-xl"
            >📈</span
          >
          <span v-else class="text-red-500 text-xl">📉</span>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">
            Kelly Bet Size
            {{ getKellyChangeDirection() === 'increase' ? 'Increased' : 'Decreased' }}
          </p>
          <p class="text-xs text-gray-600 mt-1">
            {{ getKellyChangeDirection() === 'increase' ? '+' : ''
            }}{{ getKellyChangePercentage().toFixed(1) }}% ({{
              getKellyChangeDirection() === 'increase' ? '↗️' : '↘️'
            }}
            ${{ kellyOptimal.optimalBetSize.toFixed(2) }})
          </p>
        </div>
        <div class="ml-auto">
          <button @click="showKellyNotification = false" class="text-gray-400 hover:text-gray-600">
            <span class="sr-only">Close</span>
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-purple-800">Advanced Analytics & Sharp Betting</h2>
      <div class="flex items-center space-x-4">
        <!-- Monte Carlo Settings -->
        <div class="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            id="autoMonteCarlo"
            v-model="store.settings.monteCarlo.autoRun"
            @change="onAutoRunChange"
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label for="autoMonteCarlo" class="text-gray-700">Auto-run every</label>
          <input
            type="number"
            v-model.number="store.settings.monteCarlo.runEveryNHands"
            @change="onIntervalChange"
            :disabled="!store.settings.monteCarlo.autoRun"
            :class="[
              'w-16 px-2 py-1 border rounded text-center text-sm',
              store.settings.monteCarlo.autoRun
                ? 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed',
            ]"
            min="1"
            max="20"
          />
          <span class="text-gray-700">hands</span>
        </div>

        <!-- Advanced Settings -->
        <div class="flex items-center space-x-2 text-sm">
          <button
            @click="showTriggerSettings = !showTriggerSettings"
            class="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors flex items-center space-x-1"
          >
            <span>⚙️</span>
            <span>Advanced Settings</span>
            <span v-if="showTriggerSettings">▼</span>
            <span v-else>▶</span>
          </button>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="runMonteCarloSimulation"
            class="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
            :disabled="isSimulating"
          >
            {{ isSimulating ? 'Simulating...' : 'Run Monte Carlo' }}
          </button>
          <button
            @click="calculateKellyOptimal"
            class="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            Kelly Optimization
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Settings Panel -->
    <div
      v-if="showTriggerSettings"
      class="mb-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg"
    >
      <h3 class="text-lg font-semibold text-indigo-800 mb-4">⚙️ Advanced Settings</h3>

      <!-- Settings Tabs -->
      <div class="mb-4">
        <div class="flex space-x-1 bg-indigo-100 p-1 rounded-lg">
          <button
            @click="activeSettingsTab = 'triggers'"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              activeSettingsTab === 'triggers'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-indigo-600 hover:text-indigo-700',
            ]"
          >
            Calculation Triggers
          </button>
          <button
            @click="activeSettingsTab = 'kelly'"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              activeSettingsTab === 'kelly'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-indigo-600 hover:text-indigo-700',
            ]"
          >
            Kelly Optimization
          </button>
          <button
            @click="activeSettingsTab = 'montecarlo'"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              activeSettingsTab === 'montecarlo'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-indigo-600 hover:text-indigo-700',
            ]"
          >
            Monte Carlo
          </button>
        </div>
      </div>

      <!-- Calculation Triggers Tab -->
      <div v-if="activeSettingsTab === 'triggers'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Auto-Calculate Edges -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoCalculateEdges"
              v-model="store.settings.calculationTriggers.autoCalculateEdges"
              @change="onTriggerSettingsChange"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="autoCalculateEdges" class="text-sm font-medium text-gray-700">
              Auto-calculate edges when conditions change
            </label>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-700">
              Edge Change Thresholds (percentage points)
            </h4>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-gray-600 mb-1">Player/Banker Edge:</label>
                <input
                  type="number"
                  v-model.number="
                    store.settings.calculationTriggers.edgeChangeThresholds.playerEdge
                  "
                  @change="onTriggerSettingsChange"
                  step="0.001"
                  min="0.001"
                  max="0.1"
                  class="w-full px-2 py-1 border rounded text-center"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-1">Pair Edges:</label>
                <input
                  type="number"
                  v-model.number="
                    store.settings.calculationTriggers.edgeChangeThresholds.playerPairEdge
                  "
                  @change="onTriggerSettingsChange"
                  step="0.001"
                  min="0.001"
                  max="0.1"
                  class="w-full px-2 py-1 border rounded text-center"
                />
              </div>
              <div>
                <label class="block text-gray-600 mb-1">Edge Sorting:</label>
                <input
                  type="number"
                  v-model.number="
                    store.settings.calculationTriggers.edgeChangeThresholds.edgeSortingAdvantage
                  "
                  @change="onTriggerSettingsChange"
                  step="0.001"
                  min="0.001"
                  max="0.1"
                  class="w-full px-2 py-1 border rounded text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Shoe Composition Triggers -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="shoeCompositionTriggers"
              v-model="store.settings.calculationTriggers.shoeCompositionTriggers.enabled"
              @change="onTriggerSettingsChange"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="shoeCompositionTriggers" class="text-sm font-medium text-gray-700">
              Monitor shoe composition changes
            </label>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Significant Card Change (%):</label>
              <input
                type="number"
                v-model.number="
                  store.settings.calculationTriggers.shoeCompositionTriggers.significantCardChange
                "
                @change="onTriggerSettingsChange"
                :disabled="!store.settings.calculationTriggers.shoeCompositionTriggers.enabled"
                min="1"
                max="50"
                class="w-full px-2 py-1 border rounded text-center text-sm"
              />
              <div class="text-xs text-gray-500 mt-1">
                Triggers when card composition changes by this percentage
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">Minimum Penetration:</label>
              <input
                type="number"
                v-model.number="
                  store.settings.calculationTriggers.shoeCompositionTriggers.penetrationThreshold
                "
                @change="onTriggerSettingsChange"
                :disabled="!store.settings.calculationTriggers.shoeCompositionTriggers.enabled"
                step="0.1"
                min="0.1"
                max="1.0"
                class="w-full px-2 py-1 border rounded text-center text-sm"
              />
              <div class="text-xs text-gray-500 mt-1">
                Only trigger after this much shoe penetration
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Presets -->
        <div class="mt-4 pt-4 border-t border-indigo-200">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Quick Presets</h4>
          <div class="flex flex-wrap gap-2">
            <button
              @click="applyTriggerPreset('conservative')"
              class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Conservative (0.01%)
            </button>
            <button
              @click="applyTriggerPreset('balanced')"
              class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Balanced (0.005%)
            </button>
            <button
              @click="applyTriggerPreset('aggressive')"
              class="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
            >
              Aggressive (0.001%)
            </button>
            <button
              @click="resetTriggerSettings"
              class="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>
      </div>

      <!-- Kelly Optimization Tab -->
      <div v-if="activeSettingsTab === 'kelly'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Kelly Settings -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                id="kellyEnabled"
                v-model="store.settings.kelly.enabled"
                @change="onKellySettingsChange"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="kellyEnabled" class="text-sm font-medium text-gray-700">
                Enable Kelly Criterion optimization
              </label>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Bankroll Amount ($):</label>
                <input
                  type="number"
                  v-model.number="store.settings.kelly.bankrollAmount"
                  @change="onKellySettingsChange"
                  :disabled="!store.settings.kelly.enabled"
                  min="100"
                  max="1000000"
                  step="100"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">Total bankroll for Kelly calculations</div>
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >Fractional Kelly (Safety Factor):</label
                >
                <input
                  type="number"
                  v-model.number="store.settings.kelly.fractionalKelly"
                  @change="onKellySettingsChange"
                  :disabled="!store.settings.kelly.enabled"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Multiplier for safety (0.5 = 50% of Kelly)
                </div>
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1">Maximum Kelly Percentage:</label>
                <input
                  type="number"
                  v-model.number="store.settings.kelly.maxKellyPercentage"
                  @change="onKellySettingsChange"
                  :disabled="!store.settings.kelly.enabled"
                  step="0.01"
                  min="0.01"
                  max="0.5"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">Maximum percentage of bankroll to bet</div>
              </div>
            </div>
          </div>

          <!-- Kelly Notifications -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Change Notification Threshold:</label>
              <input
                type="number"
                v-model.number="store.settings.kelly.changeThreshold"
                @change="onKellySettingsChange"
                :disabled="!store.settings.kelly.enabled"
                step="0.05"
                min="0.1"
                max="1.0"
                class="w-full px-2 py-1 border rounded text-center text-sm"
              />
              <div class="text-xs text-gray-500 mt-1">
                Notify when bet size changes by this percentage
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoAdjustBetSize"
                v-model="store.settings.kelly.autoAdjustBetSize"
                @change="onKellySettingsChange"
                :disabled="!store.settings.kelly.enabled"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="autoAdjustBetSize" class="text-sm text-gray-700">
                Auto-adjust bet size recommendations
              </label>
            </div>
          </div>
        </div>

        <!-- Kelly Presets -->
        <div class="pt-4 border-t border-indigo-200">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Kelly Presets</h4>
          <div class="flex flex-wrap gap-2">
            <button
              @click="applyKellyPreset('conservative')"
              class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Conservative (25% Kelly)
            </button>
            <button
              @click="applyKellyPreset('balanced')"
              class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Balanced (50% Kelly)
            </button>
            <button
              @click="applyKellyPreset('aggressive')"
              class="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
            >
              Aggressive (75% Kelly)
            </button>
            <button
              @click="resetKellySettings"
              class="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>
      </div>

      <!-- Monte Carlo Tab -->
      <div v-if="activeSettingsTab === 'montecarlo'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Simulation Parameters -->
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-gray-700">Simulation Parameters</h4>

            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Number of Simulations:</label>
                <input
                  type="number"
                  v-model.number="store.settings.monteCarlo.simulations"
                  @change="onMonteCarloSettingsChange"
                  min="1000"
                  max="100000"
                  step="1000"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">
                  More simulations = higher accuracy, slower calculation
                </div>
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1">Hands to Simulate:</label>
                <input
                  type="number"
                  v-model.number="store.settings.monteCarlo.handsToSimulate"
                  @change="onMonteCarloSettingsChange"
                  min="10"
                  max="1000"
                  step="10"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">Number of hands to project forward</div>
              </div>
            </div>
          </div>

          <!-- Risk Thresholds -->
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-gray-700">Risk Alert Thresholds</h4>

            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">High Risk of Ruin (%):</label>
                <input
                  type="number"
                  v-model.number="store.settings.monteCarlo.riskThresholds.highRiskOfRuin"
                  @change="onMonteCarloSettingsChange"
                  step="0.01"
                  min="0.01"
                  max="0.5"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Alert when risk of ruin exceeds this percentage
                </div>
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1">Low Profit Probability (%):</label>
                <input
                  type="number"
                  v-model.number="store.settings.monteCarlo.riskThresholds.lowProfitProbability"
                  @change="onMonteCarloSettingsChange"
                  step="0.01"
                  min="0.1"
                  max="0.8"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Alert when profit probability falls below this
                </div>
              </div>

              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >High Volatility Threshold ($):</label
                >
                <input
                  type="number"
                  v-model.number="store.settings.monteCarlo.riskThresholds.highVolatility"
                  @change="onMonteCarloSettingsChange"
                  min="100"
                  max="5000"
                  step="50"
                  class="w-full px-2 py-1 border rounded text-center text-sm"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Alert when confidence range exceeds this amount
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monte Carlo Presets -->
        <div class="pt-4 border-t border-indigo-200">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Monte Carlo Presets</h4>
          <div class="flex flex-wrap gap-2">
            <button
              @click="applyMonteCarloPreset('fast')"
              class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Fast (5K simulations)
            </button>
            <button
              @click="applyMonteCarloPreset('balanced')"
              class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Balanced (10K simulations)
            </button>
            <button
              @click="applyMonteCarloPreset('accurate')"
              class="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
            >
              Accurate (25K simulations)
            </button>
            <button
              @click="resetMonteCarloSettings"
              class="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Sharpe Ratio -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Sharpe Ratio</h3>
          <div
            class="metric-tooltip"
            title="Risk-adjusted return. >1.0 = Good, >2.0 = Excellent, >3.0 = Outstanding"
          >
            ℹ️
          </div>
        </div>
        <div class="metric-value" :class="getSharpeClass(analytics.sharpeRatio)">
          {{ analytics.sharpeRatio.toFixed(3) }}
        </div>
        <div class="metric-subtitle">{{ getSharpeDescription(analytics.sharpeRatio) }}</div>
      </div>

      <!-- Maximum Drawdown -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Max Drawdown</h3>
          <div
            class="metric-tooltip"
            title="Largest peak-to-trough decline. Lower is better for risk management"
          >
            ℹ️
          </div>
        </div>
        <div class="metric-value text-red-600">{{ (analytics.maxDrawdown * 100).toFixed(1) }}%</div>
        <div class="metric-subtitle">${{ analytics.maxDrawdownAmount.toFixed(2) }}</div>
      </div>

      <!-- Profit Factor -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Profit Factor</h3>
          <div
            class="metric-tooltip"
            title="Gross profit ÷ Gross loss. >1.0 = Profitable, >2.0 = Very good"
          >
            ℹ️
          </div>
        </div>
        <div class="metric-value" :class="getProfitFactorClass(analytics.profitFactor)">
          {{ analytics.profitFactor.toFixed(2) }}
        </div>
        <div class="metric-subtitle">{{ getProfitFactorDescription(analytics.profitFactor) }}</div>
      </div>

      <!-- Recovery Factor -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Recovery Factor</h3>
          <div
            class="metric-tooltip"
            title="Net profit ÷ Max drawdown. Higher is better for risk-adjusted performance"
          >
            ℹ️
          </div>
        </div>
        <div class="metric-value" :class="getRecoveryFactorClass(analytics.recoveryFactor)">
          {{ analytics.recoveryFactor.toFixed(2) }}
        </div>
        <div class="metric-subtitle">
          {{ getRecoveryFactorDescription(analytics.recoveryFactor) }}
        </div>
      </div>
    </div>

    <!-- Kelly Criterion & Bankroll Management -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Kelly Criterion -->
      <div class="analytics-section">
        <div class="flex items-center justify-between mb-3">
          <h3 class="section-title mb-0">🎯 Kelly Criterion & Optimal Betting</h3>
          <div class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Real-time updates</div>
        </div>
        <div class="space-y-3">
          <div class="kelly-recommendation" :class="getKellyChangeClass()">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Optimal Bet Size:</span>
              <div class="flex items-center space-x-2">
                <span class="text-lg font-bold text-green-600"
                  >${{ kellyOptimal.optimalBetSize.toFixed(2) }}</span
                >
                <div v-if="hasSignificantKellyChange()" class="kelly-change-indicator">
                  <span
                    v-if="getKellyChangeDirection() === 'increase'"
                    class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold"
                  >
                    ↗️ +{{ Math.abs(getKellyChangePercentage()).toFixed(1) }}%
                  </span>
                  <span
                    v-else
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold"
                  >
                    ↘️ -{{ Math.abs(getKellyChangePercentage()).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="text-xs text-gray-600">
                {{ (kellyOptimal.kellyPercentage * 100).toFixed(2) }}% of bankroll
              </div>
              <div v-if="hasSignificantKellyChange()" class="text-xs text-gray-500">
                Previous: ${{ previousKellyBetSize.toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="kelly-details">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex justify-between">
                <span>Win Probability:</span>
                <span>{{ (kellyOptimal.winProbability * 100).toFixed(1) }}%</span>
              </div>
              <div class="flex justify-between">
                <span>Average Win:</span>
                <span>${{ kellyOptimal.averageWin.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Average Loss:</span>
                <span>${{ kellyOptimal.averageLoss.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Edge:</span>
                <span class="text-green-600">{{ (kellyOptimal.edge * 100).toFixed(2) }}%</span>
              </div>
            </div>
          </div>

          <div
            class="kelly-warning"
            v-if="kellyOptimal.kellyPercentage > store.settings.kelly.maxKellyPercentage"
          >
            <div class="text-xs text-orange-700 bg-orange-100 p-2 rounded">
              ⚠️ High Kelly percentage detected. Consider fractional Kelly (25-50% of calculated)
              for safety.
            </div>
          </div>
        </div>
      </div>

      <!-- Variance Analysis -->
      <div class="analytics-section">
        <h3 class="section-title">📊 Variance & Risk Analysis</h3>
        <div class="space-y-3">
          <div class="variance-metrics">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="flex justify-between">
                <span>Standard Deviation:</span>
                <span>${{ analytics.standardDeviation.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Variance:</span>
                <span>${{ analytics.variance.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Coefficient of Variation:</span>
                <span>{{ analytics.coefficientOfVariation.toFixed(3) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Risk of Ruin:</span>
                <span class="text-red-600">{{ (analytics.riskOfRuin * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <div class="confidence-intervals">
            <h4 class="text-xs font-semibold text-gray-700 mb-1">95% Confidence Intervals</h4>
            <div class="text-xs space-y-1">
              <div class="flex justify-between">
                <span>Next 10 hands:</span>
                <span
                  >${{ analytics.confidenceIntervals.next10.lower.toFixed(2) }} to ${{
                    analytics.confidenceIntervals.next10.upper.toFixed(2)
                  }}</span
                >
              </div>
              <div class="flex justify-between">
                <span>Next 100 hands:</span>
                <span
                  >${{ analytics.confidenceIntervals.next100.lower.toFixed(2) }} to ${{
                    analytics.confidenceIntervals.next100.upper.toFixed(2)
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Betting Pattern Analysis -->
    <div class="analytics-section mb-6">
      <h3 class="section-title">🎲 Betting Pattern Analysis</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Bet Size Distribution -->
        <div class="pattern-analysis">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Bet Size Distribution</h4>
          <div class="space-y-1 text-xs">
            <div
              v-for="(distribution, range) in analytics.betSizeDistribution"
              :key="range"
              class="flex justify-between"
            >
              <span>{{ range }}:</span>
              <span>{{ distribution.count }} ({{ distribution.percentage.toFixed(1) }}%)</span>
            </div>
          </div>
        </div>

        <!-- Favorite Bet Types -->
        <div class="pattern-analysis">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Favorite Bet Types</h4>
          <div class="space-y-1 text-xs">
            <div
              v-for="(betType, index) in analytics.favoriteBetTypes"
              :key="index"
              class="flex justify-between"
            >
              <span class="capitalize">{{ betType.type }}:</span>
              <span>{{ betType.count }} ({{ betType.percentage.toFixed(1) }}%)</span>
            </div>
          </div>
        </div>

        <!-- Performance by Bet Type -->
        <div class="pattern-analysis">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Performance by Type</h4>
          <div class="space-y-1 text-xs">
            <div
              v-for="(performance, betType) in analytics.performanceByBetType"
              :key="betType"
              class="flex justify-between"
            >
              <span class="capitalize">{{ betType }}:</span>
              <span :class="performance.roi >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ (performance.roi * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monte Carlo Status (when no results yet) -->
    <div v-if="monteCarloResults.simulations === 0" class="analytics-section">
      <div class="flex items-center justify-between mb-3">
        <h3 class="section-title mb-0">🎰 Monte Carlo Projections</h3>
        <div
          class="text-xs px-2 py-1 rounded"
          :class="[
            store.settings.monteCarlo.autoRun
              ? 'text-purple-600 bg-purple-50'
              : 'text-orange-600 bg-orange-50',
          ]"
        >
          {{ store.settings.monteCarlo.autoRun ? 'Auto-run:' : 'Edge-monitoring:' }}
          {{ getNextRunInfo() }}
        </div>
      </div>
      <div class="text-center py-8 text-gray-500">
        <div class="text-lg mb-2">📊</div>
        <div class="text-sm">
          {{
            store.settings.monteCarlo.autoRun
              ? `Monte Carlo simulation will run automatically ${getNextRunInfo().toLowerCase()}`
              : 'Monte Carlo will run when significant edge changes are detected'
          }}
        </div>
      </div>
    </div>

    <!-- Monte Carlo Results -->
    <div v-if="monteCarloResults.simulations > 0" class="analytics-section">
      <div class="flex items-center justify-between mb-3">
        <h3 class="section-title mb-0">
          🎰 Monte Carlo Projections ({{ monteCarloResults.simulations.toLocaleString() }}
          simulations)
        </h3>
        <div class="flex items-center space-x-2">
          <!-- Risk Level Indicator -->
          <div
            v-if="getRiskScenarios.length > 0"
            class="text-xs px-2 py-1 rounded border-2"
            :class="getRiskLevelClass(getOverallRiskLevel())"
          >
            {{ getOverallRiskLevel().toUpperCase() }} RISK
          </div>
          <!-- Auto-run Status -->
          <div
            class="text-xs px-2 py-1 rounded"
            :class="[
              store.settings.monteCarlo.autoRun
                ? 'text-purple-600 bg-purple-50'
                : 'text-orange-600 bg-orange-50',
            ]"
          >
            {{ store.settings.monteCarlo.autoRun ? 'Auto-run:' : 'Edge-monitoring:' }}
            {{ getNextRunInfo() }}
          </div>
        </div>
      </div>

      <!-- Risk Scenarios Alert Section -->
      <div
        v-if="getRiskScenarios.length > 0"
        class="mb-4 p-4 rounded-lg border-2"
        :class="getRiskLevelClass(getOverallRiskLevel())"
      >
        <div class="flex items-center mb-2">
          <span class="text-lg mr-2">🚨</span>
          <h4 class="font-semibold">Risk Scenarios Detected</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="scenario in getRiskScenarios"
            :key="scenario.type"
            class="flex items-start space-x-2"
          >
            <span class="text-lg">{{ scenario.icon }}</span>
            <div class="flex-1">
              <div class="font-medium text-sm">{{ scenario.title }}</div>
              <div class="text-xs opacity-90">{{ scenario.description }}</div>
            </div>
          </div>
        </div>
        <div class="mt-3 text-xs opacity-75">
          <strong>Recommendation:</strong>
          <span v-if="getOverallRiskLevel() === 'critical'"
            >Consider stopping or significantly reducing bet sizes.</span
          >
          <span v-else-if="getOverallRiskLevel() === 'high'"
            >Exercise caution and consider smaller bet sizes.</span
          >
          <span v-else>Monitor closely and adjust strategy as needed.</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="monte-carlo-metric"
          :class="monteCarloResults.expectedValue < 0 ? 'ring-2 ring-red-300' : ''"
        >
          <div class="text-sm font-medium text-gray-700">Expected Value (100 hands)</div>
          <div class="flex items-center justify-center space-x-1">
            <div
              class="text-lg font-bold"
              :class="monteCarloResults.expectedValue >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              ${{ monteCarloResults.expectedValue.toFixed(2) }}
            </div>
            <span v-if="monteCarloResults.expectedValue < -100" class="text-red-500">💸</span>
            <span v-else-if="monteCarloResults.expectedValue < 0" class="text-orange-500">⚠️</span>
          </div>
        </div>
        <div
          class="monte-carlo-metric"
          :class="monteCarloResults.probabilityOfProfit <= 0.4 ? 'ring-2 ring-orange-300' : ''"
        >
          <div class="text-sm font-medium text-gray-700">Probability of Profit</div>
          <div class="flex items-center justify-center space-x-1">
            <div
              class="text-lg font-bold"
              :class="[
                monteCarloResults.probabilityOfProfit >= 0.6
                  ? 'text-green-600'
                  : monteCarloResults.probabilityOfProfit >= 0.4
                    ? 'text-yellow-600'
                    : 'text-red-600',
              ]"
            >
              {{ (monteCarloResults.probabilityOfProfit * 100).toFixed(1) }}%
            </div>
            <span v-if="monteCarloResults.probabilityOfProfit <= 0.25" class="text-red-500"
              >📉</span
            >
            <span v-else-if="monteCarloResults.probabilityOfProfit <= 0.4" class="text-orange-500"
              >⚠️</span
            >
          </div>
        </div>
        <div
          class="monte-carlo-metric"
          :class="
            monteCarloResults.confidenceRange.upper - monteCarloResults.confidenceRange.lower > 1000
              ? 'ring-2 ring-yellow-300'
              : ''
          "
        >
          <div class="text-sm font-medium text-gray-700">95% Confidence Range</div>
          <div class="text-sm">
            ${{ monteCarloResults.confidenceRange.lower.toFixed(2) }} to ${{
              monteCarloResults.confidenceRange.upper.toFixed(2)
            }}
          </div>
          <div
            v-if="
              monteCarloResults.confidenceRange.upper - monteCarloResults.confidenceRange.lower >
              500
            "
            class="text-xs mt-1 flex items-center justify-center space-x-1"
          >
            <span class="text-yellow-600">High Volatility</span>
            <span
              v-if="
                monteCarloResults.confidenceRange.upper - monteCarloResults.confidenceRange.lower >
                1000
              "
              >🎢</span
            >
          </div>
        </div>
        <div
          class="monte-carlo-metric"
          :class="monteCarloResults.riskOfRuin >= 0.15 ? 'ring-2 ring-red-300' : ''"
        >
          <div class="text-sm font-medium text-gray-700">Risk of Ruin</div>
          <div class="flex items-center justify-center space-x-1">
            <div
              class="text-lg font-bold"
              :class="[
                monteCarloResults.riskOfRuin >= 0.3
                  ? 'text-red-600'
                  : monteCarloResults.riskOfRuin >= 0.15
                    ? 'text-orange-600'
                    : 'text-green-600',
              ]"
            >
              {{ (monteCarloResults.riskOfRuin * 100).toFixed(1) }}%
            </div>
            <span v-if="monteCarloResults.riskOfRuin >= 0.3" class="text-red-500">⚠️</span>
            <span v-else-if="monteCarloResults.riskOfRuin >= 0.15" class="text-orange-500">⚠️</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useBaccaratStore } from '../../stores/baccaratStore';

const store = useBaccaratStore();
const isSimulating = ref(false);
const lastAutoRunHand = ref(0);
const lastEdgeSnapshot = ref({
  playerEdge: 0,
  bankerEdge: 0,
  playerPairEdge: 0,
  bankerPairEdge: 0,
  edgeSortingAdvantage: 0,
});
const lastEdgeRunHand = ref(0);
const previousKellyBetSize = ref(0);
// Use configurable Kelly threshold from store
const kellyChangeThreshold = computed(() => store.settings.kelly.changeThreshold);
const showKellyNotification = ref(false);
const kellyNotificationTimeout = ref<NodeJS.Timeout | null>(null);
const showTriggerSettings = ref(false);
const activeSettingsTab = ref('triggers');

// Use configurable risk thresholds from store
const riskThresholds = computed(() => ({
  highRiskOfRuin: store.settings.monteCarlo.riskThresholds.highRiskOfRuin,
  lowProfitProbability: store.settings.monteCarlo.riskThresholds.lowProfitProbability,
  negativeExpectedValue: store.settings.monteCarlo.riskThresholds.negativeExpectedValue,
  highVolatility: store.settings.monteCarlo.riskThresholds.highVolatility,
}));

interface AnalyticsData {
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownAmount: number;
  profitFactor: number;
  recoveryFactor: number;
  standardDeviation: number;
  variance: number;
  coefficientOfVariation: number;
  riskOfRuin: number;
  betSizeDistribution: Record<string, { count: number; percentage: number }>;
  favoriteBetTypes: Array<{ type: string; count: number; percentage: number }>;
  performanceByBetType: Record<string, { roi: number; winRate: number }>;
  confidenceIntervals: {
    next10: { lower: number; upper: number };
    next100: { lower: number; upper: number };
  };
}

interface KellyData {
  optimalBetSize: number;
  kellyPercentage: number;
  winProbability: number;
  averageWin: number;
  averageLoss: number;
  edge: number;
}

interface MonteCarloResults {
  simulations: number;
  expectedValue: number;
  probabilityOfProfit: number;
  confidenceRange: { lower: number; upper: number };
  riskOfRuin: number;
}

const analytics = ref<AnalyticsData>({
  sharpeRatio: 0,
  maxDrawdown: 0,
  maxDrawdownAmount: 0,
  profitFactor: 0,
  recoveryFactor: 0,
  standardDeviation: 0,
  variance: 0,
  coefficientOfVariation: 0,
  riskOfRuin: 0,
  betSizeDistribution: {},
  favoriteBetTypes: [],
  performanceByBetType: {},
  confidenceIntervals: {
    next10: { lower: 0, upper: 0 },
    next100: { lower: 0, upper: 0 },
  },
});

const kellyOptimal = ref<KellyData>({
  optimalBetSize: 0,
  kellyPercentage: 0,
  winProbability: 0,
  averageWin: 0,
  averageLoss: 0,
  edge: 0,
});

const monteCarloResults = ref<MonteCarloResults>({
  simulations: 0,
  expectedValue: 0,
  probabilityOfProfit: 0,
  confidenceRange: { lower: 0, upper: 0 },
  riskOfRuin: 0,
});

// Calculate advanced analytics
const calculateAnalytics = () => {
  const stats = store.bettingStats;

  if (stats.totalHands === 0) {
    return;
  }

  // Sharpe Ratio (simplified - using ROI as return and standard deviation of returns)
  const returns = calculateReturns();
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  analytics.value.sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

  // Maximum Drawdown
  const { maxDrawdown, maxDrawdownAmount } = calculateMaxDrawdown();
  analytics.value.maxDrawdown = maxDrawdown;
  analytics.value.maxDrawdownAmount = maxDrawdownAmount;

  // Profit Factor
  const grossProfit = Math.max(stats.totalWinLoss, 0);
  const grossLoss = Math.abs(Math.min(stats.totalWinLoss, 0));
  analytics.value.profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  // Recovery Factor
  analytics.value.recoveryFactor =
    maxDrawdownAmount > 0 ? stats.totalWinLoss / maxDrawdownAmount : 0;

  // Variance Analysis
  analytics.value.standardDeviation = stdDev * Math.sqrt(stats.averageBetSize);
  analytics.value.variance = Math.pow(analytics.value.standardDeviation, 2);
  analytics.value.coefficientOfVariation =
    stats.totalWinLoss !== 0 ? analytics.value.standardDeviation / Math.abs(stats.totalWinLoss) : 0;

  // Risk of Ruin (simplified calculation)
  analytics.value.riskOfRuin = calculateRiskOfRuin();

  // Betting Pattern Analysis
  analytics.value.betSizeDistribution = calculateBetSizeDistribution();
  analytics.value.favoriteBetTypes = calculateFavoriteBetTypes();
  analytics.value.performanceByBetType = calculatePerformanceByBetType();

  // Confidence Intervals
  analytics.value.confidenceIntervals = calculateConfidenceIntervals();
};

const calculateReturns = (): number[] => {
  // Simplified - would need actual hand-by-hand data for precise calculation
  const stats = store.bettingStats;
  const avgReturn = stats.totalWinLoss / stats.totalHands;
  const returns = [];

  for (let i = 0; i < stats.totalHands; i++) {
    // Simulate returns based on win rate and average bet size
    const isWin = Math.random() < stats.winRate;
    const returnAmount = isWin ? avgReturn * 2 : -avgReturn;
    returns.push(returnAmount / stats.averageBetSize); // Normalize by bet size
  }

  return returns;
};

const calculateMaxDrawdown = (): { maxDrawdown: number; maxDrawdownAmount: number } => {
  // Simplified calculation - would need running balance history for precise calculation
  const stats = store.bettingStats;
  const estimatedPeak = stats.biggestWin;
  const estimatedTrough = stats.biggestLoss;
  const drawdownAmount = estimatedPeak - estimatedTrough;
  const drawdownPercentage = estimatedPeak > 0 ? drawdownAmount / estimatedPeak : 0;

  return {
    maxDrawdown: Math.min(drawdownPercentage, 1),
    maxDrawdownAmount: Math.abs(drawdownAmount),
  };
};

const calculateRiskOfRuin = (): number => {
  const stats = store.bettingStats;
  if (stats.winRate >= 0.5 && stats.totalWinLoss > 0) {
    // Simplified risk of ruin calculation
    const edge = stats.roi;
    const variance = analytics.value.variance;
    return Math.max(0, Math.min(1, Math.exp((-2 * edge * 1000) / variance))); // Assuming $1000 bankroll
  }
  return 0.5; // Default moderate risk
};

const calculateBetSizeDistribution = () => {
  // Simplified - would need actual bet history
  return {
    '$1-$10': { count: 15, percentage: 30 },
    '$11-$25': { count: 20, percentage: 40 },
    '$26-$50': { count: 10, percentage: 20 },
    '$51+': { count: 5, percentage: 10 },
  };
};

const calculateFavoriteBetTypes = () => {
  return [
    { type: 'player', count: 25, percentage: 45 },
    { type: 'banker', count: 20, percentage: 36 },
    { type: 'tie', count: 5, percentage: 9 },
    { type: 'pairs', count: 6, percentage: 10 },
  ];
};

const calculatePerformanceByBetType = () => {
  return {
    player: { roi: 0.05, winRate: 0.48 },
    banker: { roi: 0.03, winRate: 0.51 },
    tie: { roi: -0.15, winRate: 0.09 },
    playerPair: { roi: -0.08, winRate: 0.07 },
    bankerPair: { roi: -0.08, winRate: 0.07 },
  };
};

const calculateConfidenceIntervals = () => {
  const stats = store.bettingStats;
  const avgReturn = stats.totalWinLoss / Math.max(stats.totalHands, 1);
  const stdDev = analytics.value.standardDeviation;

  // 95% confidence interval (1.96 * standard error)
  const se10 = stdDev / Math.sqrt(10);
  const se100 = stdDev / Math.sqrt(100);

  return {
    next10: {
      lower: avgReturn * 10 - 1.96 * se10 * 10,
      upper: avgReturn * 10 + 1.96 * se10 * 10,
    },
    next100: {
      lower: avgReturn * 100 - 1.96 * se100 * 100,
      upper: avgReturn * 100 + 1.96 * se100 * 100,
    },
  };
};

const calculateKellyOptimal = () => {
  const stats = store.bettingStats;
  const bestEdge = store.bestBetRecommendation.edge;

  if (stats.totalHands === 0) {
    const newKellyData = {
      optimalBetSize: 0,
      kellyPercentage: 0,
      winProbability: 0.5,
      averageWin: 0,
      averageLoss: 0,
      edge: 0,
    };
    kellyOptimal.value = newKellyData;
    previousKellyBetSize.value = 0;
    return;
  }

  const winProbability = stats.winRate;
  const averageWin = stats.biggestWin / Math.max(stats.correctBets, 1);
  const averageLoss = Math.abs(stats.biggestLoss) / Math.max(stats.incorrectBets, 1);

  // Kelly Criterion: f = (bp - q) / b
  // where b = odds received, p = probability of winning, q = probability of losing
  const b = averageWin / averageLoss; // Odds ratio
  const p = winProbability;
  const q = 1 - p;

  const kellyPercentage = Math.max(0, (b * p - q) / b);
  const bankroll = store.settings.kelly.bankrollAmount;
  const fractionalMultiplier = store.settings.kelly.fractionalKelly;
  const maxKellyAllowed = store.settings.kelly.maxKellyPercentage;

  // Apply fractional Kelly and max Kelly limits
  const adjustedKellyPercentage = Math.min(kellyPercentage * fractionalMultiplier, maxKellyAllowed);
  const optimalBetSize = adjustedKellyPercentage * bankroll;

  // Store previous bet size for comparison
  previousKellyBetSize.value = kellyOptimal.value.optimalBetSize;

  kellyOptimal.value = {
    optimalBetSize,
    kellyPercentage: adjustedKellyPercentage,
    winProbability: p,
    averageWin,
    averageLoss,
    edge: bestEdge,
  };

  // Trigger notification for significant changes
  if (hasSignificantKellyChange()) {
    triggerKellyNotification();
  }
};

const triggerKellyNotification = () => {
  // Clear existing timeout
  if (kellyNotificationTimeout.value) {
    clearTimeout(kellyNotificationTimeout.value);
  }

  // Show notification
  showKellyNotification.value = true;

  // Hide notification after 5 seconds
  kellyNotificationTimeout.value = setTimeout(() => {
    showKellyNotification.value = false;
  }, 5000);
};

const runMonteCarloSimulation = async () => {
  isSimulating.value = true;

  // Update edge snapshot when running manually to prevent false triggers
  lastEdgeSnapshot.value = { ...store.edgeCalculations };

  // Simulate in chunks to avoid blocking UI
  await new Promise(resolve => setTimeout(resolve, 100));

  const simulations = store.settings.monteCarlo.simulations;
  const handsToSimulate = store.settings.monteCarlo.handsToSimulate;
  const results = [];

  const winRate = store.bettingStats.winRate || 0.5;
  const avgBetSize = store.bettingStats.averageBetSize || 10;
  const avgWin = kellyOptimal.value.averageWin || avgBetSize;
  const avgLoss = kellyOptimal.value.averageLoss || avgBetSize;

  for (let sim = 0; sim < simulations; sim++) {
    let totalReturn = 0;
    let currentBankroll = 1000;
    let ruined = false;

    for (let hand = 0; hand < handsToSimulate; hand++) {
      if (ruined) break;

      const isWin = Math.random() < winRate;
      const betSize = Math.min(avgBetSize, currentBankroll * 0.05); // Max 5% of bankroll

      if (isWin) {
        const winAmount = Math.min(avgWin, betSize * 2); // Cap winnings
        totalReturn += winAmount;
        currentBankroll += winAmount;
      } else {
        const lossAmount = Math.min(avgLoss, betSize); // Loss is limited to bet size
        totalReturn -= lossAmount;
        currentBankroll -= lossAmount;

        if (currentBankroll <= 0) {
          ruined = true;
          totalReturn = -1000; // Total ruin
        }
      }
    }

    results.push({ totalReturn, ruined });
  }

  // Calculate statistics
  const profits = results.filter(r => r.totalReturn > 0).length;
  const ruins = results.filter(r => r.ruined).length;
  const returns = results.map(r => r.totalReturn);

  returns.sort((a, b) => a - b);
  const lowerIndex = Math.floor(simulations * 0.025);
  const upperIndex = Math.floor(simulations * 0.975);

  monteCarloResults.value = {
    simulations,
    expectedValue: returns.reduce((sum, r) => sum + r, 0) / simulations,
    probabilityOfProfit: profits / simulations,
    confidenceRange: {
      lower: returns[lowerIndex],
      upper: returns[upperIndex],
    },
    riskOfRuin: ruins / simulations,
  };

  isSimulating.value = false;
};

// Utility functions for styling
const getSharpeClass = (ratio: number): string => {
  if (ratio > 2) return 'text-green-600';
  if (ratio > 1) return 'text-blue-600';
  if (ratio > 0) return 'text-yellow-600';
  return 'text-red-600';
};

const getSharpeDescription = (ratio: number): string => {
  if (ratio > 3) return 'Outstanding';
  if (ratio > 2) return 'Excellent';
  if (ratio > 1) return 'Good';
  if (ratio > 0) return 'Acceptable';
  return 'Poor';
};

const getProfitFactorClass = (factor: number): string => {
  if (factor > 2) return 'text-green-600';
  if (factor > 1) return 'text-blue-600';
  return 'text-red-600';
};

const getProfitFactorDescription = (factor: number): string => {
  if (factor > 2) return 'Very Good';
  if (factor > 1) return 'Profitable';
  return 'Losing';
};

const getRecoveryFactorClass = (factor: number): string => {
  if (factor > 3) return 'text-green-600';
  if (factor > 1) return 'text-blue-600';
  return 'text-red-600';
};

const getRecoveryFactorDescription = (factor: number): string => {
  if (factor > 3) return 'Excellent';
  if (factor > 1) return 'Good';
  return 'Poor';
};

// Kelly change detection functions
const hasSignificantKellyChange = (): boolean => {
  if (previousKellyBetSize.value === 0 || kellyOptimal.value.optimalBetSize === 0) return false;

  const changeRatio =
    Math.abs(kellyOptimal.value.optimalBetSize - previousKellyBetSize.value) /
    previousKellyBetSize.value;
  return changeRatio >= kellyChangeThreshold.value;
};

const getKellyChangeDirection = (): 'increase' | 'decrease' | 'none' => {
  if (!hasSignificantKellyChange()) return 'none';

  if (kellyOptimal.value.optimalBetSize > previousKellyBetSize.value) return 'increase';
  return 'decrease';
};

const getKellyChangePercentage = (): number => {
  if (previousKellyBetSize.value === 0) return 0;

  return (
    ((kellyOptimal.value.optimalBetSize - previousKellyBetSize.value) /
      previousKellyBetSize.value) *
    100
  );
};

const getKellyChangeClass = (): string => {
  const direction = getKellyChangeDirection();
  if (direction === 'none') return '';

  return direction === 'increase' ? 'kelly-increase' : 'kelly-decrease';
};

// Risk scenario detection functions
const detectRiskScenarios = () => {
  const scenarios = [];
  const results = monteCarloResults.value;

  if (results.simulations === 0) return scenarios;

  // High Risk of Ruin
  if (results.riskOfRuin >= riskThresholds.value.highRiskOfRuin) {
    scenarios.push({
      type: 'high-risk-of-ruin',
      severity: results.riskOfRuin >= 0.3 ? 'critical' : 'high',
      title: 'High Risk of Ruin',
      description: `${(results.riskOfRuin * 100).toFixed(1)}% chance of losing entire bankroll`,
      value: results.riskOfRuin,
      icon: '⚠️',
      color: results.riskOfRuin >= 0.3 ? 'red' : 'orange',
    });
  }

  // Low Profit Probability
  if (results.probabilityOfProfit <= riskThresholds.value.lowProfitProbability) {
    scenarios.push({
      type: 'low-profit-probability',
      severity: results.probabilityOfProfit <= 0.25 ? 'critical' : 'high',
      title: 'Low Profit Probability',
      description: `Only ${(results.probabilityOfProfit * 100).toFixed(1)}% chance of profit`,
      value: results.probabilityOfProfit,
      icon: '📉',
      color: results.probabilityOfProfit <= 0.25 ? 'red' : 'orange',
    });
  }

  // Negative Expected Value
  if (results.expectedValue < riskThresholds.value.negativeExpectedValue) {
    scenarios.push({
      type: 'negative-expected-value',
      severity: results.expectedValue <= -100 ? 'critical' : 'high',
      title: 'Negative Expected Value',
      description: `Expected loss of $${Math.abs(results.expectedValue).toFixed(2)} over 100 hands`,
      value: results.expectedValue,
      icon: '💸',
      color: results.expectedValue <= -100 ? 'red' : 'orange',
    });
  }

  // Wide Confidence Range (high volatility)
  const confidenceRange = results.confidenceRange.upper - results.confidenceRange.lower;
  if (confidenceRange > riskThresholds.value.highVolatility) {
    scenarios.push({
      type: 'high-volatility',
      severity: confidenceRange > riskThresholds.value.highVolatility * 2 ? 'critical' : 'medium',
      title: 'High Volatility',
      description: `Wide outcome range: $${confidenceRange.toFixed(0)} spread`,
      value: confidenceRange,
      icon: '🎢',
      color: confidenceRange > riskThresholds.value.highVolatility * 2 ? 'orange' : 'yellow',
    });
  }

  return scenarios;
};

const getRiskScenarios = computed(() => detectRiskScenarios());

const getOverallRiskLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
  const scenarios = getRiskScenarios.value;

  if (scenarios.some(s => s.severity === 'critical')) return 'critical';
  if (scenarios.some(s => s.severity === 'high')) return 'high';
  if (scenarios.some(s => s.severity === 'medium')) return 'medium';
  return 'low';
};

const getRiskLevelClass = (level: string): string => {
  switch (level) {
    case 'critical':
      return 'bg-red-100 border-red-500 text-red-800';
    case 'high':
      return 'bg-orange-100 border-orange-500 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    default:
      return 'bg-green-100 border-green-500 text-green-800';
  }
};

const getNextRunInfo = (): string => {
  const currentHands = store.bettingStats.totalHands;

  // Check if we just ran due to edge change
  if (currentHands === lastEdgeRunHand.value && currentHands > 0) {
    return 'Edge-triggered';
  }

  if (!store.settings.monteCarlo.autoRun) {
    return 'Edge-monitoring active';
  }

  const interval = store.settings.monteCarlo.runEveryNHands;
  const nextRunAt = Math.ceil((currentHands + 1) / interval) * interval;
  const handsUntilNext = nextRunAt - currentHands;

  if (handsUntilNext <= 0) {
    return 'Next hand';
  } else if (handsUntilNext === 1) {
    return 'In 1 hand';
  } else {
    return `In ${handsUntilNext} hands`;
  }
};

// Auto-run Monte Carlo logic
const checkAutoRun = () => {
  if (isSimulating.value) return;

  const currentHands = store.bettingStats.totalHands;
  const interval = store.settings.monteCarlo.runEveryNHands;

  // Check if we should run based on hand count (only if auto-run is enabled)
  if (
    store.settings.monteCarlo.autoRun &&
    currentHands > 0 &&
    currentHands % interval === 0 &&
    currentHands !== lastAutoRunHand.value
  ) {
    lastAutoRunHand.value = currentHands;
    runMonteCarloSimulation();
    return;
  }

  // Check for significant edge changes (works regardless of auto-run setting)
  checkSignificantEdgeChange();
};

// Check for significant edge changes
const checkSignificantEdgeChange = () => {
  if (isSimulating.value) return;

  const currentEdges = store.edgeCalculations;
  const currentHands = store.bettingStats.totalHands;

  // Don't check on the very first hand or if we just ran due to edge change
  if (currentHands === 0 || currentHands === lastEdgeRunHand.value) return;

  // Calculate edge changes
  const edgeChanges = {
    playerEdge: Math.abs(currentEdges.playerEdge - lastEdgeSnapshot.value.playerEdge),
    bankerEdge: Math.abs(currentEdges.bankerEdge - lastEdgeSnapshot.value.bankerEdge),
    playerPairEdge: Math.abs(currentEdges.playerPairEdge - lastEdgeSnapshot.value.playerPairEdge),
    bankerPairEdge: Math.abs(currentEdges.bankerPairEdge - lastEdgeSnapshot.value.bankerPairEdge),
    edgeSortingAdvantage: Math.abs(
      currentEdges.edgeSortingAdvantage - lastEdgeSnapshot.value.edgeSortingAdvantage
    ),
  };

  // Use configurable thresholds from store
  const significantThresholds = store.settings.calculationTriggers.edgeChangeThresholds;

  // Check if any edge has changed significantly
  const hasSignificantChange = Object.keys(edgeChanges).some(key => {
    const change = edgeChanges[key as keyof typeof edgeChanges];
    const threshold = significantThresholds[key as keyof typeof significantThresholds];
    return change >= threshold;
  });

  if (hasSignificantChange) {
    // Update snapshots
    lastEdgeSnapshot.value = { ...currentEdges };
    lastEdgeRunHand.value = currentHands;

    // Run Monte Carlo due to significant edge change
    runMonteCarloSimulation();
  }
};

// Watch for changes in total hands to trigger auto-run
watch(
  () => store.bettingStats.totalHands,
  () => {
    checkAutoRun();
  }
);

// Watch for edge changes to trigger auto-run
watch(
  () => store.edgeCalculations,
  () => {
    checkAutoRun();
  },
  { deep: true }
);

// Watch for card deals to trigger real-time Kelly updates
watch(
  () => store.shoe.currentHand,
  () => {
    calculateKellyOptimal();
  },
  { deep: true }
);

// Watch for shoe composition changes (cards dealt/burned)
watch(
  () => store.shoe.remainingCards,
  () => {
    calculateKellyOptimal();
  },
  { deep: true }
);

// Watch for betting stats changes to update Kelly
watch(
  () => store.bettingStats,
  () => {
    calculateKellyOptimal();
  },
  { deep: true }
);

// Event handlers for settings changes
const onAutoRunChange = () => {
  // Reset the last run hand when toggling auto-run
  lastAutoRunHand.value = store.bettingStats.totalHands;

  // If turning on auto-run and we're at the right interval, run immediately
  if (store.settings.monteCarlo.autoRun) {
    checkAutoRun();
  }
};

const onIntervalChange = () => {
  // Reset the last run hand when changing interval
  lastAutoRunHand.value = 0;

  // Check if we should run with the new interval
  if (store.settings.monteCarlo.autoRun) {
    checkAutoRun();
  }
};

// Trigger settings event handlers
const onTriggerSettingsChange = () => {
  // Update edge snapshots when thresholds change
  lastEdgeSnapshot.value = { ...store.edgeCalculations };

  // Sync banker edge threshold with player edge threshold
  store.settings.calculationTriggers.edgeChangeThresholds.bankerEdge =
    store.settings.calculationTriggers.edgeChangeThresholds.playerEdge;

  // Sync banker pair edge threshold with player pair edge threshold
  store.settings.calculationTriggers.edgeChangeThresholds.bankerPairEdge =
    store.settings.calculationTriggers.edgeChangeThresholds.playerPairEdge;
};

const applyTriggerPreset = (preset: 'conservative' | 'balanced' | 'aggressive') => {
  const presets = {
    conservative: {
      playerEdge: 0.01,
      bankerEdge: 0.01,
      playerPairEdge: 0.02,
      bankerPairEdge: 0.02,
      edgeSortingAdvantage: 0.015,
    },
    balanced: {
      playerEdge: 0.005,
      bankerEdge: 0.005,
      playerPairEdge: 0.01,
      bankerPairEdge: 0.01,
      edgeSortingAdvantage: 0.0075,
    },
    aggressive: {
      playerEdge: 0.001,
      bankerEdge: 0.001,
      playerPairEdge: 0.005,
      bankerPairEdge: 0.005,
      edgeSortingAdvantage: 0.003,
    },
  };

  Object.assign(store.settings.calculationTriggers.edgeChangeThresholds, presets[preset]);
  onTriggerSettingsChange();
};

const resetTriggerSettings = () => {
  store.settings.calculationTriggers.autoCalculateEdges = true;
  store.settings.calculationTriggers.edgeChangeThresholds = {
    playerEdge: 0.005,
    bankerEdge: 0.005,
    playerPairEdge: 0.005,
    bankerPairEdge: 0.005,
    edgeSortingAdvantage: 0.005,
  };
  store.settings.calculationTriggers.shoeCompositionTriggers = {
    enabled: true,
    significantCardChange: 10,
    penetrationThreshold: 0.5,
  };
  onTriggerSettingsChange();
};

// Kelly settings event handlers
const onKellySettingsChange = () => {
  // Recalculate Kelly immediately when settings change
  calculateKellyOptimal();
};

const applyKellyPreset = (preset: 'conservative' | 'balanced' | 'aggressive') => {
  const presets = {
    conservative: {
      fractionalKelly: 0.25,
      maxKellyPercentage: 0.15,
      changeThreshold: 0.5,
      autoAdjustBetSize: false,
    },
    balanced: {
      fractionalKelly: 0.5,
      maxKellyPercentage: 0.25,
      changeThreshold: 0.25,
      autoAdjustBetSize: true,
    },
    aggressive: {
      fractionalKelly: 0.75,
      maxKellyPercentage: 0.4,
      changeThreshold: 0.15,
      autoAdjustBetSize: true,
    },
  };

  Object.assign(store.settings.kelly, presets[preset]);
  onKellySettingsChange();
};

const resetKellySettings = () => {
  store.settings.kelly = {
    enabled: true,
    changeThreshold: 0.25,
    fractionalKelly: 0.5,
    maxKellyPercentage: 0.25,
    bankrollAmount: 1000,
    autoAdjustBetSize: false,
  };
  onKellySettingsChange();
};

// Monte Carlo settings event handlers
const onMonteCarloSettingsChange = () => {
  // Clear existing results to force recalculation with new parameters
  monteCarloResults.value = {
    simulations: 0,
    expectedValue: 0,
    probabilityOfProfit: 0,
    confidenceRange: { lower: 0, upper: 0 },
    riskOfRuin: 0,
  };
};

const applyMonteCarloPreset = (preset: 'fast' | 'balanced' | 'accurate') => {
  const presets = {
    fast: {
      simulations: 5000,
      handsToSimulate: 50,
      riskThresholds: {
        highRiskOfRuin: 0.2,
        lowProfitProbability: 0.35,
        negativeExpectedValue: 0,
        highVolatility: 600,
      },
    },
    balanced: {
      simulations: 10000,
      handsToSimulate: 100,
      riskThresholds: {
        highRiskOfRuin: 0.15,
        lowProfitProbability: 0.4,
        negativeExpectedValue: 0,
        highVolatility: 500,
      },
    },
    accurate: {
      simulations: 25000,
      handsToSimulate: 200,
      riskThresholds: {
        highRiskOfRuin: 0.1,
        lowProfitProbability: 0.45,
        negativeExpectedValue: 0,
        highVolatility: 400,
      },
    },
  };

  Object.assign(store.settings.monteCarlo, presets[preset]);
  onMonteCarloSettingsChange();
};

const resetMonteCarloSettings = () => {
  store.settings.monteCarlo = {
    autoRun: true,
    runEveryNHands: 3,
    simulations: 10000,
    handsToSimulate: 100,
    riskThresholds: {
      highRiskOfRuin: 0.15,
      lowProfitProbability: 0.4,
      negativeExpectedValue: 0,
      highVolatility: 500,
    },
  };
  onMonteCarloSettingsChange();
};

onMounted(() => {
  calculateAnalytics();

  // Initialize Kelly tracking
  previousKellyBetSize.value = 0;
  calculateKellyOptimal();

  // Initialize last run hand and edge snapshot
  lastAutoRunHand.value = store.bettingStats.totalHands;
  lastEdgeRunHand.value = store.bettingStats.totalHands;
  lastEdgeSnapshot.value = { ...store.edgeCalculations };

  // Check if we should auto-run on mount
  if (store.settings.monteCarlo.autoRun) {
    checkAutoRun();
  }
});

// Watch for changes in betting stats
const updateAnalytics = () => {
  calculateAnalytics();
  calculateKellyOptimal();
};

// Expose update function for parent component
defineExpose({ updateAnalytics });
</script>

<style scoped>
.metric-card {
  @apply bg-white p-4 rounded-lg border border-gray-200 shadow-sm;
}

.metric-header {
  @apply flex items-center justify-between mb-2;
}

.metric-title {
  @apply text-sm font-semibold text-gray-700;
}

.metric-tooltip {
  @apply text-xs text-gray-400 cursor-help;
}

.metric-value {
  @apply text-2xl font-bold;
}

.metric-subtitle {
  @apply text-xs text-gray-600;
}

.analytics-section {
  @apply bg-white p-4 rounded-lg border border-gray-200;
}

.section-title {
  @apply text-lg font-semibold text-gray-800 mb-3;
}

.kelly-recommendation {
  @apply bg-green-50 p-3 rounded-lg border border-green-200;
}

.kelly-details {
  @apply bg-gray-50 p-3 rounded-lg;
}

.pattern-analysis {
  @apply bg-gray-50 p-3 rounded-lg;
}

.monte-carlo-metric {
  @apply bg-gray-50 p-3 rounded-lg text-center;
}

.kelly-increase {
  @apply ring-2 ring-green-300 bg-green-50;
  animation: kelly-pulse-green 2s ease-in-out;
}

.kelly-decrease {
  @apply ring-2 ring-red-300 bg-red-50;
  animation: kelly-pulse-red 2s ease-in-out;
}

.kelly-change-indicator {
  animation: kelly-bounce 1s ease-in-out;
}

@keyframes kelly-pulse-green {
  0% {
    @apply ring-green-300 bg-green-50;
  }
  50% {
    @apply ring-green-400 bg-green-100;
  }
  100% {
    @apply ring-green-300 bg-green-50;
  }
}

@keyframes kelly-pulse-red {
  0% {
    @apply ring-red-300 bg-red-50;
  }
  50% {
    @apply ring-red-400 bg-red-100;
  }
  100% {
    @apply ring-red-300 bg-red-50;
  }
}

@keyframes kelly-bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.kelly-notification {
  animation: kelly-slide-in 0.3s ease-out;
}

@keyframes kelly-slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
