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
          <div class="table-cell">
            <span v-if="user.isAdmin" class="admin-badge">
              Subscription admin
            </span>
            <span v-else>
              <span class="user-prefix">User : </span>
              <span class="role-link">{{ user.role.replace('User : ', '') }}</span>
            </span>
          </div>
          <div class="table-cell">{{ user.group }}</div>
          <div class="table-cell" :class="{ 'pending': user.lastLogin === 'Invite pending' }">
            {{ user.lastLogin }}
          </div>
        </div>
      </div>
    </div>

    <UserWizard 
      :is-open="showWizard" 
      @close="closeWizard"
      @users-invited="handleUsersInvited"
      :existing-users="users"
    />

    <Toast 
      :show="showToast"
      :email="lastAddedEmail"
      @close="closeToast"
    />
  </div>
</template>

<script>
import UserWizard from './UserWizard.vue'
import Toast from './Toast.vue'

export default {
  name: 'UserList',
  components: {
    UserWizard,
    Toast
  },
  data() {
    return {
      users: [
        {
          email: 'sarah.parker@acme.co',
          isAdmin: true,
          role: '',
          group: 'Feedback Contributer',
          lastLogin: 'Feb 5, 2025 11:29:53 AM EST'
        },
        {
          email: 'james.wilson@acme.co',
          isAdmin: false,
          role: 'User : 3 roles across 27 apps',
          group: 'Feedback Contributer',
          lastLogin: 'Feb 3, 2025 4:43:24 PM EST'
        },
        {
          email: 'michael.chen@acme.co',
          isAdmin: true,
          role: '',
          group: 'Administrator',
          lastLogin: 'Jan 22, 2025 9:37:00 AM EST'
        },
        {
          email: 'emma.rodriguez@acme.co',
          isAdmin: false,
          role: 'User : 5 roles across 27 apps',
          group: 'Administrator',
          lastLogin: 'Feb 5, 2025 3:25:06 PM EST'
        },
        {
          email: 'david.smith@acme.co',
          isAdmin: true,
          role: '',
          group: 'Feedback Contributer',
          lastLogin: 'Jan 2, 2025 12:47:42 PM EST'
        },
        {
          email: 'lisa.thompson@acme.co',
          isAdmin: true,
          role: '',
          group: 'Feedback Contributer',
          lastLogin: 'Aug 13, 2024 11:44:01 AM EDT'
        },
        {
          email: 'robert.garcia@acme.co',
          isAdmin: true,
          role: '',
          group: 'Feedback Contributer',
          lastLogin: 'Nov 18, 2024 7:48:28 AM EST'
        },
        {
          email: 'jennifer.miller@acme.co',
          isAdmin: true,
          role: '',
          group: 'Feedback Contributer',
          lastLogin: 'Feb 6, 2025 2:30:55 PM EST'
        }
      ],
      showWizard: false,
      showToast: false,
      lastAddedEmail: ''
    }
  },
  methods: {
    openWizard() {
      this.showWizard = true;
    },
    closeWizard() {
      this.showWizard = false;
    },
    handleUsersInvited(newUsers) {
      console.log('Received new users:', newUsers);
      
      const formattedUsers = newUsers.map(user => {
        console.log('Processing user:', user);
        console.log('User permission sets:', user.permissionSets);
        
        const permissions = this.formatPermissions(user);
        console.log('Formatted permissions:', permissions);
        
        return {
          email: user.email,
          isAdmin: user.isAdmin,
          role: permissions,
          group: 'Feedback Contributor',
          lastLogin: 'Invite pending'
        };
      });

      this.users = [...this.users, ...formattedUsers];
      this.closeWizard();

      if (newUsers.length > 0) {
        this.lastAddedEmail = newUsers[0].email;
        this.showToast = true;
        setTimeout(() => {
          this.closeToast();
        }, 5000);
      }
    },

    formatPermissions(user) {
      if (!user.permissionSets || user.permissionSets.length === 0) {
        return 'Viewer';
      }

      // Count total apps across all permission sets
      const totalApps = user.permissionSets.reduce((total, set) => {
        return total + (set.apps?.length || 0);
      }, 0);

      const totalRoles = user.permissionSets.reduce((total, set) => {
        if (!set.roles) return total;

        let roleCount = 0;

        // Count roles for each category
        Object.entries(set.roles).forEach(([category, roles]) => {
          // Each role in the array represents a selected role
          roleCount += roles.length;
        });

        return total + roleCount;
      }, 0);

      if (totalRoles === 0) {
        return totalApps > 0 ? `User : 0 roles across ${totalApps} ${totalApps === 1 ? 'app' : 'apps'}` : 'Viewer';
      }

      return `User : ${totalRoles} ${totalRoles === 1 ? 'role' : 'roles'} across ${totalApps} ${totalApps === 1 ? 'app' : 'apps'}`;
    },

    closeToast() {
      this.showToast = false;
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

.table-cell.pending {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-cell.pending::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #F6C000;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* Remove old table styles */
table, th, td {
  display: none;
}

.admin-badge {
  color: #2C3E50;
  font-weight: normal;
}

.user-prefix {
  color: #2C3E50;  /* Regular text color */
  font-weight: normal;
}

.role-link {
  color: #128297;
  cursor: pointer;
  text-decoration: none;
}

.role-link:hover {
  text-decoration: underline;
}
</style> 