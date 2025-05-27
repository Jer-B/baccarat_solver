<template>
  <div class="toast-demo p-6 bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Toast Notifications Demo</h2>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <button
        @click="showSuccess"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
      >
        Success Toast
      </button>

      <button
        @click="showError"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
      >
        Error Toast
      </button>

      <button
        @click="showWarning"
        class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors"
      >
        Warning Toast
      </button>

      <button
        @click="showInfo"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        Info Toast
      </button>
    </div>

    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Domain-Specific Notifications</h3>

      <div class="grid grid-cols-2 gap-4">
        <button
          @click="showAnalysisComplete"
          class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
        >
          Analysis Complete
        </button>

        <button
          @click="showKellyCalculation"
          class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors"
        >
          Kelly Calculation
        </button>

        <button
          @click="showRiskWarning"
          class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Risk Warning
        </button>

        <button
          @click="showSessionSaved"
          class="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-colors"
        >
          Session Saved
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications';

const notifications = useNotifications();

// Basic toast methods
const showSuccess = () => {
  notifications.success('Operation completed successfully!');
};

const showError = () => {
  notifications.error('Something went wrong!');
};

const showWarning = () => {
  notifications.warning('Please check your input');
};

const showInfo = () => {
  notifications.info('Here is some useful information');
};

// Domain-specific notifications
const showAnalysisComplete = () => {
  notifications.burnAnalysisComplete('Jacobson', 0.85);
};

const showKellyCalculation = () => {
  notifications.kellyCalculation(0.125, 0.023);
};

const showRiskWarning = () => {
  notifications.riskWarning(0.15, 0.1);
};

const showSessionSaved = () => {
  notifications.sessionSaved('session-123');
};
</script>
