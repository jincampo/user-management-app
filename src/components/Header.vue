<template>
  <header class="app-header">
    <div class="header-content">
      <h1>Users</h1>
      <button class="pendo-button primary" @click="$emit('open-wizard')">
        + Add user
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #E2E8F0;
  padding: 24px 32px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 46.184px;
  line-height: 130%;
  font-weight: 600;
  color: #1A202C;
  margin: 0;
}

.pendo-button.primary {
  background: #128297;
  color: white;
  border: 1px solid #128297;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.pendo-button.primary:hover {
  background: #0F6B7B;
}
</style> 