<template>
  <div id="app">
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="logo">
        <img v-if="!isCollapsed" src="@/assets/pendo-logo.svg" class="pendo-logo" alt="Pendo Logo">
        <img v-else src="@/assets/pendo-logo-collapsed.svg" class="pendo-logo-collapsed" alt="Pendo Logo">
      </div>
      <nav>
        <a href="#" class="nav-item" v-for="(item, index) in navItems" :key="index">
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.text }}</span>
        </a>
      </nav>
      
      <div class="sidebar-bottom">
        <a href="#" class="nav-item" v-for="(item, index) in bottomNavItems" :key="index">
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.text }}</span>
        </a>
        <a href="#" class="nav-item">
          <div class="workspace">
            <div class="workspace-icon">P</div>
            <span class="nav-text">pendo-internal</span>
          </div>
          <ChevronRight class="nav-icon" />
        </a>
        <a href="#" class="nav-item collapse-item" @click.prevent="toggleCollapse">
          <ChevronsLeft class="nav-icon" :class="{ 'rotate-180': isCollapsed }" />
          <span class="nav-text">Collapse</span>
        </a>
      </div>
    </div>
    <div class="main-content">
      <Header @open-wizard="openUserWizard" />
      <div class="content">
        <UserList ref="userList" />
      </div>
    </div>
  </div>
</template>

<script>
import UserList from './components/UserList.vue'
import Header from './components/Header.vue'
import { 
  Home,
  LayoutGrid,
  ShoppingBag,
  Users,
  LineChart,
  Heart,
  MessageSquare,
  Zap,
  Mic,
  PlayCircle,
  Send,
  Grid,
  Bell,
  Settings,
  ChevronRight,
  ChevronsLeft
} from 'lucide-vue-next'

export default {
  name: 'App',
  components: {
    UserList,
    Header,
    Home,
    LayoutGrid,
    ShoppingBag,
    Users,
    LineChart,
    Heart,
    MessageSquare,
    Zap,
    Mic,
    PlayCircle,
    Send,
    Grid,
    Bell,
    Settings,
    ChevronRight,
    ChevronsLeft
  },
  data() {
    return {
      isCollapsed: false,
      navItems: [
        { icon: 'Home', text: 'Home' },
        { icon: 'LayoutGrid', text: 'Dashboards' },
        { icon: 'ShoppingBag', text: 'Product' },
        { icon: 'Users', text: 'People' },
        { icon: 'LineChart', text: 'Analytics' },
        { icon: 'Heart', text: 'NPS' },
        { icon: 'MessageSquare', text: 'Guides' },
        { icon: 'Zap', text: 'Orchestrate' },
        { icon: 'Mic', text: 'Listen' },
        { icon: 'PlayCircle', text: 'Replay' }
      ],
      bottomNavItems: [
        { icon: 'Send', text: 'Pendo Tools' },
        { icon: 'Grid', text: 'Pendo Products' },
        { icon: 'Bell', text: 'Notifications' },
        { icon: 'Settings', text: 'Settings' }
      ]
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    openUserWizard() {
      this.$refs.userList.openWizard();
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #F7F9FB;
  width: 100%;
  min-width: 100%;
}

#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
  min-width: 100%;
}

.sidebar {
  width: 250px;
  background: #17044a;
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar.collapsed .nav-text,
.sidebar.collapsed .workspace span {
  display: none;
}

.sidebar.collapsed .logo {
  display: none;
}

.logo {
  padding: 0 24px;
  margin-bottom: 32px;
  display: flex;
  justify-content: left;
}

.pendo-logo {
  width: 100%;
  max-width: 140px;
  height: auto;
  padding: 0rem;
}

.pendo-logo-collapsed {
  width: 36px;
  height: 36px;
}

.sidebar.collapsed .logo {
  display: flex;
  padding: 0 18px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #FFFFFF;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  padding: 12px 28px;
  justify-content: center;
}

.nav-icon {
  opacity: 0.7;
  width: 20px;
  height: 20px;
  stroke-width: 2px;
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.sidebar.collapsed .workspace-icon {
  margin: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #F7F9FB;
}

.content {
  padding: 24px 32px;
}

.workspace {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.workspace-icon {
  width: 24px;
  height: 24px;
  background: #6B46C1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.collapse-item {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}
</style> 