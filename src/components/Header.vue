<template>
  <header class="header">
    <div class="header-top">
      <h1>Users</h1>
      <button class="pendo-button primary" @click="openWizard">
        <span class="button-content">
          <span class="plus-icon">+</span>
          Add User
        </span>
      </button>
    </div>
    <nav class="header-tabs">
      <a href="#" class="tab active">Users</a>
      <a href="#" class="tab">Custom Roles</a>
    </nav>

    <UserWizard 
      :isOpen="isWizardOpen"
      @close="closeWizard"
    />
  </header>
</template>

<script>
import UserWizard from './UserWizard.vue'

export default {
  components: {
    UserWizard
  },
  data() {
    return {
      isWizardOpen: false
    }
  },
  methods: {
    openWizard() {
      this.isWizardOpen = true
    },
    closeWizard() {
      this.isWizardOpen = false
    }
  }
}
</script>

<style>
.header {
  background: white;
  padding: 24px 32px;
  padding-bottom: 0px;
  border-bottom: 1px solid #E2E8F0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h1 {
  font-size: 46.184px;
  line-height: 130%;
  font-weight: 600;
  color: #1A202C;
  margin: 0;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.pendo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: all 0.2s ease;
}

.primary {
  background: #128297;
  color: white;
}

.primary:hover {
  background: #0E6776;
}

.primary:active {
  background: #0A4B56;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plus-icon {
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
}

.header-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #E2E8F0;
  margin: 0 -32px;
  padding: 0 32px;
}

.tab {
  color: #4A5568;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 24px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  position: relative;
}

.tab.active {
  color: #1A202C;
  border-bottom-color: #128297;
  font-weight: 600;
}

.tab:not(.active):hover {
  color: #2D3748;
}
</style> 