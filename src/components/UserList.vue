<template>
  <div class="users-container">
  
    <div class="filter-bar">
      <div class="filters">
        <select class="filter-select">
          <option>All Roles</option>
        </select>
        <select class="filter-select">
          <option>All Statuses</option>
        </select>
      </div>
      <div class="search">
        <input type="text" placeholder="Search" class="search-input" />
      </div>
    </div>

    <div class="users-table">
      <div class="users-count">
        Users ({{ users.length }})
      </div>
      <div class="table-header">
        <div class="header-row">
          <div class="header-cell">Username <span class="sort-arrow">↑</span></div>
          <div class="header-cell">Insights and Guidance Permissions</div>
          <div class="header-cell">Feedback Permission Group</div>
          <div class="header-cell">Last Login</div>
        </div>
      </div>
      <div class="table-body">
        <div class="table-row" v-for="user in users" :key="user.email">
          <div class="table-cell">{{ user.email }}</div>
          <div class="table-cell">{{ user.permissions }}</div>
          <div class="table-cell">{{ user.group }}</div>
          <div class="table-cell">{{ user.lastLogin }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      users: [
        {
          email: 'sarah.parker@acme.co',
          permissions: 'Super',
          group: 'Feedback Contributer',
          lastLogin: 'Feb 5, 2025 11:29:53 AM EST'
        },
        {
          email: 'james.wilson@acme.co',
          permissions: 'User : 3 roles across 27 apps',
          group: 'Feedback Contributer',
          lastLogin: 'Feb 3, 2025 4:43:24 PM EST'
        },
        {
          email: 'michael.chen@acme.co',
          permissions: 'Super',
          group: 'Administrator',
          lastLogin: 'Jan 22, 2025 9:37:00 AM EST'
        },
        {
          email: 'emma.rodriguez@acme.co',
          permissions: 'User : 5 roles across 27 apps',
          group: 'Administrator',
          lastLogin: 'Feb 5, 2025 3:25:06 PM EST'
        },
        {
          email: 'david.smith@acme.co',
          permissions: 'Super',
          group: 'Feedback Contributer',
          lastLogin: 'Jan 2, 2025 12:47:42 PM EST'
        },
        {
          email: 'lisa.thompson@acme.co',
          permissions: 'Super',
          group: 'Feedback Contributer',
          lastLogin: 'Aug 13, 2024 11:44:01 AM EDT'
        },
        {
          email: 'robert.garcia@acme.co',
          permissions: 'Super',
          group: 'Feedback Contributer',
          lastLogin: 'Nov 18, 2024 7:48:28 AM EST'
        },
        {
          email: 'jennifer.miller@acme.co',
          permissions: 'Super',
          group: 'Feedback Contributer',
          lastLogin: 'Feb 6, 2025 2:30:55 PM EST'
        }
      ]
    }
  }
}
</script>

<style scoped>


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2C3E50;
  margin: 0;
}

.add-user-btn {
  background: #00B5D1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-user-btn:hover {
  background: #009BB3;
}

.tabs {
  border-bottom: 1px solid #E5E9F2;
  margin-bottom: 24px;
}

.tab {
  border: none;
  background: none;
  padding: 12px 24px;
  cursor: pointer;
  margin-right: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #606F7B;
}

.tab.active {
  border-bottom: 2px solid #00B5D1;
  color: #00B5D1;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 3px;
}

.filters {
  display: flex;
  gap: 16px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #4A5568;
  background: white;
}

.search {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
}

.users-table {
  width: 100%;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 3px;
  overflow: hidden;
}

.users-count {
  padding: 16px;
  font-size: 18px;
  line-height: 135%;
  font-weight: 600;
  color: #2C3E50;
  border-bottom: 1px solid #E2E8F0;
}

.table-header {
  background: #F7FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.header-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr;
  padding: 12px 16px;
}

.header-cell {
  font-size: 14px;
  font-weight: 500;
  color: #4A5568;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-arrow {
  color: #128297;
}

.table-body {
  background: white;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid #E2E8F0;
}

.table-row:hover {
  background: #F8FAFC;
}

.table-cell {
  font-size: 14px;
  color: #2C3E50;
  padding: 4px 0;
}

/* Remove old table styles */
table, th, td {
  display: none;
}
</style> 