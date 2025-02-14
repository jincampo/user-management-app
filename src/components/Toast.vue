<template>
  <transition name="toast">
    <div v-if="show" class="toast-container">
      <div class="toast success">
        <div class="toast-content">
          <div class="check-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="toast-text">
            <h4>User successfully added</h4>
            <p>{{ email }} was successfully added to your subscription.</p>
          </div>
        </div>
        <button class="close-button" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    show: Boolean,
    email: String
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 400px;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.check-circle {
  width: 24px;
  height: 24px;
  background: #12B76A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
}

.toast-text h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1A202C;
  margin: 0 0 4px 0;
}

.toast-text p {
  font-size: 14px;
  color: #4A5568;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 0;
  color: #A0AEC0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #718096;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style> 