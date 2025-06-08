<template>
  <div class="cdd-history-view">
    <!-- History Controls -->
    <div class="mb-8">
      <div class="cdd-card">
        <div class="cdd-card-header">
          <h3 class="text-lg font-semibold text-gray-900">History Filters</h3>
        </div>
        <div class="cdd-card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CDDButton variant="primary">All Sessions</CDDButton>
            <CDDButton variant="secondary">Last 7 Days</CDDButton>
            <CDDButton variant="secondary">Last 30 Days</CDDButton>
            <CDDButton variant="ghost">Export Data</CDDButton>
          </div>
        </div>
      </div>
    </div>

    <!-- History Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Session List -->
      <div class="cdd-card-elevated">
        <div class="cdd-card-header">
          <h3 class="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        </div>
        <div class="cdd-card-body">
          <div class="space-y-4">
            <!-- Sample Session Entry -->
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Session #1234</h4>
                  <p class="text-sm text-gray-600">December 15, 2024 - 2:30 PM</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold text-green-600">+$150</div>
                  <div class="text-sm text-gray-500">45 hands</div>
                </div>
              </div>
            </div>

            <!-- Another Sample -->
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Session #1233</h4>
                  <p class="text-sm text-gray-600">December 14, 2024 - 7:15 PM</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold text-red-600">-$75</div>
                  <div class="text-sm text-gray-500">32 hands</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Panel -->
      <div class="cdd-card-elevated">
        <div class="cdd-card-header">
          <h3 class="text-lg font-semibold text-gray-900">Performance Overview</h3>
        </div>
        <div class="cdd-card-body">
          <div class="space-y-6">
            <!-- Total Stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">+$425</div>
                <div class="text-sm text-gray-600">Total Profit</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">156</div>
                <div class="text-sm text-gray-600">Total Hands</div>
              </div>
            </div>

            <!-- Win Rate -->
            <div class="text-center">
              <div class="text-lg font-semibold text-purple-600">68.5%</div>
              <div class="text-sm text-gray-600">Win Rate</div>
            </div>

            <!-- Chart Placeholder -->
            <div class="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
              <span class="text-gray-500">Performance Chart Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CDDButton from '../../components/ui/CDDButton.vue';
</script>
