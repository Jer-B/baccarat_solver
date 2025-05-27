<template>
  <div class="bg-white border rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Global Analytics</h3>

    <!-- Analytics Grid -->
    <div v-if="sessions.length > 0" class="space-y-6">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-sm font-medium text-blue-600">Total Sessions</div>
          <div class="text-2xl font-bold text-blue-900">{{ analytics.totalSessions }}</div>
        </div>

        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-sm font-medium text-green-600">Total Hands</div>
          <div class="text-2xl font-bold text-green-900">{{ analytics.totalHands }}</div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-sm font-medium text-purple-600">Completed Sessions</div>
          <div class="text-2xl font-bold text-purple-900">{{ analytics.completedSessions }}</div>
        </div>

        <div class="bg-orange-50 rounded-lg p-4">
          <div class="text-sm font-medium text-orange-600">Active Sessions</div>
          <div class="text-2xl font-bold text-orange-900">{{ analytics.activeSessions }}</div>
        </div>
      </div>

      <!-- Duration and Performance -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-indigo-50 rounded-lg p-4">
          <div class="text-sm font-medium text-indigo-600">Average Session Duration</div>
          <div class="text-xl font-bold text-indigo-900">
            {{ formatDuration(analytics.averageDurationSeconds) }}
          </div>
        </div>

        <div class="bg-teal-50 rounded-lg p-4">
          <div class="text-sm font-medium text-teal-600">Average Hands per Session</div>
          <div class="text-xl font-bold text-teal-900">{{ analytics.averageHandsPerSession }}</div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4">
          <div class="text-sm font-medium text-yellow-600">Total Playing Time</div>
          <div class="text-xl font-bold text-yellow-900">
            {{ formatDuration(analytics.totalPlayingTime) }}
          </div>
        </div>
      </div>

      <!-- Session Breakdown -->
      <div class="border-t pt-6">
        <h4 class="text-md font-semibold text-gray-800 mb-4">Session Breakdown</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Session Status Chart -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Session Status</h5>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Completed</span>
                <div class="flex items-center space-x-2">
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-500 h-2 rounded-full"
                      :style="{
                        width: `${(analytics.completedSessions / analytics.totalSessions) * 100}%`,
                      }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{
                    analytics.completedSessions
                  }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Active</span>
                <div class="flex items-center space-x-2">
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-orange-500 h-2 rounded-full"
                      :style="{
                        width: `${(analytics.activeSessions / analytics.totalSessions) * 100}%`,
                      }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{
                    analytics.activeSessions
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="text-sm font-medium text-gray-700 mb-3">Recent Activity</h5>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Last Session</span>
                <span class="text-sm font-medium text-gray-900">{{
                  analytics.lastSessionDate
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Longest Session</span>
                <span class="text-sm font-medium text-gray-900">{{
                  formatDuration(analytics.longestSessionDuration)
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Most Hands</span>
                <span class="text-sm font-medium text-gray-900">{{
                  analytics.mostHandsInSession
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="border-t pt-6">
        <h4 class="text-md font-semibold text-gray-800 mb-4">Performance Insights</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-emerald-50 rounded-lg p-4">
            <div class="text-sm font-medium text-emerald-600">Average Hands per Hour</div>
            <div class="text-lg font-bold text-emerald-900">
              {{ analytics.averageHandsPerHour }}
            </div>
          </div>

          <div class="bg-cyan-50 rounded-lg p-4">
            <div class="text-sm font-medium text-cyan-600">Session Completion Rate</div>
            <div class="text-lg font-bold text-cyan-900">{{ analytics.completionRate }}%</div>
          </div>

          <div class="bg-rose-50 rounded-lg p-4">
            <div class="text-sm font-medium text-rose-600">Average Session Efficiency</div>
            <div class="text-lg font-bold text-rose-900">{{ analytics.averageEfficiency }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <svg
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        ></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No analytics available</h3>
      <p class="text-gray-600">Complete some gaming sessions to see analytics here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserSession } from '../../services/sessionService';

interface Props {
  sessions: UserSession[];
}

const props = defineProps<Props>();

const analytics = computed(() => {
  console.log('[session-tracking][calculation] Calculating global analytics', {
    sessionCount: props.sessions.length,
  });

  if (props.sessions.length === 0) {
    return {
      totalSessions: 0,
      totalHands: 0,
      completedSessions: 0,
      activeSessions: 0,
      averageDurationSeconds: 0,
      averageHandsPerSession: 0,
      totalPlayingTime: 0,
      lastSessionDate: 'N/A',
      longestSessionDuration: 0,
      mostHandsInSession: 0,
      averageHandsPerHour: 0,
      completionRate: 0,
      averageEfficiency: 0,
    };
  }

  const completedSessions = props.sessions.filter(
    s => s.status === 'completed' && s.duration_seconds
  );
  const activeSessions = props.sessions.filter(s => s.status === 'active');

  const totalHands = props.sessions.reduce((sum, s) => sum + (s.total_hands || 0), 0);
  const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const averageDuration =
    completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;
  const averageHandsPerSession = props.sessions.length > 0 ? totalHands / props.sessions.length : 0;

  // Find longest session and most hands
  const longestSession = completedSessions.reduce(
    (longest, current) =>
      (current.duration_seconds || 0) > (longest.duration_seconds || 0) ? current : longest,
    completedSessions[0] || { duration_seconds: 0 }
  );

  const sessionWithMostHands = props.sessions.reduce(
    (most, current) => (current.total_hands > most.total_hands ? current : most),
    props.sessions[0] || { total_hands: 0 }
  );

  // Calculate hands per hour
  const totalHours = totalDuration / 3600;
  const averageHandsPerHour = totalHours > 0 ? totalHands / totalHours : 0;

  // Calculate completion rate
  const completionRate =
    props.sessions.length > 0 ? (completedSessions.length / props.sessions.length) * 100 : 0;

  // Calculate average efficiency (assuming 30 seconds per hand is optimal)
  const averageEfficiency =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => {
          if (!session.duration_seconds || session.total_hands === 0) {
            return sum;
          }
          const optimalDuration = session.total_hands * 30;
          const efficiency = Math.min(100, (optimalDuration / session.duration_seconds) * 100);
          return sum + efficiency;
        }, 0) / completedSessions.length
      : 0;

  // Get last session date
  const sortedSessions = [...props.sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const lastSessionDate =
    sortedSessions.length > 0 ? new Date(sortedSessions[0].created_at).toLocaleDateString() : 'N/A';

  const result = {
    totalSessions: props.sessions.length,
    totalHands,
    completedSessions: completedSessions.length,
    activeSessions: activeSessions.length,
    averageDurationSeconds: averageDuration,
    averageHandsPerSession: Math.round(averageHandsPerSession * 10) / 10,
    totalPlayingTime: totalDuration,
    lastSessionDate,
    longestSessionDuration: longestSession.duration_seconds || 0,
    mostHandsInSession: sessionWithMostHands.total_hands,
    averageHandsPerHour: Math.round(averageHandsPerHour * 10) / 10,
    completionRate: Math.round(completionRate * 10) / 10,
    averageEfficiency: Math.round(averageEfficiency * 10) / 10,
  };

  console.log('[session-tracking][calculation] Global analytics calculated', result);
  return result;
});

const formatDuration = (seconds: number): string => {
  if (seconds === 0) {
    return 'N/A';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};
</script>
