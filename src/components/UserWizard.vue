<template>
  <transition name="slide-up">
    <div v-if="isOpen" class="wizard-overlay">
      <div class="wizard-modal">
        <div class="wizard-header">
          <h2>Invite User</h2>
          <button class="close-button" @click="close">×</button>
        </div>
        
        <div class="wizard-content">
          <div class="wizard-card">
            <h3>Add user details</h3>
            <div class="card-body">
              <div class="form-container">
                <div class="form-group">
                  <label>Emails <span class="required">*</span></label>
                  <div class="typeahead-container">
                    <div class="input-wrapper">
                      <div class="email-pills">
                        <span v-for="email in selectedEmails" :key="email" class="email-pill">
                          {{ email }}
                          <button class="remove-pill" @click.stop="removeEmail(email)">×</button>
                        </span>
                      </div>
                      <input 
                        type="text" 
                        v-model="emailSearch"
                        @focus="handleFocus"
                        @blur="handleBlur"
                        @input="filterEmails"
                        @keydown="handleKeydown"
                        :placeholder="inputPlaceholder"
                        :class="{ 'hide-placeholder': !showInputPlaceholder }"
                        ref="emailInput"
                      >
                    </div>
                    <div v-if="showDropdown" class="email-dropdown">
                      <div 
                        class="email-option" 
                        :class="{ 'invalid': emailSearch && !isValidEmail }"
                        @click="isValidEmail && selectEmail()"
                      >
                        <span class="email-text">{{ emailSearch }}</span>
                        <span v-if="emailSearch && !isValidEmail" class="invalid-text">(Enter valid email address to invite)</span>
                        <span v-else-if="emailSearch">(Invite new user)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Teams</label>
                  <div class="select-container" v-click-outside="closeTeamDropdown">
                    <div class="select-wrapper">
                      <div class="team-pills">
                        <span v-for="teamId in selectedTeams" :key="teamId" class="team-pill">
                          {{ teamOptions.find(t => t.id === teamId)?.name }}
                          <button class="remove-pill" @click.stop="removeTeam(teamId)">×</button>
                        </span>
                      </div>
                      <input 
                        type="text" 
                        v-model="teamSearch"
                        @focus="showTeamDropdown = true"
                        @input="filterTeams"
                        placeholder="Select any teams they are on"
                        readonly
                      >
                    </div>
                    <div v-if="showTeamDropdown" class="team-dropdown">
                      <div 
                        v-for="team in availableTeams" 
                        :key="team.id"
                        class="team-option"
                        @click="selectTeam(team)"
                      >
                        <div class="checkbox-option">
                          <input 
                            type="checkbox" 
                            :checked="selectedTeams.includes(team.id)"
                            @click.stop
                          >
                          <span>{{ team.name }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="wizard-card">
            <h3>Choose how to set permissions</h3>
            <div class="card-body">
              <div class="permission-options">
                <div 
                  v-for="option in permissionOptions" 
                  :key="option.id"
                  class="permission-card"
                  :class="{ 'selected': selectedPermission === option.id }"
                  @click="selectPermission(option.id)"
                >
                  <div class="permission-card-content">
                    <component :is="option.icon" class="permission-icon" />
                    <h4>{{ option.title }}</h4>
                    <p>{{ option.description }}</p>
                  </div>
                  <Check v-if="selectedPermission === option.id" class="check-icon" />
                </div>
              </div>
            </div>
          </div>

          <!-- Add new card for copy user selection -->
          <div v-if="selectedPermission === 'copy'" class="wizard-card">
            <h3>Select permissions</h3>
            <div class="card-body">
              <div class="form-container">
                <div class="form-group">
                  <label>Select user to copy from</label>
                  <div class="select-container">
                    <div class="select-wrapper">
                      <input 
                        type="text" 
                        v-model="userSearch"
                        @focus="showUserDropdown = true"
                        @input="filterUsers"
                        :placeholder="selectedUser ? selectedUser.name : 'Search for a user'"
                        readonly
                      >
                    </div>
                    <div v-if="showUserDropdown" class="team-dropdown">
                      <div 
                        v-for="user in existingUsers" 
                        :key="user.id"
                        class="team-option"
                        @click="selectUser(user)"
                      >
                        <div class="user-option">
                          <span class="user-name">{{ user.name }}</span>
                          <span class="user-email">{{ user.email }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Update Start from scratch section -->
          <template v-if="selectedPermission === 'scratch'">
            <div class="wizard-card">
              <h3>Select permissions</h3>
              <div class="card-body">
                <div class="form-container">
                  <div class="permissions-wrapper">
                    <!-- Subscription section -->
                    <div class="permissions-section">
                      <h4>Subscription level permissions</h4>
                      <p class="section-description">Set permissions for all subscription level features.</p>

                      <div class="roles-section">
                        <h5>Roles by category</h5>
                        <a class="expand-link" @click="toggleSubscriptionRoleDetails">
                          {{ showSubscriptionRoleDetails ? 'Collapse role details' : 'Expand role details' }}
                        </a>

                        <div class="role-group">
                          <div class="role-header">
                            <div class="icon-wrapper">
                              <img src="@/assets/segments.png" class="role-icon" alt="Segments icon" />
                            </div>
                            <div class="divider"></div>
                            <div class="role-content">
                              <span class="role-title">Segments and reports</span>
                              <div class="role-options">
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="segments" value="viewer" checked disabled>
                                    <span>Viewer</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">Can view segments.</li>
                                          <li class="permission-item">Can view reports.</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="segments" value="editor">
                                    <span>Editor</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-header">
                                      <span class="role-name">Editor</span>
                                    </div>
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">View all segments and reports</li>
                                        <li class="permission-item">Export segment data</li>
                                        <li class="permission-item">Access segment analytics</li>
                                      </ul>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="segments" value="verifier">
                                    <span>Verifier</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-header">
                                        <span class="role-name">Verifier</span>
                                      </div>
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>segments viewer</em></li>
                                          <li class="permission-item">Verify and approve segments</li>
                                          <li class="permission-item">Manage segment approval workflow</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="role-group">
                          <div class="role-header">
                            <div class="icon-wrapper">
                              <img src="@/assets/listen.png" class="role-icon" alt="Listen icon" />
                            </div>
                            <div class="divider"></div>
                            <div class="role-content">
                              <span class="role-title">Listen</span>
                              <div class="role-options">
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input 
                                      type="checkbox" 
                                      name="listen" 
                                      value="viewer"
                                      checked
                                      disabled
                                    >
                                    <span>Viewer</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-header">
                                      <span class="role-name">Viewer</span>
                                    </div>
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">View all feedback items</li>
                                        <li class="permission-item">Access feedback analytics</li>
                                        <li class="permission-item">View visitor votes and interactions</li>
                                      </ul>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="listen" value="editor">
                                    <span>Editor</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-header">
                                        <span class="role-name">Manager</span>
                                      </div>
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>listen editor</em></li>
                                          <li class="permission-item">Manage feedback settings</li>
                                          <li class="permission-item">Delete any feedback items</li>
                                          <li class="permission-item">Edit any feedback items</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="listen" value="manager">
                                    <span>Manager</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-header">
                                        <span class="role-name">Manager</span>
                                      </div>
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>listen editor</em></li>
                                          <li class="permission-item">Manage feedback settings</li>
                                          <li class="permission-item">Delete any feedback items</li>
                                          <li class="permission-item">Edit any feedback items</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="role-group">
                          <div class="role-header">
                            <div class="icon-wrapper">
                              <img src="@/assets/roadmaps.png" class="role-icon" alt="Roadmaps icon" />
                            </div>
                            <div class="divider"></div>
                            <div class="role-content">
                              <span class="role-title">Roadmaps</span>
                              <div class="role-options">
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input 
                                      type="checkbox" 
                                      name="roadmaps" 
                                      value="viewer"
                                      checked
                                      disabled
                                    >
                                    <span>Viewer</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-header">
                                        <span class="role-name">Viewer</span>
                                      </div>
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">View all roadmaps</li>
                                          <li class="permission-item">Access roadmap analytics</li>
                                          <li class="permission-item">View roadmap settings</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="roadmaps" value="editor">
                                    <span>Editor</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-header">
                                        <span class="role-name">Viewer</span>
                                      </div>
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">View all roadmaps</li>
                                          <li class="permission-item">Access roadmap analytics</li>
                                          <li class="permission-item">View roadmap settings</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="roadmaps" value="manager">
                                    <span>Manager</span>
                                  </div>
                                  <div class="role-details" v-if="showSubscriptionRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-header">
                                        <span class="role-name">Manager</span>
                                      </div>
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>roadmaps editor</em></li>
                                          <li class="permission-item">Manage roadmap settings</li>
                                          <li class="permission-item">Control roadmap visibility</li>
                                          <li class="permission-item">Delete any roadmaps</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Application section -->
                    <div class="permissions-section">
                      <h4>App level permissions</h4>
                      <p class="section-description">Create permission sets below for all features that could be applied on an application basis.</p>

                      <div class="app-info">
                        <div class="info-icon">i</div>
                        <span>
                          <span class="app-count" data-tooltip="Apps: Mobile App, Web Dashboard, Analytics Portal, Customer Portal, Admin Console, Marketing Site, Help Center, API Gateway, Sales Platform, Developer Tools, iOS App, Android App, Desktop App, Partner Portal, Internal Tools, E-commerce Platform, Support Dashboard, Billing Portal, Integration Hub, Status Page">
                            20 apps
                          </span> 
                          are not included in any permission set and will, by default, have <strong>Viewer</strong> access.
                        </span>
                      </div>

                      <div class="form-group">
                        <label>Apps <span class="required">*</span></label>
                        <div class="select-container" v-click-outside="closeAppDropdown">
                          <div class="select-wrapper">
                            <div class="team-pills">
                              <span v-for="appId in selectedApps" :key="appId" class="team-pill">
                                {{ appOptions.find(a => a.id === appId)?.name }}
                                <button class="remove-pill" @click.stop="removeApp(appId)">×</button>
                              </span>
                            </div>
                            <input 
                              type="text" 
                              v-model="appSearch"
                              @focus="showAppDropdown = true"
                              placeholder="Select apps"
                              readonly
                            >
                          </div>
                          <div v-if="showAppDropdown" class="team-dropdown">
                            <div 
                              v-for="app in availableApps" 
                              :key="app.id"
                              class="team-option"
                              @click="selectApp(app)"
                            >
                              <div class="checkbox-option">
                                <input 
                                  type="checkbox" 
                                  :checked="selectedApps.includes(app.id)"
                                  @click.stop
                                >
                                <span>{{ app.name }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="roles-section">
                        <h5>Roles by category</h5>
                        <a class="expand-link" @click="toggleAppRoleDetails">
                          {{ showAppRoleDetails ? 'Collapse role details' : 'Expand role details' }}
                        </a>

                        <div class="role-group">
                          <div class="role-header">
                            <div class="icon-wrapper">
                              <img src="@/assets/guides.png" class="role-icon" alt="Guides icon" />
                            </div>
                            <div class="divider"></div>
                            <div class="role-content">
                              <span class="role-title">Guides</span>
                              <div class="role-options">
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="guides" value="viewer" checked disabled>
                                    <span>Viewer</span>
                                  </div>
                                  <div class="role-details" v-if="showAppRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">View all guides and resource center content</li>
                                          <li class="permission-item">Access guide analytics</li>
                                          <li class="permission-item">View guide settings</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="guides" value="resource-center-author">
                                    <span>Resource center author</span>
                                  </div>
                                  <div class="role-details" v-if="showAppRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>guides viewer</em></li>
                                          <li class="permission-item">Create and edit resource center content</li>
                                          <li class="permission-item">Manage resource center categories</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="guides" value="resource-center-publisher">
                                    <span>Resource center publisher</span>
                                  </div>
                                  <div class="role-details" v-if="showAppRoleDetails">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item inherited">All permissions of a <em>resource center author</em></li>
                                        <li class="permission-item">Publish resource center content</li>
                                        <li class="permission-item">Manage resource center publishing workflow</li>
                                      </ul>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="guides" value="creator">
                                    <span>Creator</span>
                                  </div>
                                  <div class="role-details" v-if="showAppRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>guides viewer</em></li>
                                          <li class="permission-item">Create and edit guides</li>
                                          <li class="permission-item">Share guides with other users</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="guides" value="publisher">
                                    <span>Publisher</span>
                                  </div>
                                  <div class="role-details" v-if="showAppRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>guides creator</em></li>
                                          <li class="permission-item">Publish guides</li>
                                          <li class="permission-item">Manage guide publishing workflow</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label class="role-option">
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="guides" value="content-editor">
                                    <span>Content editor</span>
                                  </div>
                                  <div class="role-details" v-if="showAppRoleDetails">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item inherited">All permissions of a <em>guides viewer</em></li>
                                          <li class="permission-item">Edit guide content</li>
                                          <li class="permission-item">Manage guide content workflow</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Add back the tagging section after the guides section -->
                      <div class="role-group">
                        <div class="role-header">
                          <div class="icon-wrapper">
                            <img src="@/assets/tagging.png" class="role-icon" alt="Tagging icon" />
                          </div>
                          <div class="divider"></div>
                          <div class="role-content">
                            <span class="role-title">Tagging</span>
                            <div class="role-options">
                              <label class="role-option">
                                <div class="checkbox-row">
                                  <input type="checkbox" name="tagging" value="viewer" checked disabled>
                                  <span>Viewer</span>
                                </div>
                                <div class="role-details" v-if="showAppRoleDetails">
                                  <div class="role-details-content">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">View all tags</li>
                                        <li class="permission-item">Access tag analytics</li>
                                        <li class="permission-item">View tag settings</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </label>

                              <label class="role-option">
                                <div class="checkbox-row">
                                  <input type="checkbox" name="tagging" value="editor">
                                  <span>Editor</span>
                                </div>
                                <div class="role-details" v-if="showAppRoleDetails">
                                  <div class="role-details-content">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item inherited">All permissions of a <em>tagging viewer</em></li>
                                        <li class="permission-item">Create and edit tags</li>
                                        <li class="permission-item">Manage tag categories</li>
                                        <li class="permission-item">Configure tag settings</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="selectedPermission === 'admin'">
            <div class="wizard-card">
              <h3>Review admin privileges</h3>
              <div class="card-body">
                <div class="form-container">
                  <p class="permission-info">
                    Subscription admins have full access to the Pendo Subscription. This includes all Application settings, Guide Settings, and full Analytics capabilities.
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Add view-only privileges card -->
          <template v-if="selectedPermission === 'view'">
            <div class="wizard-card">
              <h3>Review view-only privileges</h3>
              <div class="card-body">
                <div class="form-container">
                  <p class="permission-info">
                    View-only users can access analytics and view guides, but cannot make changes to any settings or configurations.
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="wizard-footer">
          <button class="cancel-button" @click="close">Cancel</button>
          <button 
            class="invite-button" 
            :disabled="!canInvite"
            @click="inviteUser"
          >
            Invite user
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { Key, Copy, Pencil, Eye, Check } from 'lucide-vue-next'

export default {
  name: 'UserWizard',
  components: {
    Key,
    Copy,
    Pencil,
    Eye,
    Check
  },
  props: {
    isOpen: Boolean
  },
  data() {
    return {
      emailSearch: '',
      showDropdown: false,
      selectedEmails: [],
      emailOptions: [
        'john.smith@acme.co',
        'sarah.wilson@acme.co',
        'michael.brown@acme.co',
        'emily.davis@acme.co',
        'david.miller@acme.co',
        'lisa.anderson@acme.co',
        'james.taylor@acme.co',
        'jennifer.thomas@acme.co',
        'robert.white@acme.co',
        'patricia.moore@acme.co'
      ],
      selectedTeams: [],
      showInputPlaceholder: true,
      selectedPermission: null,
      permissionOptions: [
        {
          id: 'admin',
          icon: Key,
          title: 'Make subscription admin',
          description: 'Admins have full access to your subscription, including settings and analytics.'
        },
        {
          id: 'copy',
          icon: Copy,
          title: 'Copy an existing user',
          description: 'Select an existing user as a starting point and then customize it to your needs.'
        },
        {
          id: 'scratch',
          icon: Pencil,
          title: 'Start from scratch',
          description: "Set a user's permissions from scratch, including app-level permissions."
        },
        {
          id: 'view',
          icon: Eye,
          title: 'Make view-only',
          description: 'Give only viewer permissions to all apps in your subscription.'
        }
      ],
      teamOptions: [
        {
          id: 'eng',
          name: 'Engineering'
        },
        {
          id: 'product',
          name: 'Product Management'
        },
        {
          id: 'design',
          name: 'Design'
        },
        {
          id: 'sales',
          name: 'Sales'
        },
        {
          id: 'marketing',
          name: 'Marketing'
        },
        {
          id: 'support',
          name: 'Customer Support'
        },
        {
          id: 'success',
          name: 'Customer Success'
        },
        {
          id: 'finance',
          name: 'Finance'
        },
        {
          id: 'hr',
          name: 'Human Resources'
        },
        {
          id: 'legal',
          name: 'Legal'
        },
        {
          id: 'ops',
          name: 'Operations'
        },
        {
          id: 'security',
          name: 'Security'
        }
      ],
      teamSearch: '',
      showTeamDropdown: false,
      userSearch: '',
      showUserDropdown: false,
      selectedUser: null,
      existingUsers: [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@acme.co'
        },
        {
          id: 2,
          name: 'Sarah Wilson',
          email: 'sarah.wilson@acme.co'
        },
        {
          id: 3,
          name: 'Michael Brown',
          email: 'michael.brown@acme.co'
        },
        {
          id: 4,
          name: 'Emily Davis',
          email: 'emily.davis@acme.co'
        },
        {
          id: 5,
          name: 'David Miller',
          email: 'david.miller@acme.co'
        }
      ],
      showSubscriptionRoleDetails: false,
      showAppRoleDetails: false,
      appSearch: '',
      showAppDropdown: false,
      selectedApps: [],
      appOptions: [
        { id: 1, name: 'Mobile App' },
        { id: 2, name: 'Web Dashboard' },
        { id: 3, name: 'Analytics Portal' },
        { id: 4, name: 'Customer Portal' },
        { id: 5, name: 'Admin Console' },
        { id: 6, name: 'Marketing Site' },
        { id: 7, name: 'Help Center' },
        { id: 8, name: 'API Gateway' },
        { id: 9, name: 'Sales Platform' },
        { id: 10, name: 'Developer Tools' },
        { id: 11, name: 'iOS App' },
        { id: 12, name: 'Android App' },
        { id: 13, name: 'Desktop App' },
        { id: 14, name: 'Partner Portal' },
        { id: 15, name: 'Internal Tools' },
        { id: 16, name: 'E-commerce Platform' },
        { id: 17, name: 'Support Dashboard' },
        { id: 18, name: 'Billing Portal' },
        { id: 19, name: 'Integration Hub' },
        { id: 20, name: 'Status Page' }
      ]
    }
  },
  computed: {
    filteredEmails() {
      if (!this.emailSearch) return this.emailOptions;
      const search = this.emailSearch.toLowerCase();
      return this.emailOptions.filter(email => 
        email.toLowerCase().includes(search)
      );
    },
    availableEmails() {
      return this.filteredEmails.filter(email => 
        !this.selectedEmails.includes(email)
      );
    },
    inputPlaceholder() {
      if (!this.showInputPlaceholder) return '';
      return 'Enter emails of users you want to add';
    },
    availableTeams() {
      return this.teamOptions.filter(team => !this.selectedTeams.includes(team.id));
    },
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return this.emailSearch && emailRegex.test(this.emailSearch);
    },
    canInvite() {
      // Check if at least one email is selected
      if (this.selectedEmails.length === 0) {
        return false;
      }

      // Check if a permission option is selected
      if (!this.selectedPermission) {
        return false;
      }

      // If copy option is selected, check if a user is selected to copy from
      if (this.selectedPermission === 'copy' && !this.selectedUser) {
        return false;
      }

      // If scratch option is selected, check if at least one app is selected
      if (this.selectedPermission === 'scratch' && !this.selectedApps?.length) {
        return false;
      }

      return true;
    },
    availableApps() {
      return this.appOptions.filter(app => !this.selectedApps.includes(app.id));
    }
  },
  methods: {
    close() {
      this.selectedPermission = null;
      this.$emit('close')
    },
    selectEmail(email) {
      if (this.isValidEmail && !this.selectedEmails.includes(this.emailSearch)) {
        this.selectedEmails.push(this.emailSearch);
      }
      this.emailSearch = '';
      this.$refs.emailInput.focus();
    },
    removeEmail(email) {
      this.selectedEmails = this.selectedEmails.filter(e => e !== email);
    },
    filterEmails() {
      this.showDropdown = this.emailSearch.length > 0;
    },
    handleFocus() {
      this.showInputPlaceholder = true;
    },
    handleBlur() {
      if (this.selectedEmails.length > 0) {
        this.showInputPlaceholder = false;
      }
    },
    handleKeydown(e) {
      if (e.key === 'Enter' && this.isValidEmail) {
        this.selectEmail();
      }
    },
    selectPermission(id) {
      this.selectedPermission = id;
      
      // Wait for the new section to be rendered
      this.$nextTick(() => {
        // Find all wizard cards
        const wizardCards = document.querySelectorAll('.wizard-card');
        let targetCard;
        
        // Select the appropriate card based on permission type
        if (id === 'copy' || id === 'scratch') {
          targetCard = wizardCards[2]; // Third card (Select permissions)
        }
        
        // If we found the target card, scroll to it with offset
        if (targetCard) {
          const offset = 100;
          const wizardContent = document.querySelector('.wizard-content');
          const elementPosition = targetCard.offsetTop;
          
          wizardContent.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
          });
        }
      });
    },
    selectTeam(team) {
      if (!this.selectedTeams.includes(team.id)) {
        this.selectedTeams.push(team.id);
      }
      this.teamSearch = '';
    },
    removeTeam(teamId) {
      this.selectedTeams = this.selectedTeams.filter(id => id !== teamId);
    },
    filterTeams() {
      this.showTeamDropdown = true;
    },
    selectUser(user) {
      this.selectedUser = user;
      this.showUserDropdown = false;
    },
    filterUsers() {
      this.showUserDropdown = true;
    },
    toggleSubscriptionRoleDetails() {
      this.showSubscriptionRoleDetails = !this.showSubscriptionRoleDetails;
    },
    toggleAppRoleDetails() {
      this.showAppRoleDetails = !this.showAppRoleDetails;
    },
    selectApp(app) {
      if (!this.selectedApps.includes(app.id)) {
        this.selectedApps.push(app.id);
      }
      this.showAppDropdown = false;
    },
    removeApp(appId) {
      const index = this.selectedApps.indexOf(appId);
      if (index > -1) {
        this.selectedApps.splice(index, 1);
      }
    },
    closeTeamDropdown() {
      this.showTeamDropdown = false;
    },
    closeAppDropdown() {
      this.showAppDropdown = false;
    }
  },
  mounted() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      const isEmailClick = e.target.closest('.typeahead-container');
      const isTeamClick = e.target.closest('.select-container');
      if (!isEmailClick) {
        this.showDropdown = false;
      }
      if (!isTeamClick) {
        this.showTeamDropdown = false;
        this.showUserDropdown = false;
      }
    });
  },
  watch: {
    isOpen(newValue) {
      if (!newValue) {
        this.selectedPermission = null;
      }
    }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  }
}
</script>

<style scoped>
.wizard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  z-index: 1000;
}

.wizard-modal {
  background: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

.wizard-header {
  padding: 24px 32px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wizard-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1A202C;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #4A5568;
  cursor: pointer;
  padding: 4px;
}

.wizard-content {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #F7F9FB;
  scroll-behavior: smooth;
}

.wizard-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 960px;
}

.wizard-card:last-child {
  margin-bottom: 0;
}

.wizard-content > * {
  width: 100%;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1A202C;
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
}

.required {
  color: #E53E3E;
}

.form-container {
  padding: 20px;
}

.form-group {
  margin-bottom: 24px;
  max-width: 680px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2D3748;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  padding-right: 32px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #2D3748;
  box-sizing: border-box;
}

.form-group select {
  width: 100%;
  padding: 8px 12px;
  padding-right: 32px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #2D3748;
  box-sizing: border-box;
  background: white;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  appearance: none;
}

.permission-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
}

.permission-card {
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.permission-card.selected {
  border-color: inherit;
  background: inherit;
}

.permission-card:hover:not(.selected) {
  border-color: #128297;
  background: #F7FAFC;
}

.permission-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1A202C;
  margin: 0 0 8px 0;
}

.permission-card p {
  font-size: 14px;
  color: #4A5568;
  margin: 0;
  line-height: 1.5;
}

.wizard-footer {
  padding: 24px 32px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button {
  background: white;
  color: #4A5568;
  border: 1px solid #E2E8F0;
}

.cancel-button:hover {
  background: #F7FAFC;
}

.invite-button {
  background: #10B981;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
}

.invite-button:disabled {
  background: #E2E8F0;
  border-color: #E2E8F0;
  color: #A0AEC0;
  cursor: not-allowed;
}

.invite-button:disabled:hover {
  background: #E2E8F0;
  border-color: #E2E8F0;
}

.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-enter-to {
  transform: translateY(0);
}

/* Optional: add leave animation */
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-leave-to {
  transform: translateY(100%);
}

.card-body {
  position: relative;
  overflow: visible;
}

.typeahead-container {
  position: relative;
}

.input-wrapper {
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  background: white;
  min-height: 36px;
}

.email-pills {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.input-wrapper input {
  border: none;
  outline: none;
  padding: 4px;
  min-width: 200px;
  width: auto;
  font-size: 14px;
  flex: 1;
}

.input-wrapper input.hide-placeholder {
  width: 0;
  padding: 0;
  min-width: 0;
}

.input-wrapper input.hide-placeholder::placeholder {
  display: none;
}

.input-wrapper input.valid-email {
  color: inherit;
}

.email-pill {
  background: #EAECF1;
  border: 1px solid #EAECF1;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 14px;
  color: #2D3748;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
}

.remove-pill {
  background: none;
  border: none;
  color: #4A5568;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  margin-top: -1px;
}

.remove-pill:hover {
  color: #2D3748;
}

.email-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.email-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #2D3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-option:not(.invalid):hover {
  background: #F7FAFC;
}

.email-option.invalid {
  cursor: default;
}

.email-option.invalid .email-text {
  color: #6A6C75;
}

.invalid-text {
  color: #E53E3E;
}

.permission-icon {
  width: 20px;
  height: 20px;
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 24px;
}

/* Admin - Purple */
.permission-card:nth-child(1) .permission-icon {
  stroke: #5120B9;
  background: #F3F0FF;
}
.permission-card:nth-child(1).selected {
  border-color: #5120B9;
  background: #F3F0FF;
}

/* Copy - Magenta */
.permission-card:nth-child(2) .permission-icon {
  stroke: #E102C0;
  background: #FDF2FF;
}
.permission-card:nth-child(2).selected {
  border-color: #E102C0;
  background: #FDF2FF;
}

/* Start from scratch - Blue */
.permission-card:nth-child(3) .permission-icon {
  stroke: #4570E0;
  background: #F0F5FF;
}
.permission-card:nth-child(3).selected {
  border-color: #4570E0;
  background: #F0F5FF;
}

/* View only - Orange */
.permission-card:nth-child(4) .permission-icon {
  stroke: #F59929;
  background: #FFF7ED;
}
.permission-card:nth-child(4).selected {
  border-color: #F59929;
  background: #FFF7ED;
}

/* Remove the default icon styling */
.permission-icon {
  stroke-width: 2;
}

.check-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  stroke-width: 3;
}

/* Admin - Purple */
.permission-card:nth-child(1) .check-icon {
  stroke: #5120B9;
}

/* Copy - Magenta */
.permission-card:nth-child(2) .check-icon {
  stroke: #E102C0;
}

/* Start from scratch - Blue */
.permission-card:nth-child(3) .check-icon {
  stroke: #4570E0;
}

/* View only - Orange */
.permission-card:nth-child(4) .check-icon {
  stroke: #F59929;
}

.additional-cards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.additional-cards .wizard-card {
  margin: 0;
}

.select-container {
  position: relative;
}

.select-wrapper {
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  padding: 4px 8px;
  background: white;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 36px;
}

.team-pills {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.team-pill {
  background: #EAECF1;
  border: 1px solid #EAECF1;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 14px;
  color: #2D3748;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
}

.select-wrapper input {
  border: none;
  outline: none;
  padding: 4px;
  min-width: 120px;
  width: auto;
  font-size: 14px;
  flex: 1;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.team-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.team-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #2D3748;
}

.team-option:hover {
  background: #F7FAFC;
}

.user-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: #718096;
}

.permission-info {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #4A5568;
}

.permission-options + .form-container {
  padding: 0 24px 24px;
}

.permissions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.permissions-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1A202C;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #4A5568;
  margin: 0 0 24px 0;
}

.roles-section {
  position: relative;
}

.roles-section h5 {
  font-size: 14px;
  font-weight: 500;
  color: #2D3748;
  margin: 0 0 16px 0;
  display: inline-block;
}

.expand-link {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 14px;
  color: #128297;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.role-group {
  margin-bottom: 24px;
  display: flex;
}

.role-header {
  display: flex;
  width: 100%;
  min-height: 120px;
}

.icon-wrapper {
  padding: 16px;
  display: flex;
  align-items: flex-start;
}

.role-icon {
  width: 28px;
  height: 28px;
}

.divider {
  width: 1px;
  background: #E2E8F0;
  margin: 0 24px;
}

.role-content {
  flex: 1;
  padding: 16px 0;
}

.role-title {
  font-size: 14.222px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 12px;
  display: block;
}

.role-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  width: 100%;
}

.role-option {
  flex: 0 0 calc(33.333% - 34px);
  min-width: 0;

  padding: 8px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #2D3748;
  background: white;
}

.role-option:has(input:checked) {
  background: #E2FBFD;
  border-color: #128297;
}

.role-option input[type="checkbox"] {
  flex: 0 0 16px;
}

.role-option span {
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #E2FBFD;
  border: 1px solid #128297;
  border-radius: 4px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #128297;
}

.info-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #128297;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.app-info strong {
  font-weight: 600;
  color: #128297;
}

/* Remove old spacing styles */
.permissions-section + .permissions-section {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

/* Add styles for disabled state */
.role-option input[type="checkbox"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.role-option:has(input:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}

.role-option:has(input:disabled) span {
  cursor: not-allowed;
}

.role-details {
  position: static;
  width: 100%;
  box-shadow: none;
  border: none;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #E2E8F0;
}

.role-details-content {
  padding: 0;
}

.role-name {
  display: none;
}

.permissions-list {
  gap: 8px;
  margin-top: 0px;
  padding-inline-start: 32px;
}

.permission-item {
  font-size: 14px;
  line-height: 1.4;
}

/* Update expand link style */
.expand-link:hover {
  text-decoration: underline;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.checkbox-row input[type="checkbox"] {
  flex: 0 0 16px;
}

.checkbox-row span {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.permission-card-content {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

/* Remove the old background styles */
.wizard-card:first-child {
  position: relative;
}

/* Update to target only the card body */
.wizard-card:first-child .card-body {
  position: relative;
  overflow: visible;
  z-index: 1;
  background-image: url('@/assets/Add user shape.png');
  background-repeat: no-repeat;
  background-position: top right;
}

.app-count {
  color: #2C5282;
  font-weight: 600;
  cursor: help;
  border-bottom: 1px dashed #4299E1;
  position: relative;
}

/* Tooltip styles */
.app-count[data-tooltip] {
  position: relative;
}

.app-count[data-tooltip]::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #1A202C;
  color: white;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  white-space: normal;
  line-height: 1.5;
  max-width: 300px;
  text-align: left;
  width: max-content;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
}

/* Style for the "Apps:" prefix */
.app-count[data-tooltip]::before {
  content: "Apps: " attr(data-tooltip);
  font-weight: 400;
}

.app-count[data-tooltip]::before strong {
  font-weight: 600;
}

.app-count[data-tooltip]::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #1A202C transparent transparent transparent;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.app-count:hover[data-tooltip]::before,
.app-count:hover[data-tooltip]::after {
  opacity: 1;
  visibility: visible;
}

/* Add styles for checked checkboxes */
.role-option input[type="checkbox"]:checked {
  accent-color: #128297;
}

/* Update hover state for checkboxes */
.role-option input[type="checkbox"]:not(:disabled):hover {
  cursor: pointer;
}

/* Keep existing role-option checked state */
.role-option:has(input:checked) {
  background: #E2FBFD;
  border-color: #128297;
}

/* Add styles for checkbox options */
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.checkbox-option input[type="checkbox"] {
  flex: 0 0 16px;
  cursor: pointer;
}

.checkbox-option span {
  flex: 1;
  min-width: 0;
}

/* Update team option styles */
.team-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #2D3748;
  display: flex;
  align-items: center;
}

.team-option:hover {
  background: #F7FAFC;
}
</style> 