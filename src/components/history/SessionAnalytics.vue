<template>
  <div class="bg-white border rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Session Analytics</h3>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="text-gray-600 mt-2 text-sm">Loading session details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-500 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span class="text-red-800 text-sm">{{ error }}</span>
      </div>
    </div>

    <!-- Session Details -->
    <div v-else-if="session" class="space-y-6">
      <!-- Session Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-indigo-50 rounded-lg p-4">
          <div class="text-sm font-medium text-indigo-600">Session Name</div>
          <div class="text-lg font-semibold text-indigo-900">{{ session.session_name }}</div>
        </div>

        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-sm font-medium text-green-600">Total Hands</div>
          <div class="text-lg font-semibold text-green-900">{{ session.total_hands }}</div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-sm font-medium text-blue-600">Duration</div>
          <div class="text-lg font-semibold text-blue-900">
            {{
              session.duration_seconds ? formatDuration(session.duration_seconds) : 'In Progress'
            }}
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-sm font-medium text-purple-600">Status</div>
          <div class="text-lg font-semibold text-purple-900 capitalize">{{ session.status }}</div>
        </div>
      </div>

      <!-- Time Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm font-medium text-gray-600">Started At</div>
          <div class="text-base font-semibold text-gray-900">
            {{ formatDateTime(session.started_at) }}
          </div>
        </div>

        <div v-if="session.ended_at" class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm font-medium text-gray-600">Ended At</div>
          <div class="text-base font-semibold text-gray-900">
            {{ formatDateTime(session.ended_at) }}
          </div>
        </div>
      </div>

      <!-- Calculated Analytics -->
      <div v-if="session.total_hands > 0" class="border-t pt-6">
        <h4 class="text-md font-semibold text-gray-800 mb-4">Performance Metrics</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-yellow-50 rounded-lg p-4">
            <div class="text-sm font-medium text-yellow-600">Hands per Hour</div>
            <div class="text-lg font-semibold text-yellow-900">
              {{ calculateHandsPerHour() }}
            </div>
          </div>

          <div class="bg-orange-50 rounded-lg p-4">
            <div class="text-sm font-medium text-orange-600">Average Hand Duration</div>
            <div class="text-lg font-semibold text-orange-900">
              {{ calculateAverageHandDuration() }}
            </div>
          </div>

          <div class="bg-teal-50 rounded-lg p-4">
            <div class="text-sm font-medium text-teal-600">Session Efficiency</div>
            <div class="text-lg font-semibold text-teal-900">
              {{ calculateSessionEfficiency() }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Session Notes (placeholder for future enhancement) -->
      <div class="border-t pt-6">
        <h4 class="text-md font-semibold text-gray-800 mb-2">Session Details</h4>
        <div class="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <p><strong>Session ID:</strong> {{ session.id }}</p>
          <p><strong>Created:</strong> {{ formatDateTime(session.created_at) }}</p>
          <p><strong>Last Updated:</strong> {{ formatDateTime(session.updated_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { sessionService, type UserSession } from '../../services/sessionService';

interface Props {
  sessionId: string;
}

const props = defineProps<Props>();

const session = ref<UserSession | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const loadSession = async () => {
  console.log('[session-tracking][persistence] Loading session details', {
    sessionId: props.sessionId,
  });
  loading.value = true;
  error.value = null;

  try {
    session.value = await sessionService.getSession(props.sessionId);
    if (!session.value) {
      error.value = 'Session not found';
    } else {
      console.log('[session-tracking][persistence] Session details loaded', {
        sessionId: props.sessionId,
      });
    }
  } catch (err) {
    console.error('[session-tracking][error] Failed to load session details', {
      error: err,
      sessionId: props.sessionId,
    });
    error.value = err instanceof Error ? err.message : 'Failed to load session details';
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const calculateHandsPerHour = (): string => {
  if (!session.value?.duration_seconds || session.value.duration_seconds === 0) {
    return 'N/A';
  }

  const hours = session.value.duration_seconds / 3600;
  const handsPerHour = session.value.total_hands / hours;
  return handsPerHour.toFixed(1);
};

const calculateAverageHandDuration = (): string => {
  if (!session.value?.duration_seconds || session.value.total_hands === 0) {
    return 'N/A';
  }

  const avgSeconds = session.value.duration_seconds / session.value.total_hands;
  return `${avgSeconds.toFixed(1)}s`;
};

const calculateSessionEfficiency = (): string => {
  if (!session.value?.duration_seconds || session.value.total_hands === 0) {
    return 'N/A';
  }

  // Assume optimal hand duration is 30 seconds
  const optimalDuration = session.value.total_hands * 30;
  const efficiency = (optimalDuration / session.value.duration_seconds) * 100;
  return Math.min(100, efficiency).toFixed(1);
};

// Watch for session ID changes
watch(
  () => props.sessionId,
  () => {
    if (props.sessionId) {
      loadSession();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.sessionId) {
    loadSession();
  }
});
</script>
