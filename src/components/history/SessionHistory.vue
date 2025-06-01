<template>
  <div
    class="space-y-6"
    @dragover.prevent="handleGlobalDragOver"
    @dragleave.prevent="handleGlobalDragLeave"
    @drop.prevent="handleFileDrop"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">Session History</h2>
      <div class="flex items-center space-x-3">
        <!-- Export Dropdown -->
        <div class="relative">
          <button
            @click.stop="toggleMainExportDropdown"
            :disabled="loading || sessions.length === 0"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            title="Export all sessions"
          >
            <span>📥 Export All</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          <!-- Export Dropdown Menu -->
          <div
            v-if="showExportDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
            @click.stop
          >
            <button
              @click="exportAllSessions('json')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center space-x-2"
            >
              <span>📄</span>
              <span>Export as JSON</span>
            </button>
            <button
              @click="exportAllSessions('csv')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Export as CSV</span>
            </button>
          </div>
        </div>

        <!-- Import Button -->
        <button
          @click="triggerImport"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Import sessions from JSON or CSV file"
        >
          📤 Import
        </button>

        <!-- Delete All Button -->
        <button
          @click="confirmDeleteAll"
          :disabled="loading || sessions.length === 0"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Delete all sessions permanently"
        >
          🗑️ Delete All
        </button>

        <!-- Refresh Button -->
        <button
          @click="refreshSessions"
          :disabled="loading"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".json,.csv"
      multiple
      @change="handleFileImport"
      class="hidden"
    />

    <!-- Drag and Drop Zone -->
    <div
      v-if="isDragOver"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @dragover.prevent
      @drop.prevent="handleFileDrop"
      @dragleave="isDragOver = false"
    >
      <div class="bg-white rounded-lg p-8 border-4 border-dashed border-blue-500 text-center">
        <svg
          class="w-16 h-16 text-blue-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">
          Drop JSON or CSV file to import sessions
        </h3>
        <p class="text-gray-600">Release to import session data</p>
      </div>
    </div>

    <!-- Delete All Confirmation Dialog -->
    <div
      v-if="showDeleteAllDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteAllDialog = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex items-center mb-4">
          <svg
            class="w-8 h-8 text-red-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-800">Delete All Sessions</h3>
        </div>

        <div class="mb-6">
          <p class="text-gray-600 mb-3">
            ⚠️ <strong>Warning:</strong> This action will permanently delete all
            {{ sessions.length }} sessions and cannot be undone.
          </p>
          <p class="text-gray-600 mb-4">
            Would you like to export your sessions before deleting them?
          </p>
        </div>

        <div class="flex flex-col space-y-3">
          <!-- Export and Delete -->
          <button
            @click="exportBeforeDelete"
            :disabled="deletingAll"
            class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ deletingAll ? 'Exporting...' : '📥 Export First, Then Delete' }}
          </button>

          <!-- Delete Without Export -->
          <button
            @click="deleteAllSessions"
            :disabled="deletingAll"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ deletingAll ? 'Deleting...' : '🗑️ Delete All (No Export)' }}
          </button>

          <!-- Cancel -->
          <button
            @click="showDeleteAllDialog = false"
            :disabled="deletingAll"
            class="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Export Completed Confirmation Dialog -->
    <div
      v-if="showExportedConfirmDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showExportedConfirmDialog = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex items-center mb-4">
          <svg
            class="w-8 h-8 text-green-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-800">Export Completed</h3>
        </div>

        <div class="mb-6">
          <p class="text-gray-600 mb-3">✅ Your sessions have been exported successfully.</p>
          <p class="text-gray-600 mb-4">
            <strong
              >Are you sure you want to proceed with deleting all
              {{ sessions.length }} sessions?</strong
            >
          </p>
          <p class="text-red-600 text-sm">This action cannot be undone.</p>
        </div>

        <div class="flex flex-col space-y-3">
          <!-- Confirm Delete -->
          <button
            @click="confirmDeleteAfterExport"
            :disabled="deletingAll"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ deletingAll ? 'Deleting...' : '🗑️ Yes, Delete All Sessions' }}
          </button>

          <!-- Cancel -->
          <button
            @click="cancelDeleteAfterExport"
            :disabled="deletingAll"
            class="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel (Keep Sessions)
          </button>
        </div>
      </div>
    </div>

    <!-- Import File Selection Dialog -->
    <div
      v-if="showImportDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showImportDialog = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <svg
              class="w-8 h-8 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800">Import Sessions</h3>
          </div>
          <button
            @click="showImportDialog = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- File Selection Area -->
        <div class="mb-6">
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            @click="triggerFileSelection"
            @dragover.prevent="handleDialogDragOver"
            @dragleave.prevent="handleDialogDragLeave"
            @drop.prevent="handleDialogDrop"
            :class="{ 'border-blue-400 bg-blue-50': isDragOverDialog }"
          >
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <h4 class="text-lg font-medium text-gray-800 mb-2">Select Files to Import</h4>
            <p class="text-gray-600 mb-4">Click here or drag and drop JSON/CSV files</p>
            <button
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose Files
            </button>
          </div>
        </div>

        <!-- Selected Files List -->
        <div v-if="selectedFiles.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-md font-semibold text-gray-800">
              Selected Files ({{ selectedFiles.length }})
            </h4>
            <button
              @click="clearSelectedFiles"
              class="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="(file, index) in selectedFiles"
              :key="`${file.name}-${file.size}-${index}`"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ file.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ formatFileSize(file.size) }} • {{ getFileTypeLabel(file) }}
                  </div>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Remove file"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            @click="importSelectedFiles"
            :disabled="selectedFiles.length === 0 || importingFiles"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{
              importingFiles
                ? 'Importing...'
                : `Import ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
            }}
          </button>
          <button
            @click="showImportDialog = false"
            :disabled="importingFiles"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="text-gray-600 mt-2">Loading sessions...</p>
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
        <span class="text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Sessions List -->
    <div v-else-if="sessions.length > 0" class="space-y-4">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        :class="{ 'ring-2 ring-indigo-500': selectedSessionId === session.id }"
        @click="selectSession(session.id)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <!-- Editable Session Name -->
              <div v-if="editingSessionId === session.id" class="flex items-center space-x-2">
                <input
                  v-model="editingSessionName"
                  @keyup.enter="saveSessionName(session.id)"
                  @keyup.escape="cancelEditSessionName"
                  @blur="saveSessionName(session.id)"
                  class="text-lg font-semibold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  ref="editInput"
                />
                <button
                  @click.stop="saveSessionName(session.id)"
                  class="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Save"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </button>
                <button
                  @click.stop="cancelEditSessionName"
                  class="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Cancel"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <!-- Display Session Name -->
              <div v-else class="flex items-center space-x-2">
                <h3 class="text-lg font-semibold text-gray-800">{{ session.session_name }}</h3>
                <button
                  @click.stop="startEditSessionName(session.id, session.session_name)"
                  class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                  title="Edit session name"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
              </div>

              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  session.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                "
              >
                {{ session.status }}
              </span>
            </div>

            <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">Started:</span>
                {{ formatDateTime(session.started_at) }}
              </div>
              <div v-if="session.ended_at">
                <span class="font-medium">Ended:</span>
                {{ formatDateTime(session.ended_at) }}
              </div>
              <div v-if="session.duration_seconds">
                <span class="font-medium">Duration:</span>
                {{ formatDuration(session.duration_seconds) }}
              </div>
              <div>
                <span class="font-medium">Hands:</span>
                {{ session.total_hands }}
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">ID: {{ session.id.slice(0, 8) }}...</span>

            <!-- Export Session Dropdown -->
            <div class="relative">
              <button
                @click.stop="toggleSessionExportDropdown(session.id)"
                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Export this session"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </button>

              <!-- Session Export Dropdown Menu -->
              <div
                v-if="sessionExportDropdowns[session.id]"
                class="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border z-20"
                @click.stop
              >
                <button
                  @click="exportSingleSession(session, 'json')"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center space-x-2"
                >
                  <span>📄</span>
                  <span>JSON</span>
                </button>
                <button
                  @click="exportSingleSession(session, 'csv')"
                  class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <!-- Delete Session Button -->
            <button
              @click.stop="deleteSession(session.id)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete session"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
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
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        ></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No sessions recorded</h3>
      <p class="text-gray-600">Start a gaming session to see it appear here.</p>
    </div>

    <!-- Session Details -->
    <div v-if="selectedSessionId" class="mt-8">
      <div class="bg-white border rounded-lg p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Session Details</h3>
        </div>

        <div v-if="selectedSession" class="space-y-4">
          <!-- Session Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Session Name</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ selectedSession.session_name }}
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Status</div>
              <div class="flex items-center mt-1">
                <span
                  class="px-2 py-1 text-sm font-medium rounded-full"
                  :class="
                    selectedSession.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ selectedSession.status }}
                </span>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Total Hands</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ selectedSession.total_hands }}
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Started</div>
              <div class="text-sm text-gray-900">
                {{ formatDateTime(selectedSession.started_at) }}
              </div>
            </div>

            <div v-if="selectedSession.ended_at" class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Ended</div>
              <div class="text-sm text-gray-900">
                {{ formatDateTime(selectedSession.ended_at) }}
              </div>
            </div>

            <div v-if="selectedSession.duration_seconds" class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Duration</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatDuration(selectedSession.duration_seconds) }}
              </div>
            </div>

            <div v-if="selectedSession.cards_remaining !== null" class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Cards Remaining</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ selectedSession.cards_remaining }}
              </div>
            </div>

            <div v-if="selectedSession.start_balance !== null" class="bg-green-50 rounded-lg p-3">
              <div class="text-sm font-medium text-green-600">Start Balance</div>
              <div class="text-lg font-semibold text-green-900">
                ${{ selectedSession.start_balance.toFixed(2) }}
              </div>
            </div>

            <div v-if="selectedSession.end_balance !== null" class="bg-blue-50 rounded-lg p-3">
              <div class="text-sm font-medium text-blue-600">End Balance</div>
              <div class="text-lg font-semibold text-blue-900">
                ${{ selectedSession.end_balance.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Session ID -->
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="text-sm font-medium text-blue-600">Session ID</div>
            <div class="text-sm font-mono text-blue-900 break-all">{{ selectedSession.id }}</div>
          </div>

          <!-- Timestamps -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Created</div>
              <div class="text-sm text-gray-900">
                {{ formatDateTime(selectedSession.created_at) }}
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-sm font-medium text-gray-600">Last Updated</div>
              <div class="text-sm text-gray-900">
                {{ formatDateTime(selectedSession.updated_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Analytics -->
    <div class="mt-8">
      <div class="bg-white border rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Global Analytics</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Total Sessions:</span>
            <span class="ml-2 text-gray-800">{{ sessions.length }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Completed:</span>
            <span class="ml-2 text-gray-800">{{
              sessions.filter(s => s.status === 'completed').length
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Active:</span>
            <span class="ml-2 text-gray-800">{{
              sessions.filter(s => s.status === 'active').length
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Total Hands:</span>
            <span class="ml-2 text-gray-800">{{
              sessions.reduce((sum, s) => sum + s.total_hands, 0)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  sessionService,
  type UserSession,
  type ImportSessionData,
} from '../../services/sessionService';
import { useSessionExport, type SessionExportData } from '../../composables/useSessionExport';
import { usePagination } from '../../composables/usePagination';

const sessions = ref<UserSession[]>([]);
const selectedSessionId = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const showDeleteAllDialog = ref(false);
const showExportedConfirmDialog = ref(false);
const deletingAll = ref(false);
const showExportDropdown = ref(false);

const sessionExportDropdowns = ref<Record<string, boolean>>({});
const showImportDialog = ref(false);
const selectedFiles = ref<File[]>([]);
const importingFiles = ref(false);
const isDragOverDialog = ref(false);
const editingSessionId = ref<string | null>(null);
const editingSessionName = ref<string>('');

// Notifications removed per user request
const sessionExport = useSessionExport();

// Pagination setup
const pagination = usePagination(sessions, {
  initialPage: 1,
  initialItemsPerPage: 10,
  itemsPerPageOptions: [10, 25, 50, 100],
  persistKey: 'session-history',
});

const refreshSessions = async () => {
  console.log('[session-tracking][persistence] Refreshing sessions list');
  loading.value = true;
  error.value = null;

  try {
    sessions.value = await sessionService.getAllSessions();
    console.log('[session-tracking][persistence] Sessions loaded successfully', {
      count: sessions.value.length,
    });
  } catch (err) {
    console.error('[session-tracking][error] Failed to load sessions', { error: err });
    error.value = err instanceof Error ? err.message : 'Failed to load sessions';
  } finally {
    loading.value = false;
  }
};

const selectSession = (sessionId: string) => {
  console.log('[session-tracking][user-action] Session selected', { sessionId });
  selectedSessionId.value = selectedSessionId.value === sessionId ? null : sessionId;
};

const selectedSession = computed((): UserSession | null => {
  if (!selectedSessionId.value) {
    return null;
  }
  return sessions.value.find(session => session.id === selectedSessionId.value) || null;
});

const deleteSession = async (sessionId: string) => {
  console.log('[session-tracking][user-action] Deleting session', { sessionId });

  try {
    await sessionService.deleteSession(sessionId);
    console.log('[session-tracking][persistence] Session deleted successfully', { sessionId });

    // Remove from local list
    sessions.value = sessions.value.filter(s => s.id !== sessionId);

    // Clear selection if deleted session was selected
    if (selectedSessionId.value === sessionId) {
      selectedSessionId.value = null;
    }
  } catch (err) {
    console.error('[session-tracking][error] Failed to delete session', { error: err, sessionId });
  }
};

// Session name editing functions
const startEditSessionName = (sessionId: string, currentName: string) => {
  console.log('[session-tracking][user-action] Starting session name edit', {
    sessionId,
    currentName,
  });
  editingSessionId.value = sessionId;
  editingSessionName.value = currentName;

  // Focus the input after Vue updates the DOM
  nextTick(() => {
    const input = document.querySelector('input[ref="editInput"]') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const cancelEditSessionName = () => {
  console.log('[session-tracking][user-action] Cancelling session name edit');
  editingSessionId.value = null;
  editingSessionName.value = '';
};

const saveSessionName = async (sessionId: string) => {
  if (!editingSessionName.value.trim()) {
    console.warn('[session-tracking][validation] Session name cannot be empty');
    return;
  }

  console.log('[session-tracking][user-action] Saving session name', {
    sessionId,
    newName: editingSessionName.value.trim(),
  });

  try {
    // Update session in database
    const updatedSession = await sessionService.updateSession(sessionId, {
      session_name: editingSessionName.value.trim(),
    });

    // Update local session data with the response from database
    const sessionIndex = sessions.value.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex] = updatedSession;
    }

    console.log('[session-tracking][persistence] Session name updated successfully', {
      sessionId,
      newName: editingSessionName.value.trim(),
    });

    // Clear editing state
    editingSessionId.value = null;
    editingSessionName.value = '';
  } catch (err) {
    console.error('[session-tracking][error] Failed to update session name', {
      error: err,
      sessionId,
    });
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

// Export all sessions to JSON or CSV file
const exportAllSessions = async (format: 'json' | 'csv' = 'json') => {
  console.log('[session-tracking][export] Exporting all sessions', {
    count: sessions.value.length,
    format,
  });

  // Close dropdown
  showExportDropdown.value = false;

  if (sessions.value.length === 0) {
    return;
  }

  try {
    if (format === 'json') {
      await sessionExport.exportToJSON();
    } else {
      await sessionExport.exportToCSV();
    }

    console.log('[session-tracking][export] Export completed successfully', {
      sessionCount: sessions.value.length,
      format,
    });
  } catch (err) {
    console.error('[session-tracking][error] Export failed', { error: err, format });
  }
};

// Toggle main export dropdown
const toggleMainExportDropdown = () => {
  // Close all session export dropdowns first
  Object.keys(sessionExportDropdowns.value).forEach(id => {
    sessionExportDropdowns.value[id] = false;
  });

  // Toggle the main export dropdown
  showExportDropdown.value = !showExportDropdown.value;
};

// Toggle session export dropdown
const toggleSessionExportDropdown = (sessionId: string) => {
  // Close main export dropdown first
  showExportDropdown.value = false;

  // Close all other session dropdowns
  Object.keys(sessionExportDropdowns.value).forEach(id => {
    if (id !== sessionId) {
      sessionExportDropdowns.value[id] = false;
    }
  });

  // Toggle the clicked dropdown
  sessionExportDropdowns.value[sessionId] = !sessionExportDropdowns.value[sessionId];
};

// Export a single session to JSON or CSV file
const exportSingleSession = async (session: UserSession, format: 'json' | 'csv' = 'json') => {
  console.log('[session-tracking][export] Exporting single session', {
    sessionId: session.id,
    sessionName: session.session_name,
    format,
  });

  // Close dropdown
  sessionExportDropdowns.value[session.id] = false;

  try {
    // Create a safe filename from session name
    const safeFileName = session.session_name
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const fileName = `session-${safeFileName}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      const exportData: SessionExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        sessions: [session],
        metadata: {
          totalSessions: 1,
          exportedBy: 'Baccarat Assistant',
          description: `Single session export: ${session.session_name}`,
        },
      };

      // Create and download the JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Create CSV content for single session
      const headers = [
        'ID',
        'Session Name',
        'Status',
        'Started At',
        'Ended At',
        'Duration (seconds)',
        'Total Hands',
        'Created At',
        'Updated At',
      ];

      const csvRow = [
        session.id,
        `"${session.session_name}"`, // Wrap in quotes for CSV safety
        session.status,
        session.started_at,
        session.ended_at || '',
        session.duration_seconds || '',
        session.total_hands,
        session.created_at,
        session.updated_at,
      ].join(',');

      const csvString = [headers.join(','), csvRow].join('\n');

      // Create and download the CSV file
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    console.log('[session-tracking][export] Single session export completed', {
      sessionId: session.id,
      fileName: `${fileName}.${format}`,
      format,
    });
  } catch (err) {
    console.error('[session-tracking][error] Single session export failed', {
      error: err,
      sessionId: session.id,
      format,
    });
  }
};

// Trigger file input for import
const triggerImport = () => {
  console.log('[session-tracking][import] Opening import dialog');
  showImportDialog.value = true;
};

// Trigger file selection in dialog
const triggerFileSelection = () => {
  console.log('[session-tracking][import] Triggering file selection');
  fileInput.value?.click();
};

// Dialog drag and drop handlers
const handleDialogDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOverDialog.value = true;
};

const handleDialogDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOverDialog.value = false;
};

const handleDialogDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOverDialog.value = false;

  const files = event.dataTransfer?.files;
  if (files) {
    addFilesToSelection(Array.from(files));
  }
};

// File management functions
const addFilesToSelection = (files: File[]) => {
  const validFiles = files.filter(file => {
    if (!isValidImportFile(file)) {
      console.warn('[session-tracking][import] Invalid file type', {
        fileName: file.name,
        fileType: file.type,
      });
      return false;
    }

    // Check for duplicates
    const isDuplicate = selectedFiles.value.some(
      existing => existing.name === file.name && existing.size === file.size
    );

    if (isDuplicate) {
      console.warn('[session-tracking][import] Duplicate file skipped', {
        fileName: file.name,
      });
      return false;
    }

    return true;
  });

  selectedFiles.value.push(...validFiles);
  console.log('[session-tracking][import] Files added to selection', {
    added: validFiles.length,
    total: selectedFiles.value.length,
  });
};

const removeFile = (index: number) => {
  const removedFile = selectedFiles.value[index];
  selectedFiles.value.splice(index, 1);
  console.log('[session-tracking][import] File removed from selection', {
    fileName: removedFile?.name,
    remaining: selectedFiles.value.length,
  });
};

const clearSelectedFiles = () => {
  console.log('[session-tracking][import] Clearing all selected files', {
    count: selectedFiles.value.length,
  });
  selectedFiles.value = [];
};

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileTypeLabel = (file: File): string => {
  if (file.name.toLowerCase().endsWith('.json') || file.type === 'application/json') {
    return 'JSON';
  } else if (file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv')) {
    return 'CSV';
  }
  return 'Unknown';
};

// Import selected files
const importSelectedFiles = async () => {
  if (selectedFiles.value.length === 0) {
    return;
  }

  console.log('[session-tracking][import] Starting import of selected files', {
    fileCount: selectedFiles.value.length,
  });

  importingFiles.value = true;

  try {
    for (const file of selectedFiles.value) {
      await processImportFile(file);
    }

    // Clear selection and close dialog after successful import
    selectedFiles.value = [];
    showImportDialog.value = false;

    console.log('[session-tracking][import] All files imported successfully');
  } catch (err) {
    console.error('[session-tracking][error] Import process failed', { error: err });
  } finally {
    importingFiles.value = false;
  }
};

// Handle file import from input
const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    if (showImportDialog.value) {
      // Add files to selection in dialog mode
      addFilesToSelection(Array.from(files));
    } else {
      // Direct import mode (shouldn't happen with current UI, but keeping for safety)
      for (const file of Array.from(files)) {
        await processImportFile(file);
      }
    }

    // Clear the input so the same files can be selected again
    target.value = '';
  }
};

// Handle drag and drop file import
const handleFileDrop = async (event: DragEvent) => {
  console.log('[session-tracking][import] File dropped for import');
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (isValidImportFile(file)) {
      await processImportFile(file);
    } else {
      console.error('[session-tracking][error] Invalid file type for import', {
        fileName: file.name,
        fileType: file.type,
      });
    }
  }
};

// Process the import file and check for duplicates
const processImportFile = async (file: File) => {
  console.log('[session-tracking][import] Processing import file', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const fileContent = await readFileAsText(file);
    let sessionsToImport: UserSession[] = [];

    // Determine file type and parse accordingly
    if (file.name.toLowerCase().endsWith('.json') || file.type === 'application/json') {
      // Parse JSON file
      const importData: SessionExportData = JSON.parse(fileContent);

      // Validate import data structure
      if (!importData.sessions || !Array.isArray(importData.sessions)) {
        throw new Error('Invalid JSON file format: missing sessions array');
      }

      sessionsToImport = importData.sessions;
      console.log('[session-tracking][import] JSON data validated', {
        sessionCount: sessionsToImport.length,
      });
    } else if (file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv')) {
      // Parse CSV file
      sessionsToImport = parseCSVContent(fileContent);
      console.log('[session-tracking][import] CSV data parsed', {
        sessionCount: sessionsToImport.length,
      });
    } else {
      throw new Error('Unsupported file format. Please use JSON or CSV files.');
    }

    if (sessionsToImport.length === 0) {
      console.log('[session-tracking][import] No sessions found in file');
      return;
    }

    // Check for existing sessions by name and start time to prevent duplicates
    const existingSessions = new Set(sessions.value.map(s => `${s.session_name}|${s.started_at}`));
    const newSessions = sessionsToImport.filter((session: UserSession) => {
      const sessionKey = `${session.session_name}|${session.started_at}`;
      return !existingSessions.has(sessionKey);
    });
    const duplicateCount = sessionsToImport.length - newSessions.length;

    if (duplicateCount > 0) {
      console.log('[session-tracking][import] Found duplicate sessions', {
        duplicates: duplicateCount,
        newSessions: newSessions.length,
        total: sessionsToImport.length,
      });
    }

    if (newSessions.length === 0) {
      console.log('[session-tracking][import] All sessions already exist, skipping import');
      return;
    }

    // Import new sessions to database with complete data
    let importedCount = 0;
    for (const session of newSessions) {
      try {
        await sessionService.importSession({
          session_name: session.session_name,
          started_at: session.started_at,
          ended_at: session.ended_at,
          duration_seconds: session.duration_seconds,
          total_hands: session.total_hands,
          status: session.status,
        });
        importedCount++;
      } catch (err) {
        console.error('[session-tracking][error] Failed to import session', {
          sessionName: session.session_name,
          error: err,
        });
      }
    }

    // Refresh the sessions list
    await refreshSessions();

    console.log('[session-tracking][import] Import completed', {
      imported: importedCount,
      duplicates: duplicateCount,
      total: sessionsToImport.length,
    });
  } catch (err) {
    console.error('[session-tracking][error] Import processing failed', { error: err });
  }
};

// Helper function to check if file is valid for import
const isValidImportFile = (file: File): boolean => {
  const validTypes = ['application/json', 'text/csv', 'application/csv'];
  const validExtensions = ['.json', '.csv'];

  return (
    validTypes.includes(file.type) ||
    validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  );
};

// Helper function to parse CSV line with proper quote handling
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  // Remove quotes from fields
  return result.map(field => field.replace(/^"(.*)"$/, '$1'));
};

// Helper function to parse CSV content into UserSession objects
const parseCSVContent = (csvContent: string): UserSession[] => {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Parse header row with proper quote handling
  const headers = parseCSVLine(lines[0]);

  console.log('[session-tracking][import] CSV headers parsed', { headers });

  // Expected headers (flexible order)
  const requiredHeaders = ['ID', 'Session Name', 'Status', 'Started At'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`CSV file missing required headers: ${missingHeaders.join(', ')}`);
  }
  // Find column indices
  const getColumnIndex = (headerName: string) => headers.findIndex(h => h === headerName);

  const idIndex = getColumnIndex('ID');
  const nameIndex = getColumnIndex('Session Name');
  const statusIndex = getColumnIndex('Status');
  const startedIndex = getColumnIndex('Started At');
  const endedIndex = getColumnIndex('Ended At');
  const durationIndex = getColumnIndex('Duration (seconds)');
  const handsIndex = getColumnIndex('Total Hands');
  const createdIndex = getColumnIndex('Created At');
  const updatedIndex = getColumnIndex('Updated At');
  const cardsRemainingIndex = getColumnIndex('Cards Remaining');
  const startBalanceIndex = getColumnIndex('Start Balance');
  const endBalanceIndex = getColumnIndex('End Balance');

  console.log('[session-tracking][import] CSV column indices', {
    idIndex,
    nameIndex,
    statusIndex,
    startedIndex,
    endedIndex,
    durationIndex,
    handsIndex,
    createdIndex,
    updatedIndex,
    cardsRemainingIndex,
    startBalanceIndex,
    endBalanceIndex,
  });

  // Parse data rows
  const sessions: UserSession[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    } // Skip empty lines

    const values = parseCSVLine(line);

    console.log('[session-tracking][import] Parsing CSV row', {
      rowNumber: i + 1,
      values,
      valuesCount: values.length,
      headersCount: headers.length,
    });

    try {
      const session: UserSession = {
        id: values[idIndex] || '',
        session_name: values[nameIndex] || `Imported Session ${i}`,
        status: (values[statusIndex] as 'active' | 'completed') || 'completed',
        started_at: values[startedIndex] || new Date().toISOString(),
        ended_at: values[endedIndex] || null,
        duration_seconds: values[durationIndex] ? parseInt(values[durationIndex]) : null,
        total_hands: values[handsIndex] ? parseInt(values[handsIndex]) : 0,
        cards_remaining: values[cardsRemainingIndex] ? parseInt(values[cardsRemainingIndex]) : null,
        start_balance: values[startBalanceIndex] ? parseFloat(values[startBalanceIndex]) : null,
        end_balance: values[endBalanceIndex] ? parseFloat(values[endBalanceIndex]) : null,
        created_at: values[createdIndex] || new Date().toISOString(),
        updated_at: values[updatedIndex] || new Date().toISOString(),
      };

      console.log('[session-tracking][import] Parsed session data', {
        sessionName: session.session_name,
        totalHands: session.total_hands,
        status: session.status,
        startedAt: session.started_at,
      });

      // Validate required fields
      if (!session.id || !session.session_name || !session.started_at) {
        console.warn('[session-tracking][import] Skipping invalid CSV row', {
          rowNumber: i + 1,
          session: {
            id: session.id,
            session_name: session.session_name,
            started_at: session.started_at,
          },
        });
        continue;
      }

      sessions.push(session);
    } catch (err) {
      console.warn('[session-tracking][import] Failed to parse CSV row', {
        rowNumber: i + 1,
        error: err,
        values,
      });
    }
  }

  console.log('[session-tracking][import] CSV parsing completed', {
    totalRows: lines.length - 1,
    parsedSessions: sessions.length,
  });

  return sessions;
};

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

// Global drag and drop event handlers
const handleGlobalDragOver = (event: DragEvent) => {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (isValidImportFile(file)) {
      isDragOver.value = true;
    }
  }
};

const handleGlobalDragLeave = (event: DragEvent) => {
  // Only hide if leaving the window entirely
  if (!event.relatedTarget) {
    isDragOver.value = false;
  }
};

// Show delete all confirmation dialog
const confirmDeleteAll = () => {
  console.log('[session-tracking][user-action] Confirming delete all sessions', {
    sessionCount: sessions.value.length,
  });

  if (sessions.value.length === 0) {
    return;
  }

  showDeleteAllDialog.value = true;
};

// Export sessions first, then show confirmation dialog
const exportBeforeDelete = async () => {
  console.log('[session-tracking][delete-all] Starting export before delete process');
  deletingAll.value = true;

  try {
    // Export all sessions
    await sessionExport.exportToJSON();

    // Close initial dialog and show confirmation dialog
    showDeleteAllDialog.value = false;
    showExportedConfirmDialog.value = true;

    console.log('[session-tracking][export] Export completed, showing confirmation dialog');
  } catch (err) {
    console.error('[session-tracking][error] Export before delete failed', { error: err });
  } finally {
    deletingAll.value = false;
  }
};

// Confirm deletion after export
const confirmDeleteAfterExport = async () => {
  console.log('[session-tracking][delete-all] User confirmed deletion after export');
  showExportedConfirmDialog.value = false;
  await deleteAllSessions();
};

// Cancel deletion after export
const cancelDeleteAfterExport = () => {
  console.log('[session-tracking][delete-all] User cancelled deletion after export');
  showExportedConfirmDialog.value = false;
  deletingAll.value = false;
};

// Delete all sessions without export
const deleteAllSessions = async () => {
  console.log('[session-tracking][delete-all] Starting delete all sessions process', {
    sessionCount: sessions.value.length,
  });

  deletingAll.value = true;

  try {
    let deletedCount = 0;
    let failedCount = 0;

    // Delete each session individually
    for (const session of sessions.value) {
      try {
        await sessionService.deleteSession(session.id);
        deletedCount++;
        console.log('[session-tracking][delete-all] Session deleted', {
          sessionId: session.id,
          progress: `${deletedCount}/${sessions.value.length}`,
        });
      } catch (err) {
        console.error('[session-tracking][error] Failed to delete session', {
          sessionId: session.id,
          error: err,
        });
        failedCount++;
      }
    }

    // Refresh the sessions list
    await refreshSessions();

    // Clear selection since all sessions are deleted
    selectedSessionId.value = null;

    // Close dialog
    showDeleteAllDialog.value = false;

    console.log('[session-tracking][delete-all] Delete all completed', {
      deleted: deletedCount,
      failed: failedCount,
      total: sessions.value.length,
    });
  } catch (err) {
    console.error('[session-tracking][error] Delete all process failed', { error: err });
  } finally {
    deletingAll.value = false;
  }
};

// Close all dropdowns when clicking outside
const handleGlobalClick = () => {
  showExportDropdown.value = false;
  Object.keys(sessionExportDropdowns.value).forEach(id => {
    sessionExportDropdowns.value[id] = false;
  });
};

onMounted(() => {
  refreshSessions();

  // Add global click listener for dropdown management
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  // Clean up global event listeners
  document.removeEventListener('click', handleGlobalClick);
});
</script>
