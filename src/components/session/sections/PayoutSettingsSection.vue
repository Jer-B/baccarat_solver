<template>
  <PayoutSettings
    :initial-payout-values="initialPayoutValues"
    :selected-preset-id="selectedPresetId"
    :enable-preset-management="enablePresetManagement"
    :enable-manual-editing="enableManualEditing"
    :show-payout-examples="showPayoutExamples"
    :show-preset-info="showPresetInfo"
    :example-bet-amount="exampleBetAmount"
    :presets-loading="presetsLoading"
    :saving-preset="savingPreset"
    :validation-errors="validationErrors"
    :preset-error="presetError"
    @payout-change="handlePayoutChange"
    @manual-value-change="handleManualValueChange"
    @preset-selected="handlePresetSelected"
    @preset-created="handlePresetCreated"
    @preset-updated="handlePresetUpdated"
    @preset-deleted="handlePresetDeleted"
    @default-preset-changed="handleDefaultPresetChanged"
    @reset-to-defaults="handleResetToDefaults"
    @validation-error="handleValidationError"
    @validation-success="handleValidationSuccess"
  >
    <template
      #default="{
        state,
        canAddCustomPreset,
        canDeleteSelectedPreset,
        canSetAsDefault,
        hasUnsavedChanges,
        actions,
        handlers,
      }"
    >
      <!-- Add spacing between sections -->
      <div class="mt-6">
        <div :class="config.STYLING.MAIN_CONTAINER">
          <!-- Header Section -->
          <div :class="config.STYLING.HEADER_CONTAINER">
            <!-- Smaller title -->
            <h3 class="text-lg font-semibold text-yellow-800">
              {{ config.LABELS.TITLE }}
            </h3>

            <div :class="config.STYLING.BUTTON_CONTAINER">
              <!-- Reset to Defaults Button -->
              <button
                :class="[config.STYLING.BUTTON_BASE, config.STYLING.RESET_BUTTON]"
                @click="actions.resetToDefaults"
                :title="'Reset all payout values to defaults'"
              >
                {{ config.LABELS.RESET_TO_DEFAULTS_BUTTON }}
              </button>
            </div>
          </div>

          <!-- Current Selection Info -->
          <div class="mb-4 text-sm text-gray-600">
            <strong>Selected:</strong>
            <span v-if="useManualConfig" class="text-purple-800"> Manual Configuration </span>
            <span v-else-if="state.selectedPreset" class="text-yellow-800">
              {{ state.selectedPreset.name }}
              <span v-if="hasUnsavedChanges" class="text-orange-600 ml-2">
                ⚠️ You have unsaved changes - editing manually
              </span>
            </span>
            <span v-else class="text-gray-500"> No preset selected </span>
          </div>

          <!-- Info Text about Setting Flexibility -->
          <div class="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div class="flex items-start space-x-2">
              <svg
                class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="text-sm text-blue-700">
                <strong>Flexible Configuration:</strong> You can change these payout settings at any
                time during your session. Changes take effect immediately for future hands.
              </p>
            </div>
          </div>

          <!-- Simple Preset Buttons (no frame, no fancy title) -->
          <div class="mb-6">
            <!-- Simple preset buttons grid -->
            <div class="flex flex-wrap gap-3 mb-4">
              <button
                v-for="preset in state.availablePresets"
                :key="preset.id"
                :class="[
                  'px-4 py-2 rounded-lg border text-sm transition-all duration-200',
                  preset.is_default
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : preset.is_system_preset
                      ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                      : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
                  state.selectedPreset?.id === preset.id && !hasUnsavedChanges
                    ? 'ring-2 ring-yellow-400'
                    : '',
                ]"
                @click="actions.selectPreset(preset)"
                :title="`Select ${preset.name} preset`"
              >
                {{ preset.name }}
                <span v-if="preset.is_default" class="ml-1 text-xs">(Default)</span>
              </button>

              <!-- Add Custom Preset Button -->
              <button
                v-if="canAddCustomPreset"
                :class="[
                  'px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all duration-200 text-sm',
                ]"
                @click="actions.showAddPresetDialog"
                :disabled="!canAddCustomPreset"
                :title="'Add a custom casino preset'"
              >
                + Add Custom
              </button>

              <!-- Save as Custom Preset Button (when manual changes exist) -->
              <button
                v-if="hasUnsavedChanges"
                :class="[
                  'px-4 py-2 rounded-lg border-2 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all duration-200 text-sm',
                ]"
                @click="actions.showAddPresetDialog"
                :title="'Save current manual settings as a new preset'"
              >
                💾 Save as Preset
              </button>
            </div>

            <!-- Preset Actions - Always Visible -->
            <div class="flex space-x-2">
              <!-- Set as Default - Always visible, disabled when no preset selected -->
              <button
                :class="[
                  config.STYLING.BUTTON_BASE,
                  state.selectedPreset && !hasUnsavedChanges && !state.selectedPreset.is_default
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                  'text-xs px-3 py-1',
                ]"
                @click="handleSetDefaultPreset(state, actions, hasUnsavedChanges)"
                :disabled="
                  !state.selectedPreset ||
                  hasUnsavedChanges ||
                  (state.selectedPreset?.is_default ?? false)
                "
                :title="
                  !state.selectedPreset
                    ? 'Select a preset to set as default'
                    : hasUnsavedChanges
                      ? 'Save changes before setting as default'
                      : (state.selectedPreset?.is_default ?? false)
                        ? 'This preset is already the default'
                        : 'Set as default preset'
                "
              >
                ⭐ Set as Default
              </button>

              <!-- Delete - Always visible, disabled when no custom preset selected -->
              <button
                :class="[
                  config.STYLING.BUTTON_BASE,
                  state.selectedPreset && !state.selectedPreset.is_system_preset
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                  'text-xs px-3 py-1',
                ]"
                @click="handleDeletePreset(state, actions)"
                :disabled="
                  !state.selectedPreset || (state.selectedPreset?.is_system_preset ?? true)
                "
                :title="
                  !state.selectedPreset
                    ? 'Select a custom preset to delete'
                    : (state.selectedPreset?.is_system_preset ?? true)
                      ? 'System presets cannot be deleted'
                      : 'Delete this custom preset'
                "
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          <!-- Manual Configuration Mode -->
          <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-3">
              <input
                id="manual-config-checkbox"
                type="checkbox"
                v-model="useManualConfig"
                class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label for="manual-config-checkbox" class="text-sm font-medium text-gray-700">
                Use manual configuration
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-1 ml-7">
              When enabled, changes to ratios below will be saved as manual settings instead of
              updating presets
            </p>
          </div>

          <!-- Manual Settings Section -->
          <div :class="config.STYLING.MANUAL_SETTINGS_SECTION">
            <h4 class="text-base font-semibold text-yellow-800 mb-3">
              {{ config.LABELS.MANUAL_SETTINGS_TITLE }}
            </h4>

            <div :class="config.STYLING.MANUAL_SETTINGS_GRID">
              <!-- Player Payout -->
              <div :class="config.STYLING.FORM_FIELD_CONTAINER">
                <label :class="config.STYLING.FORM_FIELD_LABEL">
                  {{ payoutFormFields.player_payout.label }}
                </label>
                <div :class="config.STYLING.FORM_FIELD_INPUT_CONTAINER">
                  <input
                    :class="config.STYLING.FORM_FIELD_INPUT"
                    type="number"
                    :min="payoutFormFields.player_payout.min"
                    :max="payoutFormFields.player_payout.max"
                    :step="payoutFormFields.player_payout.step"
                    :value="state.currentValues.player_payout"
                    @input="
                      actions.updatePayoutValue(
                        'player_payout',
                        parseFloat(($event.target as HTMLInputElement).value)
                      )
                    "
                    :disabled="!enableManualEditing"
                  />
                  <span :class="config.STYLING.FORM_FIELD_SUFFIX">
                    {{ payoutFormFields.player_payout.suffix }}
                  </span>
                </div>
              </div>

              <!-- Banker Payout -->
              <div :class="config.STYLING.FORM_FIELD_CONTAINER">
                <label :class="config.STYLING.FORM_FIELD_LABEL">
                  {{ payoutFormFields.banker_payout.label }}
                </label>
                <div :class="config.STYLING.FORM_FIELD_INPUT_CONTAINER">
                  <input
                    :class="config.STYLING.FORM_FIELD_INPUT"
                    type="number"
                    :min="payoutFormFields.banker_payout.min"
                    :max="payoutFormFields.banker_payout.max"
                    :step="payoutFormFields.banker_payout.step"
                    :value="state.currentValues.banker_payout"
                    @input="
                      actions.updatePayoutValue(
                        'banker_payout',
                        parseFloat(($event.target as HTMLInputElement).value)
                      )
                    "
                    :disabled="!enableManualEditing"
                  />
                  <span :class="config.STYLING.FORM_FIELD_SUFFIX">
                    {{ payoutFormFields.banker_payout.suffix }}
                  </span>
                </div>
              </div>

              <!-- Banker Commission -->
              <div :class="config.STYLING.FORM_FIELD_CONTAINER">
                <label :class="config.STYLING.FORM_FIELD_LABEL">
                  {{ payoutFormFields.banker_commission.label }}
                </label>
                <div :class="config.STYLING.FORM_FIELD_INPUT_CONTAINER">
                  <input
                    :class="config.STYLING.FORM_FIELD_INPUT"
                    type="number"
                    :min="payoutFormFields.banker_commission.min * 100"
                    :max="payoutFormFields.banker_commission.max * 100"
                    :step="payoutFormFields.banker_commission.step * 100"
                    :value="(state.currentValues.banker_commission * 100).toFixed(1)"
                    @input="
                      actions.updatePayoutValue(
                        'banker_commission',
                        parseFloat(($event.target as HTMLInputElement).value) / 100
                      )
                    "
                    @blur="
                      console.log(
                        '[payout-settings][integration] Commission field blur - ready for betting interface integration'
                      )
                    "
                    :disabled="!enableManualEditing"
                  />
                  <span :class="config.STYLING.FORM_FIELD_SUFFIX">
                    {{ payoutFormFields.banker_commission.suffix }}
                    <span class="ml-1 text-xs text-gray-500">
                      ({{ formatPercentage(state.currentValues.banker_commission) }})
                    </span>
                  </span>
                </div>
              </div>

              <!-- Tie Payout -->
              <div :class="config.STYLING.FORM_FIELD_CONTAINER">
                <label :class="config.STYLING.FORM_FIELD_LABEL">
                  {{ payoutFormFields.tie_payout.label }}
                </label>
                <div :class="config.STYLING.FORM_FIELD_INPUT_CONTAINER">
                  <input
                    :class="config.STYLING.FORM_FIELD_INPUT"
                    type="number"
                    :min="payoutFormFields.tie_payout.min"
                    :max="payoutFormFields.tie_payout.max"
                    :step="payoutFormFields.tie_payout.step"
                    :value="state.currentValues.tie_payout"
                    @input="
                      actions.updatePayoutValue(
                        'tie_payout',
                        parseFloat(($event.target as HTMLInputElement).value)
                      )
                    "
                    :disabled="!enableManualEditing"
                  />
                  <span :class="config.STYLING.FORM_FIELD_SUFFIX">
                    {{ payoutFormFields.tie_payout.suffix }}
                  </span>
                </div>
              </div>

              <!-- Player Pair Payout -->
              <div :class="config.STYLING.FORM_FIELD_CONTAINER">
                <label :class="config.STYLING.FORM_FIELD_LABEL">
                  {{ payoutFormFields.player_pair_payout.label }}
                </label>
                <div :class="config.STYLING.FORM_FIELD_INPUT_CONTAINER">
                  <input
                    :class="config.STYLING.FORM_FIELD_INPUT"
                    type="number"
                    :min="payoutFormFields.player_pair_payout.min"
                    :max="payoutFormFields.player_pair_payout.max"
                    :step="payoutFormFields.player_pair_payout.step"
                    :value="state.currentValues.player_pair_payout"
                    @input="
                      actions.updatePayoutValue(
                        'player_pair_payout',
                        parseFloat(($event.target as HTMLInputElement).value)
                      )
                    "
                    :disabled="!enableManualEditing"
                  />
                  <span :class="config.STYLING.FORM_FIELD_SUFFIX">
                    {{ payoutFormFields.player_pair_payout.suffix }}
                  </span>
                </div>
              </div>

              <!-- Banker Pair Payout -->
              <div :class="config.STYLING.FORM_FIELD_CONTAINER">
                <label :class="config.STYLING.FORM_FIELD_LABEL">
                  {{ payoutFormFields.banker_pair_payout.label }}
                </label>
                <div :class="config.STYLING.FORM_FIELD_INPUT_CONTAINER">
                  <input
                    :class="config.STYLING.FORM_FIELD_INPUT"
                    type="number"
                    :min="payoutFormFields.banker_pair_payout.min"
                    :max="payoutFormFields.banker_pair_payout.max"
                    :step="payoutFormFields.banker_pair_payout.step"
                    :value="state.currentValues.banker_pair_payout"
                    @input="
                      actions.updatePayoutValue(
                        'banker_pair_payout',
                        parseFloat(($event.target as HTMLInputElement).value)
                      )
                    "
                    :disabled="!enableManualEditing"
                  />
                  <span :class="config.STYLING.FORM_FIELD_SUFFIX">
                    {{ payoutFormFields.banker_pair_payout.suffix }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Save Button - Always Visible (Below ratios) -->
          <div class="mt-4">
            <button
              :class="[
                config.STYLING.BUTTON_BASE,
                state.selectedPreset && !state.selectedPreset.is_system_preset && hasUnsavedChanges
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                'px-4 py-2 text-sm',
              ]"
              @click="handleSavePreset(state, actions, hasUnsavedChanges)"
              :disabled="
                !(
                  state.selectedPreset &&
                  !state.selectedPreset.is_system_preset &&
                  hasUnsavedChanges
                )
              "
              :title="getSaveButtonTooltip(state, hasUnsavedChanges)"
            >
              💾 Save Changes to {{ state.selectedPreset?.name || 'Preset' }}
            </button>
            <div class="mt-1 text-xs text-gray-500">
              {{ getSaveButtonHelpText(state, hasUnsavedChanges) }}
            </div>
          </div>

          <!-- Information Panels -->
          <div class="mt-6 space-y-3">
            <!-- Collapsible Payout Examples Panel -->
            <div
              class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg"
            >
              <button
                @click="handleShowExamplesToggle"
                class="w-full flex items-center justify-between p-4 text-left hover:bg-white/50 transition-colors rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-lg">💰</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-green-800">Payout Examples</h3>
                    <p class="text-sm text-green-600">
                      See potential returns for a ${{ state.exampleCalculations.betAmount }} bet
                      <span v-if="state.selectedPreset" class="ml-2 font-medium">
                        ({{ state.selectedPreset.name }} - Commission:
                        {{ formatPercentage(state.currentValues.banker_commission) }})
                      </span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <svg
                    class="w-5 h-5 text-green-600 transform transition-transform duration-200"
                    :class="{ 'rotate-180': showExamples }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <div v-if="showExamples" class="px-4 pb-4">
                <div class="bg-white rounded-lg p-3 border border-green-200">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <!-- Player Win Example -->
                    <div :class="config.STYLING.EXAMPLE_ITEM">
                      <div :class="[config.STYLING.EXAMPLE_LABEL, config.STYLING.PLAYER_COLOR]">
                        Player Win
                      </div>
                      <div :class="config.STYLING.EXAMPLE_RETURN">
                        {{ formatCurrency(state.exampleCalculations.results.player.totalReturn) }}
                        {{ config.LABELS.TOTAL_RETURN_LABEL }}
                      </div>
                      <div :class="config.STYLING.EXAMPLE_PROFIT">
                        +{{ formatCurrency(state.exampleCalculations.results.player.profit) }}
                        {{ config.LABELS.PROFIT_LABEL }}
                      </div>
                    </div>

                    <!-- Banker Win Example -->
                    <div :class="config.STYLING.EXAMPLE_ITEM">
                      <div :class="[config.STYLING.EXAMPLE_LABEL, config.STYLING.BANKER_COLOR]">
                        Banker Win
                      </div>
                      <div :class="config.STYLING.EXAMPLE_RETURN">
                        {{ formatCurrency(state.exampleCalculations.results.banker.totalReturn) }}
                        {{ config.LABELS.TOTAL_RETURN_LABEL }}
                      </div>
                      <div :class="config.STYLING.EXAMPLE_PROFIT">
                        +{{ formatCurrency(state.exampleCalculations.results.banker.profit) }}
                        {{ config.LABELS.PROFIT_LABEL }}
                      </div>
                    </div>

                    <!-- Tie Win Example -->
                    <div :class="config.STYLING.EXAMPLE_ITEM">
                      <div :class="[config.STYLING.EXAMPLE_LABEL, config.STYLING.TIE_COLOR]">
                        Tie Win
                      </div>
                      <div :class="config.STYLING.EXAMPLE_RETURN">
                        {{ formatCurrency(state.exampleCalculations.results.tie.totalReturn) }}
                        {{ config.LABELS.TOTAL_RETURN_LABEL }}
                      </div>
                      <div :class="config.STYLING.EXAMPLE_PROFIT">
                        +{{ formatCurrency(state.exampleCalculations.results.tie.profit) }}
                        {{ config.LABELS.PROFIT_LABEL }}
                      </div>
                    </div>

                    <!-- Player Pair Example -->
                    <div :class="config.STYLING.EXAMPLE_ITEM">
                      <div
                        :class="[config.STYLING.EXAMPLE_LABEL, config.STYLING.PLAYER_PAIR_COLOR]"
                      >
                        Player Pair
                      </div>
                      <div :class="config.STYLING.EXAMPLE_RETURN">
                        {{
                          formatCurrency(state.exampleCalculations.results.playerPair.totalReturn)
                        }}
                        {{ config.LABELS.TOTAL_RETURN_LABEL }}
                      </div>
                      <div :class="config.STYLING.EXAMPLE_PROFIT">
                        +{{ formatCurrency(state.exampleCalculations.results.playerPair.profit) }}
                        {{ config.LABELS.PROFIT_LABEL }}
                      </div>
                    </div>

                    <!-- Banker Pair Example -->
                    <div :class="config.STYLING.EXAMPLE_ITEM">
                      <div
                        :class="[config.STYLING.EXAMPLE_LABEL, config.STYLING.BANKER_PAIR_COLOR]"
                      >
                        Banker Pair
                      </div>
                      <div :class="config.STYLING.EXAMPLE_RETURN">
                        {{
                          formatCurrency(state.exampleCalculations.results.bankerPair.totalReturn)
                        }}
                        {{ config.LABELS.TOTAL_RETURN_LABEL }}
                      </div>
                      <div :class="config.STYLING.EXAMPLE_PROFIT">
                        +{{ formatCurrency(state.exampleCalculations.results.bankerPair.profit) }}
                        {{ config.LABELS.PROFIT_LABEL }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Collapsible Preset Information Panel -->
            <div
              class="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg"
            >
              <button
                @click="showPresetInfo = !showPresetInfo"
                class="w-full flex items-center justify-between p-4 text-left hover:bg-white/50 transition-colors rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div
                      class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <span class="text-white text-lg">📋</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-purple-800">
                      Standard Preset Information
                    </h3>
                    <p class="text-sm text-purple-600">
                      Compare Vegas and Macau style payout structures
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <svg
                    class="w-5 h-5 text-purple-600 transform transition-transform duration-200"
                    :class="{ 'rotate-180': showPresetInfo }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <div v-if="showPresetInfo" class="px-4 pb-4">
                <div class="bg-white rounded-lg p-3 border border-purple-200">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <!-- Vegas Style -->
                    <div class="space-y-2">
                      <div class="font-semibold text-red-700 flex items-center space-x-2">
                        <span>🎰</span>
                        <span>Standard/Vegas Style</span>
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded"
                          >Default</span
                        >
                      </div>
                      <div class="space-y-1 text-xs text-gray-600 pl-6">
                        <div>• Player: <strong>1:1</strong></div>
                        <div>
                          • Banker: <strong>1:1</strong> ({{ formatPercentage(0.05) }} commission)
                        </div>
                        <div>• Tie: <strong>8:1</strong></div>
                        <div>• Player Pair: <strong>11:1</strong></div>
                        <div>• Banker Pair: <strong>11:1</strong></div>
                      </div>
                    </div>

                    <!-- Macau Style -->
                    <div class="space-y-2">
                      <div class="font-semibold text-blue-700 flex items-center space-x-2">
                        <span>🏙️</span>
                        <span>Macau Style</span>
                      </div>
                      <div class="space-y-1 text-xs text-gray-600 pl-6">
                        <div>• Player: <strong>1:1</strong></div>
                        <div>
                          • Banker: <strong>1:1</strong> ({{ formatPercentage(0.025) }} commission)
                        </div>
                        <div>• Tie: <strong>8:1</strong></div>
                        <div>• Player Pair: <strong>11:1</strong></div>
                        <div>• Banker Pair: <strong>11:1</strong></div>
                      </div>
                      <div class="text-xs text-blue-600 italic pl-6">
                        Lower commission = higher banker returns
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Preset Dialog -->
          <div
            v-if="state.showAddPresetDialog"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="actions.hideAddPresetDialog"
          >
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold mb-4">Add Custom Preset</h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"> Preset Name </label>
                  <input
                    v-model="state.newPresetName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g. Wynn Las Vegas"
                    :maxlength="payoutSettingsDefaults.MAX_PRESET_NAME_LENGTH"
                  />
                </div>

                <div class="text-sm text-gray-600">
                  This will save the current payout settings as a new preset.
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button
                  :class="[config.STYLING.BUTTON_BASE, config.STYLING.CANCEL_BUTTON]"
                  @click="actions.hideAddPresetDialog"
                >
                  {{ config.LABELS.CANCEL_BUTTON }}
                </button>

                <button
                  :class="[config.STYLING.BUTTON_BASE, config.STYLING.SAVE_BUTTON]"
                  @click="actions.createPreset(state.newPresetName)"
                  :disabled="!state.newPresetName.trim() || state.isSavingPreset"
                >
                  {{ state.isSavingPreset ? 'Saving...' : config.LABELS.SAVE_PRESET_BUTTON }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PayoutSettings>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { PayoutSettings } from '@/design-system/primitives/PayoutSettings';
import {
  PAYOUT_SETTINGS,
  PAYOUT_FORM_FIELDS,
  PAYOUT_SETTINGS_DEFAULTS,
  PAYOUT_UTILS,
} from '@/config/payoutSettings';
import type { PayoutValues, PayoutChangeEvent, ValidationError } from '@/config/payoutSettings';
import type { PayoutPreset } from '@/services/payoutPresetService';

// =============================================================================
// PROPS & EMITS
// =============================================================================

interface PayoutSettingsSectionProps {
  // Initial payout values
  initialPayoutValues?: Partial<PayoutValues>;

  // Selected preset ID (if any)
  selectedPresetId?: string | null;

  // Control whether preset management is available
  enablePresetManagement?: boolean;

  // Control whether manual editing is allowed
  enableManualEditing?: boolean;

  // Show/hide info panels
  showPayoutExamples?: boolean;
  showPresetInfo?: boolean;

  // Example bet amount for calculations
  exampleBetAmount?: number;

  // Loading states for async operations
  presetsLoading?: boolean;
  savingPreset?: boolean;

  // Error states
  validationErrors?: ValidationError[];
  presetError?: string | null;
}

interface PayoutSettingsSectionEmits {
  // Payout value changes
  'payout-change': [event: PayoutChangeEvent];
  'manual-value-change': [field: keyof PayoutValues, value: number];

  // Manual config mode changes
  'manual-config-changed': [useManualConfig: boolean];

  // Preset management events
  'preset-selected': [preset: PayoutPreset];
  'preset-created': [presetData: { name: string; values: PayoutValues }];
  'preset-updated': [presetId: string, updates: Partial<PayoutValues>];
  'preset-deleted': [presetId: string];
  'default-preset-changed': [presetId: string];

  // User actions
  'reset-to-defaults': [];

  // Validation events
  'validation-error': [errors: ValidationError[]];
  'validation-success': [];
}

const props = withDefaults(defineProps<PayoutSettingsSectionProps>(), {
  enablePresetManagement: true,
  enableManualEditing: true,
  showPayoutExamples: true,
  showPresetInfo: true,
  exampleBetAmount: PAYOUT_SETTINGS_DEFAULTS.EXAMPLE_BET_AMOUNT,
  presetsLoading: false,
  savingPreset: false,
  validationErrors: () => [],
  presetError: null,
});

const emit = defineEmits<PayoutSettingsSectionEmits>();

// =============================================================================
// STORES & COMPOSABLES
// =============================================================================

const { success, error: showError } = useNotifications();

// =============================================================================
// LOCAL STATE
// =============================================================================

// Controls visibility of the collapsible panels
const showExamples = ref(false);
const showPresetInfo = ref(false);

// Manual configuration mode
const useManualConfig = ref(false);

// Simple initialization flag for watcher
const isInitialized = ref(false);

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

// Determines if the save button should be enabled
const canSaveCustomPreset = computed(() => {
  // For now, return false since we need access to state from the template
  // This will be properly computed in the template where we have access to state and hasUnsavedChanges
  return false;
});

// Returns tooltip text for save button based on current state
const getSaveButtonTooltip = (state: any, hasUnsavedChanges: boolean): string => {
  if (!state.selectedPreset) {
    return 'Select a custom preset to save changes';
  }
  if (state.selectedPreset.is_system_preset) {
    return 'System presets cannot be modified - create a custom preset instead';
  }
  if (!hasUnsavedChanges) {
    return 'No changes to save';
  }
  return 'Save changes to the selected custom preset';
};

// Returns help text below save button
const getSaveButtonHelpText = (state: any, hasUnsavedChanges: boolean): string => {
  if (!state.selectedPreset) {
    return 'Select a custom preset to save changes • For custom presets only';
  }
  if (state.selectedPreset.is_system_preset) {
    return 'System presets cannot be modified • For custom presets only';
  }
  if (!hasUnsavedChanges) {
    return 'No unsaved changes • For custom presets only';
  }
  return `Click to save changes to "${state.selectedPreset.name}" • For custom presets only`;
};

// =============================================================================
// CONFIGURATION AND UTILITY ACCESS
// =============================================================================

const config = PAYOUT_SETTINGS;
const payoutFormFields = PAYOUT_FORM_FIELDS;
const payoutSettingsDefaults = PAYOUT_SETTINGS_DEFAULTS;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number): string => {
  return PAYOUT_UTILS.formatCurrency(amount);
};

const formatPercentage = (decimal: number): string => {
  return PAYOUT_UTILS.formatPercentage(decimal);
};

// Safe handler for setting default preset
const handleSetDefaultPreset = (state: any, actions: any, hasUnsavedChanges: boolean): void => {
  if (state.selectedPreset && !hasUnsavedChanges && !state.selectedPreset.is_default) {
    actions.setDefaultPreset(state.selectedPreset.id);
  }
};

// Safe handler for deleting preset
const handleDeletePreset = (state: any, actions: any): void => {
  if (state.selectedPreset && !state.selectedPreset.is_system_preset) {
    actions.deletePreset(state.selectedPreset.id);
  }
};

// Safe handler for saving preset changes
const handleSavePreset = async (
  state: any,
  actions: any,
  hasUnsavedChanges: boolean
): Promise<void> => {
  if (state.selectedPreset && !state.selectedPreset.is_system_preset && hasUnsavedChanges) {
    try {
      // Update the existing custom preset with current values
      await actions.updatePreset(state.selectedPreset.id, state.currentValues);

      // Show success toast
      success(`Saved changes to ${state.selectedPreset.name}!`);

      // Emit success event that will trigger additional handling in parent if needed
      emit('preset-updated', state.selectedPreset.id, state.currentValues);

      console.log('[payout-settings-section][save] Custom preset updated successfully', {
        presetId: state.selectedPreset.id,
        presetName: state.selectedPreset.name,
      });
    } catch (error) {
      console.error('[payout-settings-section][error] Failed to save preset', { error });

      // Show error toast
      showError(
        `Failed to save preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
};

// =============================================================================
// MANUAL EDITING HANDLER
// =============================================================================

const handleManualEdit = (field: keyof PayoutValues, value: number): void => {
  // Emit the value change to the PayoutSettings primitive
  emit('manual-value-change', field, value);

  console.log('[payout-settings-section][manual-edit] Value changed', {
    field,
    value,
    mode: useManualConfig.value ? 'Manual Configuration' : 'Preset Mode',
    preservingMode: true,
  });
};

// =============================================================================
// VALIDATION AND NOTIFICATION HANDLERS
// =============================================================================

const validateAndNotify = (field: keyof PayoutValues): void => {
  // This function will be called from template where state and handlers are available
  console.log('[payout-settings-section][validation] Field validated', {
    field,
    enableManualEditing: props.enableManualEditing,
  });
};

// Enhanced props usage for professional algorithm integration
const getEffectiveExampleAmount = (): number => {
  // Use props to determine example amount based on current session or betting configuration
  return props.exampleBetAmount || payoutSettingsDefaults.EXAMPLE_BET_AMOUNT;
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handlePayoutChange = (event: PayoutChangeEvent): void => {
  emit('payout-change', event);

  console.log('[payout-settings-section][event] Payout values changed', {
    source: event.source,
    presetId: event.presetId,
    presetName: event.presetName,
  });
};

const handleManualValueChange = (field: keyof PayoutValues, value: number): void => {
  emit('manual-value-change', field, value);

  console.log('[payout-settings-section][event] Manual value changed', {
    field,
    value,
  });
};

const handlePresetSelected = (preset: PayoutPreset): void => {
  emit('preset-selected', preset);

  console.log('[payout-settings-section][event] Preset selected', {
    presetId: preset.id,
    presetName: preset.name,
  });
};

const handlePresetCreated = (presetData: { name: string; values: PayoutValues }): void => {
  emit('preset-created', presetData);

  console.log('[payout-settings-section][event] Preset created', {
    name: presetData.name,
  });
};

const handlePresetUpdated = (presetId: string, updates: Partial<PayoutValues>): void => {
  emit('preset-updated', presetId, updates);

  console.log('[payout-settings-section][event] Preset updated', {
    presetId,
    updates,
  });
};

const handlePresetDeleted = (presetId: string): void => {
  emit('preset-deleted', presetId);

  console.log('[payout-settings-section][event] Preset deleted', {
    presetId,
  });
};

const handleDefaultPresetChanged = (presetId: string): void => {
  emit('default-preset-changed', presetId);

  console.log('[payout-settings-section][event] Default preset changed', {
    presetId,
  });
};

const handleResetToDefaults = (): void => {
  emit('reset-to-defaults');

  console.log('[payout-settings-section][event] Reset to defaults');
};

const handleValidationError = (errors: ValidationError[]): void => {
  emit('validation-error', errors);

  console.log('[payout-settings-section][event] Validation errors', {
    errorCount: errors.length,
    fields: errors.map(e => e.field),
  });
};

const handleValidationSuccess = (): void => {
  emit('validation-success');

  console.log('[payout-settings-section][event] Validation success');
};

console.log('[payout-settings-section][initialization] PayoutSettingsSection initialized');

// Add a watch for useManualConfig to emit the manual-config-changed event
watch(useManualConfig, (newValue: boolean) => {
  // Only emit if component is initialized to prevent initial load loops
  if (!isInitialized.value) {
    console.log(
      '[payout-settings-section][watch] Skipping manual config emit during initialization',
      {
        newValue,
      }
    );
    return;
  }

  console.log('[payout-settings-section][watch] Manual config mode changed', {
    newValue,
    mode: newValue ? 'Manual Configuration' : 'Preset Mode',
  });
  emit('manual-config-changed', newValue);
});

// Mark as initialized after a short delay to allow all initial props to settle
setTimeout(() => {
  isInitialized.value = true;
  console.log('[payout-settings-section][lifecycle] Component initialization complete');
}, 500);

// New function to handle examples toggle
const handleShowExamplesToggle = () => {
  console.log('[payout-settings-section][event] Payout examples toggle clicked');
  showExamples.value = !showExamples.value;
};
</script>
