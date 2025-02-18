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
                        @focus="handleTeamFocus"
                        @blur="handleTeamBlur"
                        :placeholder="showTeamPlaceholder ? 'Select any teams they are on' : ''"
                      >
                    </div>
                    <div v-if="showTeamDropdown" class="team-dropdown">
                      <div class="dropdown-search">
                        <input 
                          type="text" 
                          v-model="teamFilter"
                          placeholder="Search teams..."
                          @click.stop
                        >
                      </div>
                      <div 
                        v-for="team in filteredTeams" 
                        :key="team.id"
                        class="team-option"
                        @click.stop="selectTeam(team)"
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

          <!-- Copy user section -->
          <div v-if="selectedPermission === 'copy'" class="wizard-card" data-permission="copy">
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

                <!-- Show permissions section when user is selected -->
                <template v-if="selectedUser">
                  <div class="permissions-wrapper">
                    <!-- Subscription section -->
                    <div class="permissions-section">
                      <h4>Subscription level permissions</h4>
                      <p class="section-description">Set permissions for all subscription level features.</p>

                      <div class="roles-section">
                        <h6>Roles by category</h6>
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
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('segments-viewer')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="segments" value="viewer" checked disabled>
                                    <span>Viewer</span>
                                  </div>
                                  <div v-if="showSubscriptionRoleDetails" class="role-details">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a segments and reports editor</li>
                                          <li class="permission-item">Ability to change verification of segments and respond to verification requests.</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('segments-editor')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="segments" value="editor">
                                    <span>Editor</span>
                                  </div>
                                  <div v-if="showSubscriptionRoleDetails" class="role-details">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">Create and edit segments</li>
                                          <li class="permission-item">Manage segment settings</li>
                                          <li class="permission-item">Access segment analytics</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('segments-verifier')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="segments" value="verifier">
                                    <span>Verifier</span>
                                  </div>
                                  <div v-if="showSubscriptionRoleDetails" class="role-details">
                                    <div class="role-details-content">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a segments and reports editor</li>
                                          <li class="permission-item">Ability to change verification of segments and respond to verification requests.</li>
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
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('listen-viewer')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="listen" value="viewer" checked disabled>
                                    <span>Viewer</span>
                                  </div>
                                </label>
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('listen-editor')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="listen" value="editor">
                                    <span>Editor</span>
                                  </div>
                                </label>
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('listen-manager')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="listen" value="manager">
                                    <span>Manager</span>
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
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('roadmaps-viewer')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="roadmaps" value="viewer" checked disabled>
                                    <span>Viewer</span>
                                  </div>
                                </label>
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('roadmaps-editor')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="roadmaps" value="editor">
                                    <span>Editor</span>
                                  </div>
                                </label>
                                <label 
                                  class="role-option"
                                  :data-permissions-tooltip="getRolePermissionsTooltip('roadmaps-manager')"
                                >
                                  <div class="checkbox-row">
                                    <input type="checkbox" name="roadmaps" value="manager">
                                    <span>Manager</span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- App level section -->
                    <div class="permissions-section">
                      <h4>App level permissions</h4>
                      <p class="section-description">Set permissions for specific apps.</p>
                      
                      <div v-if="unusedApps.length > 0" class="app-info">
                        <span class="info-icon">i</span>
                        <span>
                          <strong class="app-count" :data-tooltip="'Apps: ' + unusedAppsList">{{ unusedApps.length }} {{ unusedApps.length === 1 ? 'app' : 'apps' }}</strong><span class="info-text">{{ unusedApps.length === 1 ? ' is' : ' are' }} not included in any permission set and will, by default, have <strong>Viewer</strong> access.</span>
                        </span>
                      </div>

                      <div v-for="(permissionSet, index) in permissionSets" :key="permissionSet.id">
                        <div class="permission-set-header">
                          <h6>Permission set {{ index + 1 }}</h6>
                          <div class="form-group">
                            <label>Apps <span class="required">*</span></label>
                            <div class="select-container" v-click-outside="() => handleClickOutside(permissionSet.id)">
                              <div class="select-wrapper">
                                <div class="app-pills">
                                  <span v-for="appId in permissionSet.selectedApps" :key="appId" class="app-pill">
                                    <span class="app-icon">
                                      <Smartphone v-if="getAppType(appId) === 'mobile'" size="14" />
                                      <Monitor v-else size="14" />
                                    </span>
                                    {{ getAppName(appId) }}
                                    <button class="remove-pill" @click.stop="removeApp(appId, permissionSet.id)">×</button>
                                  </span>
                                </div>
                                <input 
                                  type="text" 
                                  :placeholder="getAppInputPlaceholder(permissionSet)"
                                  @focus="() => showAppDropdown(permissionSet.id)"
                                  readonly
                                >
                              </div>
                              <div v-if="openAppDropdowns[permissionSet.id]" class="team-dropdown">
                                <div class="dropdown-search">
                                  <input 
                                    type="text" 
                                    v-model="appFilter"
                                    placeholder="Search apps..."
                                    @click.stop
                                  >
                                </div>
                                
                                <!-- Add quick filter options -->
                                <div class="quick-filters">
                                  <div 
                                    class="filter-option"
                                    @click.stop="selectAllApps(permissionSet.id)"
                                  >
                                    All apps
                                  </div>
                                  <div 
                                    class="filter-option"
                                    @click.stop="selectAppsByType(permissionSet.id, 'web')"
                                  >
                                    Web apps
                                  </div>
                                  <div 
                                    class="filter-option"
                                    @click.stop="selectAppsByType(permissionSet.id, 'mobile')"
                                  >
                                    Mobile apps
                                  </div>
                                </div>

                                <div class="dropdown-divider"></div>

                                <!-- Existing app options -->
                                <div 
                                  v-for="app in filteredApps" 
                                  :key="app.id"
                                  class="team-option"
                                  @click.stop="toggleApp(app, permissionSet.id)"
                                  :class="{ 'disabled': isAppSelectedInOtherSet(app.id, permissionSet.id) }"
                                >
                                  <div class="checkbox-option">
                                    <input 
                                      type="checkbox" 
                                      :checked="permissionSet.selectedApps.includes(app.id)"
                                      @click.stop
                                    >
                                    <span class="app-icon">
                                      <Smartphone v-if="getAppType(app.id) === 'mobile'" size="14" />
                                      <Monitor v-else size="14" />
                                    </span>
                                    <span>{{ app.name }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Role options -->
                          <div class="roles-section">
                            <h6>Roles by category</h6>
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
                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('viewer')"
                                    >
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
                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('resource-center-author')"
                                    >
                                      <div class="checkbox-row">
                                        <input type="checkbox" name="guides" value="resource-center-author">
                                        <span>Resource center author</span>
                                      </div>
                                      <div class="role-details" v-if="showAppRoleDetails">
                                        <div class="role-details-body">
                                          <ul class="permissions-list">
                                            <li class="permission-item">All permissions of a guides viewer</li>
                                            <li class="permission-item">Create and edit resource center content</li>
                                            <li class="permission-item">Manage resource center categories</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </label>
                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('resource-center-publisher')"
                                    >
                                      <div class="checkbox-row">
                                        <input type="checkbox" name="guides" value="resource-center-publisher">
                                        <span>Resource center publisher</span>
                                      </div>
                                      <div class="role-details" v-if="showAppRoleDetails">
                                        <div class="role-details-body">
                                          <ul class="permissions-list">
                                            <li class="permission-item">All permissions of a resource center author</li>
                                            <li class="permission-item">Publish resource center content</li>
                                            <li class="permission-item">Manage resource center publishing workflow</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </label>
                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('creator')"
                                    >
                                      <div class="checkbox-row">
                                        <input type="checkbox" name="guides" value="creator">
                                        <span>Creator</span>
                                      </div>
                                      <div class="role-details" v-if="showAppRoleDetails">
                                        <div class="role-details-body">
                                          <ul class="permissions-list">
                                            <li class="permission-item">All permissions of a guides viewer</li>
                                            <li class="permission-item">Create and edit guides</li>
                                            <li class="permission-item">Share guides with other users</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </label>
                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('publisher')"
                                    >
                                      <div class="checkbox-row">
                                        <input type="checkbox" name="guides" value="publisher">
                                        <span>Publisher</span>
                                      </div>
                                      <div class="role-details" v-if="showAppRoleDetails">
                                        <div class="role-details-body">
                                          <ul class="permissions-list">
                                            <li class="permission-item">All permissions of a guides creator</li>
                                            <li class="permission-item">Publish guides</li>
                                            <li class="permission-item">Manage guide publishing workflow</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </label>
                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('content-editor')"
                                    >
                                      <div class="checkbox-row">
                                        <input type="checkbox" name="guides" value="content-editor">
                                        <span>Content Editor</span>
                                      </div>
                                      <div class="role-details" v-if="showAppRoleDetails">
                                        <div class="role-details-body">
                                          <ul class="permissions-list">
                                            <li class="permission-item">All permissions of a guides viewer</li>
                                            <li class="permission-item">Edit guide content</li>
                                            <li class="permission-item">Manage guide content workflow</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </label>
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
                                    <label 
                                      class="role-option" 
                                      :data-permissions-tooltip="getRolePermissionsTooltip('viewer')"
                                    >
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

                                    <label 
                                      class="role-option"
                                      :data-permissions-tooltip="getRolePermissionsTooltip('editor')"
                                    >
                                      <div class="checkbox-row">
                                        <input type="checkbox" name="tagging" value="editor">
                                        <span>Editor</span>
                                      </div>
                                      <div class="role-details" v-if="showAppRoleDetails">
                                        <div class="role-details-content">
                                          <div class="role-details-body">
                                            <ul class="permissions-list">
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
                       <!-- Add this new div -->
    <div class="add-permission-set">
      <a 
        href="#" 
        class="add-permission-link"
        :class="{ 'disabled': !canAddPermissionSet }"
        :data-tooltip="getAddPermissionSetTooltip"
        @click.prevent="canAddPermissionSet && addPermissionSet()"
      >
        + Add another permission set
      </a>
    </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Start from scratch section -->
          <div v-if="selectedPermission === 'scratch'" class="wizard-card" data-permission="scratch">
            <h3>Select permissions</h3>
            <div class="card-body">
              <div class="form-container">
                <div class="permissions-wrapper">
                  <!-- Subscription section -->
                  <div class="permissions-section">
                    <h4>Subscription level permissions</h4>
                    <p class="section-description">Set permissions for all subscription level features.</p>

                    <div class="roles-section">
                      <h6>Roles by category</h6>
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
                              <label 
                                class="role-option"
                                :data-permissions-tooltip="getRolePermissionsTooltip('segments-viewer')"
                              >
                                <div class="checkbox-row">
                                  <input type="checkbox" name="segments" value="viewer" checked disabled>
                                  <span>Viewer</span>
                                </div>
                                <div v-if="showSubscriptionRoleDetails" class="role-details">
                                  <div class="role-details-content">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">All permissions of a segments and reports editor</li>
                                        <li class="permission-item">Ability to change verification of segments and respond to verification requests.</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </label>
                              <label 
                                class="role-option"
                                :data-permissions-tooltip="getRolePermissionsTooltip('segments-editor')"
                              >
                                <div class="checkbox-row">
                                  <input type="checkbox" name="segments" value="editor">
                                  <span>Editor</span>
                                </div>
                                <div v-if="showSubscriptionRoleDetails" class="role-details">
                                  <div class="role-details-content">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">Create and edit segments</li>
                                        <li class="permission-item">Manage segment settings</li>
                                        <li class="permission-item">Access segment analytics</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </label>
                              <label 
                                class="role-option"
                                :data-permissions-tooltip="getRolePermissionsTooltip('segments-verifier')"
                              >
                                <div class="checkbox-row">
                                  <input type="checkbox" name="segments" value="verifier">
                                  <span>Verifier</span>
                                </div>
                                <div v-if="showSubscriptionRoleDetails" class="role-details">
                                  <div class="role-details-content">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">All permissions of a segments and reports editor</li>
                                        <li class="permission-item">Ability to change verification of segments and respond to verification requests.</li>
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
                              <label class="role-option" :data-permissions-tooltip="getRolePermissionsTooltip('listen-viewer')">
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
                                  <div class="role-details-content">
                                    <div class="role-details-body">
                                      <ul class="permissions-list">
                                        <li class="permission-item">View all feedback items</li>
                                        <li class="permission-item">Access feedback analytics</li>
                                        <li class="permission-item">View visitor votes and interactions</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </label>
                              <label class="role-option" :data-permissions-tooltip="getRolePermissionsTooltip('listen-editor')">
                                <div class="checkbox-row">
                                  <input type="checkbox" name="listen" value="editor">
                                  <span>Editor</span>
                                </div>
                                <div class="role-details" v-if="showSubscriptionRoleDetails">
                                  <div class="role-details-content">
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
                              <label class="role-option" :data-permissions-tooltip="getRolePermissionsTooltip('listen-manager')">
                                <div class="checkbox-row">
                                  <input type="checkbox" name="listen" value="manager">
                                  <span>Manager</span>
                                </div>
                                <div class="role-details" v-if="showSubscriptionRoleDetails">
                                  <div class="role-details-content">
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
                              <label class="role-option" :data-permissions-tooltip="getRolePermissionsTooltip('roadmaps-viewer')">

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
                              <label class="role-option" :data-permissions-tooltip="getRolePermissionsTooltip('roadmaps-editor')">

                                <div class="checkbox-row">
                                  <input type="checkbox" name="roadmaps" value="editor">
                                  <span>Editor</span>
                                </div>
                                <div class="role-details" v-if="showSubscriptionRoleDetails">
                                  <div class="role-details-content">
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
                              <label class="role-option" :data-permissions-tooltip="getRolePermissionsTooltip('roadmaps-manager')">
                                <div class="checkbox-row">
                                  <input type="checkbox" name="roadmaps" value="manager">
                                  <span>Manager</span>
                                </div>
                                <div class="role-details" v-if="showSubscriptionRoleDetails">
                                  <div class="role-details-content">
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

                  <!-- App level section -->
                  <div class="permissions-section">
                    <h4>App level permissions</h4>
                    <p class="section-description">Set permissions for specific apps.</p>
                    
                    <div v-if="unusedApps.length > 0" class="app-info">
                      <span class="info-icon">i</span>
                      <span>
                        <strong class="app-count" :data-tooltip="'Apps: ' + unusedAppsList">{{ unusedApps.length }} {{ unusedApps.length === 1 ? 'app' : 'apps' }}</strong><span class="info-text">{{ unusedApps.length === 1 ? ' is' : ' are' }} not included in any permission set and will, by default, have <strong>Viewer</strong> access.</span>
                      </span>
                    </div>

                    <div v-for="(permissionSet, index) in permissionSets" :key="permissionSet.id">
                      <div class="permission-set-header">
                        <h6>Permission set {{ index + 1 }}</h6>
                        <div class="form-group">
                          <label>Apps <span class="required">*</span></label>
                          <div class="select-container" v-click-outside="() => handleClickOutside(permissionSet.id)">
                            <div class="select-wrapper">
                              <div class="app-pills">
                                <span v-for="appId in permissionSet.selectedApps" :key="appId" class="app-pill">
                                  <span class="app-icon">
                                    <Smartphone v-if="getAppType(appId) === 'mobile'" size="14" />
                                    <Monitor v-else size="14" />
                                  </span>
                                  {{ getAppName(appId) }}
                                  <button class="remove-pill" @click.stop="removeApp(appId, permissionSet.id)">×</button>
                                </span>
                              </div>
                              <input 
                                type="text" 
                                :placeholder="getAppInputPlaceholder(permissionSet)"
                                @focus="() => showAppDropdown(permissionSet.id)"
                                readonly
                              >
                            </div>
                            <div v-if="openAppDropdowns[permissionSet.id]" class="team-dropdown">
                              <div class="dropdown-search">
                                <input 
                                  type="text" 
                                  v-model="appFilter"
                                  placeholder="Search apps..."
                                  @click.stop
                                >
                              </div>
                              
                              <!-- Add quick filter options -->
                              <div class="quick-filters">
                                <div 
                                  class="filter-option"
                                  @click.stop="selectAllApps(permissionSet.id)"
                                >
                                  All apps
                                </div>
                                <div 
                                  class="filter-option"
                                  @click.stop="selectAppsByType(permissionSet.id, 'web')"
                                >
                                  Web apps
                                </div>
                                <div 
                                  class="filter-option"
                                  @click.stop="selectAppsByType(permissionSet.id, 'mobile')"
                                >
                                  Mobile apps
                                </div>
                              </div>

                              <div class="dropdown-divider"></div>

                              <!-- Existing app options -->
                              <div 
                                v-for="app in filteredApps" 
                                :key="app.id"
                                class="team-option"
                                @click.stop="toggleApp(app, permissionSet.id)"
                                :class="{ 'disabled': isAppSelectedInOtherSet(app.id, permissionSet.id) }"
                              >
                                <div class="checkbox-option">
                                  <input 
                                    type="checkbox" 
                                    :checked="permissionSet.selectedApps.includes(app.id)"
                                    @click.stop
                                  >
                                  <span class="app-icon">
                                    <Smartphone v-if="getAppType(app.id) === 'mobile'" size="14" />
                                    <Monitor v-else size="14" />
                                  </span>
                                  <span>{{ app.name }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Role options -->
                        <div class="roles-section">
                          <h6>Roles by category</h6>
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
                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('viewer')"
                                  >
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
                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('resource-center-author')"
                                  >
                                    <div class="checkbox-row">
                                      <input type="checkbox" name="guides" value="resource-center-author">
                                      <span>Resource center author</span>
                                    </div>
                                    <div class="role-details" v-if="showAppRoleDetails">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a guides viewer</li>
                                          <li class="permission-item">Create and edit resource center content</li>
                                          <li class="permission-item">Manage resource center categories</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </label>
                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('resource-center-publisher')"
                                  >
                                    <div class="checkbox-row">
                                      <input type="checkbox" name="guides" value="resource-center-publisher">
                                      <span>Resource center publisher</span>
                                    </div>
                                    <div class="role-details" v-if="showAppRoleDetails">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a resource center author</li>
                                          <li class="permission-item">Publish resource center content</li>
                                          <li class="permission-item">Manage resource center publishing workflow</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </label>
                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('creator')"
                                  >
                                    <div class="checkbox-row">
                                      <input type="checkbox" name="guides" value="creator">
                                      <span>Creator</span>
                                    </div>
                                    <div class="role-details" v-if="showAppRoleDetails">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a guides viewer</li>
                                          <li class="permission-item">Create and edit guides</li>
                                          <li class="permission-item">Share guides with other users</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </label>
                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('publisher')"
                                  >
                                    <div class="checkbox-row">
                                      <input type="checkbox" name="guides" value="publisher">
                                      <span>Publisher</span>
                                    </div>
                                    <div class="role-details" v-if="showAppRoleDetails">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a guides creator</li>
                                          <li class="permission-item">Publish guides</li>
                                          <li class="permission-item">Manage guide publishing workflow</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </label>
                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('content-editor')"
                                  >
                                    <div class="checkbox-row">
                                      <input type="checkbox" name="guides" value="content-editor">
                                      <span>Content Editor</span>
                                    </div>
                                    <div class="role-details" v-if="showAppRoleDetails">
                                      <div class="role-details-body">
                                        <ul class="permissions-list">
                                          <li class="permission-item">All permissions of a guides viewer</li>
                                          <li class="permission-item">Edit guide content</li>
                                          <li class="permission-item">Manage guide content workflow</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </label>
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
                                  <label 
                                    class="role-option" 
                                    :data-permissions-tooltip="getRolePermissionsTooltip('viewer')"
                                  >
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

                                  <label 
                                    class="role-option"
                                    :data-permissions-tooltip="getRolePermissionsTooltip('editor')"
                                  >
                                    <div class="checkbox-row">
                                      <input type="checkbox" name="tagging" value="editor">
                                      <span>Editor</span>
                                    </div>
                                    <div class="role-details" v-if="showAppRoleDetails">
                                      <div class="role-details-content">
                                        <div class="role-details-body">
                                          <ul class="permissions-list">
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
                    <div class="add-permission-set">
                      <a 
                        href="#" 
                        class="add-permission-link"
                        :class="{ 'disabled': !canAddPermissionSet }"
                        :data-tooltip="getAddPermissionSetTooltip"
                        @click.prevent="canAddPermissionSet && addPermissionSet()"
                      >
                        + Add another permission set
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin section -->
          <div v-if="selectedPermission === 'admin'" class="wizard-card" data-permission="admin">
            <h3>Review admin privileges</h3>
            <div class="card-body">
              <div class="form-container">
                <p class="permission-info">
                  Subscription admins have <b>full access</b> to the Pendo Subscription.<br>
                  This includes all Application settings, Guide Settings, and full Analytics capabilities.
                </p>
              </div>
            </div>
          </div>

          <!-- View-only section -->
          <div v-if="selectedPermission === 'view'" class="wizard-card" data-permission="view">
            <h3>Review View-only permissions</h3>
            <div class="card-body">
              <div class="form-container">
                <p class="view-only-info">Users have <b>view-only</b> access to all apps in your subscription.</p>

                <div class="permissions-wrapper">
                  <!-- Apps section wrapper -->
                  <div class="section-wrapper">
                    <div class="section-title">Apps:</div>
                    <div class="app-pills">
                      <span v-for="app in appOptions" :key="app.id" class="app-pill">
                        <span class="app-icon">
                          <Smartphone v-if="getAppType(app.id) === 'mobile'" size="14" />
                          <Monitor v-else size="14" />
                        </span>
                        {{ app.name }}
                      </span>
                    </div>
                  </div>

                  <!-- Roles section wrapper -->
                  <div class="section-wrapper">
                    <div class="section-title">Roles:</div>
                    <div class="role-pills">
                      <span class="role-pill">Guides: Viewer</span>
                      <span class="role-pill">Listen: Viewer</span>
                      <span class="role-pill">Reports: Viewer</span>
                      <span class="role-pill">Roadmaps: Viewer</span>
                      <span class="role-pill">Segments: Viewer</span>
                      <span class="role-pill">Tagging: Viewer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
import { Key, Copy, Pencil, Eye, Check, Smartphone, Monitor } from 'lucide-vue-next'

export default {
  name: 'UserWizard',
  components: {
    Key,
    Copy,
    Pencil,
    Eye,
    Check,
    Smartphone,
    Monitor
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
      teamSearch: '',
      teamFilter: '',
      appFilter: '',
      showTeamDropdown: false,
      selectedTeams: [],
      teamOptions: [
        { id: 1, name: 'Product Team' },
        { id: 2, name: 'Engineering Team' },
        { id: 3, name: 'Marketing Team' },
        { id: 4, name: 'Sales Team' },
        { id: 5, name: 'Customer Success' }
      ],
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
          id: 'view',
          icon: Eye,
          title: 'Make view-only',
          description: 'Give only viewer permissions to all apps in your subscription.'
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
        }
      ],
      showUserDropdown: false,
      userSearch: '',
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
      openAppDropdowns: {},
      appOptions: [
        { id: 1, name: 'iOS app', type: 'mobile' },
        { id: 2, name: 'Android app', type: 'mobile' },
        { id: 3, name: 'Web app', type: 'desktop' },
        { id: 4, name: 'Mobile App' },
        { id: 5, name: 'Web Dashboard' },
        { id: 6, name: 'Analytics Portal' },
        { id: 7, name: 'Customer Portal' },
        { id: 8, name: 'Admin Console' },
        { id: 9, name: 'Marketing Site' },
        { id: 10, name: 'Help Center' },
        { id: 11, name: 'API Gateway' },
        { id: 12, name: 'Sales Platform' },
        { id: 13, name: 'Developer Tools' },
        { id: 14, name: 'Partner Portal' },
        { id: 15, name: 'Internal Tools' },
        { id: 16, name: 'E-commerce Platform' },
        { id: 17, name: 'Support Dashboard' },
        { id: 18, name: 'Billing Portal' },
        { id: 19, name: 'Integration Hub' },
        { id: 20, name: 'Status Page' }
      ],
      permissionSets: [{
        id: Date.now(),
        selectedApps: [],
        roles: {
          guides: [],
          tagging: [],
          segments: [],
          listen: [],
          roadmaps: []
        }
      }],
      showTeamPlaceholder: true,
      // Add new data property for app placeholders
      appPlaceholders: {},
      // Add showSegmentsRoleDetails to data
      showSegmentsRoleDetails: false,
      showTooltipText: false,
      // Add apps data with type property
      apps: [
        { id: 1, name: 'Web App 1', type: 'web' },
        { id: 2, name: 'Web App 2', type: 'web' },
        { id: 3, name: 'Mobile App 1', type: 'mobile' },
        { id: 4, name: 'Mobile App 2', type: 'mobile' },
        { id: 5, name: 'Web App 3', type: 'web' },
        { id: 6, name: 'Mobile App 3', type: 'mobile' },
        { id: 7, name: 'Web App 4', type: 'web' },
        { id: 8, name: 'Mobile App 4', type: 'mobile' },
        { id: 9, name: 'Web App 5', type: 'web' },
        { id: 10, name: 'Mobile App 5', type: 'mobile' }
      ],
    }
  },
  computed: {
    inputPlaceholder() {
      if (!this.showInputPlaceholder) return '';
      return 'Enter emails of users you want to add';
    },
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
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return this.emailSearch && emailRegex.test(this.emailSearch);
    },
    filteredTeams() {
      if (!this.teamFilter) return this.teamOptions;
      const search = this.teamFilter.toLowerCase();
      return this.teamOptions.filter(team => 
        team.name.toLowerCase().includes(search)
      );
    },
    filteredApps() {
      let apps = this.appOptions || [];
      if (this.appFilter) {
        const filter = this.appFilter.toLowerCase();
        apps = apps.filter(app => 
          app.name.toLowerCase().includes(filter)
        );
      }
      return apps;
    },
    canAddPermissionSet() {
      // Get all selected apps across all permission sets
      const selectedApps = this.permissionSets.flatMap(set => set.selectedApps);
      
      // Get total number of available apps
      const totalApps = this.appOptions.length;
      
      // Check if any permission set has apps selected and if there are any apps left to select
      return this.permissionSets.some(set => set.selectedApps.length > 0) && 
             selectedApps.length < totalApps;
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

      // If scratch option is selected, check if at least one app is selected in any permission set
      if (this.selectedPermission === 'scratch') {
        const hasSelectedApps = this.permissionSets.some(set => set.selectedApps.length > 0);
        if (!hasSelectedApps) {
          return false;
        }
      }

      return true;
    },
    unusedApps() {
      const selectedAppIds = this.permissionSets.flatMap(set => set.selectedApps);
      return this.appOptions.filter(app => !selectedAppIds.includes(app.id));
    },
    unusedAppsList() {
      return this.unusedApps.map(app => app.name).join(', ');
    },
    getAddPermissionSetTooltip() {
      // If no permission set has apps selected
      if (!this.permissionSets.some(set => set.selectedApps.length > 0)) {
        return 'Select apps in the current permission set to add another';
      }
      
      // If all apps are selected
      const selectedApps = this.permissionSets.flatMap(set => set.selectedApps);
      if (selectedApps.length >= this.appOptions.length) {
        return 'All apps are already in a permission set';
      }
      
      return '';
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
    selectPermission(permissionId) {
      this.selectedPermission = permissionId;

      // Add smooth scroll for all permission selections
      if (permissionId === 'view' || permissionId === 'admin' || permissionId === 'copy' || permissionId === 'scratch') {
        this.$nextTick(() => {
          setTimeout(() => {
            const wizardContent = document.querySelector('.wizard-content');
            if (wizardContent) {
              const currentCard = document.querySelector(`[data-permission="${permissionId}"]`);
              if (currentCard) {
                const scrollTarget = currentCard.offsetTop - 20;
                wizardContent.scrollTo({
                  top: scrollTarget,
                  behavior: 'smooth'
                });
              }
            }
          }, 300);
        });
      }
    },
    selectTeam(team) {
      if (!this.selectedTeams.includes(team.id)) {
        this.selectedTeams.push(team.id);
      } else {
        // If already selected, remove it
        const index = this.selectedTeams.indexOf(team.id);
        if (index > -1) {
          this.selectedTeams.splice(index, 1);
        }
      }
    },
    removeTeam(teamId) {
      this.selectedTeams = this.selectedTeams.filter(id => id !== teamId);
    },
    selectUser(user) {
      this.selectedUser = user;
      this.showUserDropdown = false;
      this.handleUserSelected(user);

      // Add delay before scrolling down
      setTimeout(() => {
        const wizardContent = document.querySelector('.wizard-content');
        if (wizardContent) {
          const currentScroll = wizardContent.scrollTop;
          wizardContent.scrollTo({
            top: currentScroll + 450, // Changed from 300 to 450
            behavior: 'smooth'
          });
        }
      }, 300);
    },
    filterUsers() {
      this.showUserDropdown = true;
    },
    toggleSubscriptionRoleDetails() {
      this.showSubscriptionRoleDetails = !this.showSubscriptionRoleDetails;
    },
    toggleAppRoleDetails() {
      // Toggle all role details sections
      this.showAppRoleDetails = !this.showAppRoleDetails;
      this.showSegmentsRoleDetails = this.showAppRoleDetails;
    },
    toggleApp(app, permissionSetId) {
      if (this.isAppSelectedInOtherSet(app.id, permissionSetId)) {
        return;
      }

      const permissionSet = this.permissionSets.find(set => set.id === permissionSetId);
      if (!permissionSet) return;

      const index = permissionSet.selectedApps.indexOf(app.id);
      if (index === -1) {
        permissionSet.selectedApps.push(app.id);
      } else {
        permissionSet.selectedApps.splice(index, 1);
      }
      
      // Update placeholder visibility after toggling
      this.appPlaceholders[permissionSetId] = !permissionSet.selectedApps.length;
    },
    removeApp(appId, permissionSetId) {
      const permissionSet = this.permissionSets.find(set => set.id === permissionSetId);
      if (permissionSet) {
        permissionSet.selectedApps = permissionSet.selectedApps.filter(id => id !== appId);
      }
    },
    closeTeamDropdown() {
      this.showTeamDropdown = false;
      this.showTeamPlaceholder = this.selectedTeams.length === 0;
    },
    showAppDropdown(permissionSetId) {
      this.openAppDropdowns[permissionSetId] = true;
      this.appPlaceholders[permissionSetId] = true;
    },
    closeAppDropdown(permissionSetId) {
      this.openAppDropdowns[permissionSetId] = false;
    },
    handleClickOutside(permissionSetId) {
      this.openAppDropdowns[permissionSetId] = false;
      // Update placeholder visibility based on selected apps
      const permissionSet = this.permissionSets.find(set => set.id === permissionSetId);
      this.appPlaceholders[permissionSetId] = !permissionSet?.selectedApps?.length;
    },
    addPermissionSet() {
      this.permissionSets.push({
        id: Date.now(),
        selectedApps: [],
        roles: {},
        number: this.permissionSets.length + 1
      });

      // Scroll to new permission set
      this.$nextTick(() => {
        setTimeout(() => {
          const wizardContent = document.querySelector('.wizard-content');
          if (wizardContent) {
            wizardContent.scrollBy({
              top: 450,
              behavior: 'smooth'
            });
          }
        }, 100);
      });
    },
    getUnselectedAppsCount(permissionSet) {
      if (!permissionSet || !permissionSet.selectedApps) return this.appOptions.length;
      return this.appOptions.length - permissionSet.selectedApps.length;
    },
    getUnselectedAppsTooltip(permissionSet) {
      if (!permissionSet || !permissionSet.selectedApps) {
        return 'Apps: ' + this.appOptions.map(app => app.name).join(', ');
      }
      const unselectedApps = this.appOptions
        .filter(app => !permissionSet.selectedApps.includes(app.id))
        .map(app => app.name)
        .join(', ');
      return `Apps: ${unselectedApps}`;
    },
    inviteUser() {
      // Add null checks and default values
      const invitedUsers = this.selectedEmails.map(email => {
        // Create base user object
        const user = {
          email,
          permissionSets: this.permissionSets.map(set => ({
            apps: [...(set.selectedApps || [])],
            roles: {
              guides: [...(set.roles.guides || [])],
              tagging: [...(set.roles.tagging || [])],
              segments: [...(set.roles.segments || [])],
              listen: [...(set.roles.listen || [])],
              roadmaps: [...(set.roles.roadmaps || [])]
            }
          })),
          selectedTeams: [...(this.selectedTeams || [])],
          isAdmin: this.selectedPermission === 'admin'
        };

        return user;
      });

      this.$emit('users-invited', invitedUsers);
      this.close();
    },
    resetForm() {
      this.permissionSets = [{
        id: Date.now(),
        selectedApps: [],
        roles: {
          guides: [],
          tagging: [],
          segments: [],
          listen: [],
          roadmaps: []
        }
      }];
      this.selectedEmails = [];
      this.selectedTeams = [];
      this.selectedPermission = null;
      this.selectedUser = null;
    },
    isAppSelectedInOtherSet(appId, currentSetId) {
      return this.permissionSets.some(set => 
        set.id !== currentSetId && set.selectedApps.includes(appId)
      );
    },
    handleUserSelected(selectedUser) {
      if (!selectedUser) return;

      // Initialize permission set with preselected roles
      this.permissionSets = [{
        id: Math.random(),
        selectedApps: this.getRandomApps(3), // Select 3 random apps
        roles: {
          segments: ['verifier'],
          listen: ['editor'],
          roadmaps: ['manager'],
          guides: ['publisher'],
          tagging: ['editor']
        }
      }];

      // Check all the appropriate role checkboxes
      this.$nextTick(() => {
        // Preselect subscription level roles
        const subscriptionRoles = [
          { category: 'segments', value: 'verifier' },
          { category: 'listen', value: 'editor' },
          { category: 'roadmaps', value: 'manager' }
        ];

        // Preselect app level roles
        const appRoles = [
          { category: 'guides', value: 'publisher' },
          { category: 'tagging', value: 'editor' }
        ];

        // Check all role checkboxes
        [...subscriptionRoles, ...appRoles].forEach(({ category, value }) => {
          const checkbox = document.querySelector(`input[name="${category}"][value="${value}"]`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      });
    },

    // Helper method to get random apps
    getRandomApps(count) {
      const availableApps = [...this.appOptions];
      const selectedApps = [];
      
      while (selectedApps.length < count && availableApps.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableApps.length);
        const [app] = availableApps.splice(randomIndex, 1);
        selectedApps.push(app.id);
      }
      
      return selectedApps;
    },

    // Helper method to handle role changes
    handleRoleChange({ target, permissionSetId, category, roleType }) {
      const permissionSet = this.permissionSets.find(set => set.id === permissionSetId);
      if (!permissionSet) return;

      if (target.checked) {
        if (!permissionSet.roles[category].includes(roleType)) {
          permissionSet.roles[category].push(roleType);
        }
      } else {
        const index = permissionSet.roles[category].indexOf(roleType);
        if (index > -1) {
          permissionSet.roles[category].splice(index, 1);
        }
      }
    },
    getAppInputPlaceholder(permissionSet) {
      return this.appPlaceholders[permissionSet.id] ? 'Select apps to set permissions for' : '';
    },
    getAppName(appId) {
      const app = this.appOptions.find(a => a.id === appId);
      return app ? app.name : '';
    },
    getAppType(appId) {
      const app = this.apps.find(a => a.id === appId);
      return app ? app.type : 'web'; // Return web as default if app not found
    },
    handleTeamFocus() {
      this.showTeamDropdown = true;
      this.showTeamPlaceholder = true;
    },
    handleTeamBlur() {
      setTimeout(() => {
        this.showTeamPlaceholder = this.selectedTeams.length === 0;
      }, 100);
    },
    getRolePermissionsTooltip(roleValue) {
      const tooltips = {
        viewer: {
          title: 'Guides: Viewer',
          permissions: [
            'View all guides and resource center content',
            'Access guide analytics',
            'View guide settings'
          ]
        },
        creator: {
          title: 'Guides: Creator',
          permissions: [
            'All permissions of a guides viewer',
            'Create and edit guides',
            'Share guides with other users'
          ]
        },
        publisher: {
          title: 'Guides: Publisher',
          permissions: [
            'All permissions of a guides creator',
            'Publish guides',
            'Manage guide publishing workflow'
          ]
        },
        'content-editor': {
          title: 'Guides: Content Editor',
          permissions: [
            'All permissions of a guides viewer',
            'Edit guide content',
            'Manage guide content workflow'
          ]
        },
        editor: {
          title: 'Guides: Editor',
          permissions: [
            'All permissions of a guides viewer',
            'Create and edit guides',
            'Manage guide settings'
          ]
        },
        'segments-viewer': {
          title: 'Segments: Viewer',
          permissions: [
            'Can view segments.',
            'Can view reports.'
          ]
        },
        'segments-editor': {
          title: 'Segments: Editor',
          permissions: [
            'Create and edit segments',
            'Manage segment settings',
            'Access segment analytics'
          ]
        },
        'segments-verifier': {
          title: 'Segments: Verifier',
          permissions: [
            'All permissions of a segments and reports editor',
            'Ability to change verification of segments and respond to verification requests.'
          ]
        },
        'listen-viewer': {
          title: 'Listen: Viewer',
          permissions: [
            'View all feedback items',
            'Access feedback analytics',
            'View visitor votes and interactions'
          ]
        },
        'listen-editor': {
          title: 'Listen: Editor',
          permissions: [
            'All permissions of a listen editor',
            'Manage feedback settings',
            'Delete any feedback items',
            'Edit any feedback items'
          ]
        },
        'listen-manager': {
          title: 'Listen: Manager',
          permissions: [
            'All permissions of a listen editor',
            'Manage feedback settings',
            'Delete any feedback items',
            'Edit any feedback items'
          ]
        },
        'roadmaps-viewer': {
          title: 'Roadmaps: Viewer',
          permissions: [
            'View all roadmaps',
            'Access roadmap analytics',
            'View roadmap settings'
          ]
        },
        'roadmaps-editor': {
          title: 'Roadmaps: Editor',
          permissions: [
            'View all roadmaps',
            'Access roadmap analytics',
            'View roadmap settings'
          ]
        },
        'roadmaps-manager': {
          title: 'Roadmaps: Manager',
          permissions: [
            'All permissions of a roadmaps editor',
            'Manage roadmap settings',
            'Control roadmap visibility',
            'Delete any roadmaps'
          ]
        }
      };

      const role = tooltips[roleValue];
      if (!role) return null;

      return `${role.title}\n${role.permissions.map(p => `• ${p}`).join('\n')}`;
    },
    getRoleTooltip(roleValue) {
      const tooltips = {
        viewer: 'View all guides and resource center content',
        'resource-center-author': 'Create and edit resource center content',
        'resource-center-publisher': 'Publish and manage resource center content',
        creator: 'Create and edit guides',
        publisher: 'Publish and manage guide workflow',
        'content-editor': 'Edit guide content',
        editor: 'Edit and manage settings'
      };
      return tooltips[roleValue];
    },
    showTooltip() {
      if (!this.canAddPermissionSet) {
        this.showTooltipText = true;
      }
    },
    hideTooltip() {
      this.showTooltipText = false;
    },
    // Add methods for handling quick filters
    selectAllApps(permissionSetId) {
      const permissionSet = this.permissionSets.find(set => set.id === permissionSetId);
      if (permissionSet) {
        const availableApps = this.appOptions.filter(app => 
          !this.isAppSelectedInOtherSet(app.id, permissionSetId)
        );
        permissionSet.selectedApps = availableApps.map(app => app.id);
      }
      this.openAppDropdowns[permissionSetId] = false;
    },

    selectAppsByType(permissionSetId, type) {
      const permissionSet = this.permissionSets.find(set => set.id === permissionSetId);
      if (permissionSet) {
        // Select all apps of specified type from appOptions
        const availableApps = this.appOptions.filter(app => 
          this.getAppType(app.id) === type && 
          !this.isAppSelectedInOtherSet(app.id, permissionSetId)
        );
        permissionSet.selectedApps = availableApps.map(app => app.id);
      }
      this.openAppDropdowns[permissionSetId] = false;
    },

    // Helper method to get app type
    getAppType(appId) {
      const app = this.apps.find(a => a.id === appId);
      return app ? app.type : 'web'; // Return web as default if app not found
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
    },
    selectedUser(newUser) {
      if (newUser && this.selectedPermission === 'copy') {
        this.handleUserSelected(newUser);
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
  },
  created() {
    // Initialize app placeholders
    this.permissionSets.forEach(set => {
      this.appPlaceholders[set.id] = true;
    });
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
  background: #128297;
  border: 1px solid #128297;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.invite-button:hover {
  background: #0F6B7B;
}

.invite-button:disabled {
  background: #E2E8F0;
  border-color: #E2E8F0;
  color: #A0AEC0;
  cursor: not-allowed;
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
  max-height: 320px;
  height: auto;
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
  position: relative;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  background: white;
  min-height: 36px; /* Reduced from 40px */
  padding: 4px 8px;
  cursor: pointer;
  display: flex; /* Added */
  align-items: center; /* Added */
  flex-wrap: wrap; /* Added */
  gap: 4px; /* Added */
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select-wrapper input {
  border: none;
  outline: none;
  padding: 4px;
  min-width: 120px; /* Added */
  width: auto; /* Changed from 100% */
  font-size: 14px;
  color: #2D3748;
  background: transparent;
  flex: 1; /* Added */
}

.select-wrapper:focus-within {
  border-color: #128297;
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

.team-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 320px;
  height: auto;
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
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: #4A5568;
}

.permission-options + .form-container {
  padding: 0 24px 24px;
}

.permissions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0px;
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
  margin-top: 24px;
}

.roles-section h6 {
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
  margin: 0 0 16px 0;
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
  cursor: pointer;
}

.role-option:has(input:checked) {
  background: white;
  border-color: #128297;
}

.role-option input[type="checkbox"] {
  accent-color: #128297; /* Restore teal color */
  flex: none;
  margin: 0;
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

.info-text {
  color: #2D3748;
}

.app-count {
  cursor: help;
  position: relative;
  color: #128297;
  font-weight: bold;
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
  font-weight: normal;
  border-radius: 4px;
  white-space: normal;
  width: 300px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;
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
  z-index: 1000;
}

.app-count:hover[data-tooltip]::before,
.app-count:hover[data-tooltip]::after {
  opacity: 1;
  visibility: visible;
}

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

/* Add styles for search input */
.dropdown-search {
  padding: 8px;
  border-bottom: 1px solid #E2E8F0;
}

.dropdown-search input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.dropdown-search input:focus {
  border-color: #128297;
}

/* Update tooltip styles for disabled viewer options */
.role-option[data-tooltip] {
  position: relative;
}

.role-option[data-tooltip]:hover::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background-color: #000000;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
}

.role-option[data-tooltip]:hover::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #000000 transparent transparent transparent;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
}

/* Update permission set divider styles */
.permission-set-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 32px 0 0;
  padding: 0;
}

.divider-container {
  width: 100%;
}

.divider-line {
  width: 100%;
  height: 1px;
  background: #E2E8F0;
}

.add-permission-set {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: center;
}

.add-permission-link {
  color: #128297;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.add-permission-link:hover {
  text-decoration: underline;
}

/* Add disabled state styles */
.add-permission-link.disabled {
  color: #A0AEC0;
  cursor: not-allowed;
  pointer-events: auto; /* Override the previous none value */
}

.add-permission-link.disabled:hover {
  text-decoration: none;
}

/* Add styles for multiple permission sets */
.permission-sets-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.team-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.team-option.disabled:hover {
  background: none;
}

.team-option.disabled .checkbox-option {
  cursor: not-allowed;
}

.team-option.disabled input[type="checkbox"] {
  cursor: not-allowed;
}

/* Add styles for permission set titles */
.permission-set-title {
  font-size: 14px;
  font-weight: 500;
  color: #2D3748;
  margin: 24px 0 16px;
}

.add-permission-set.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-permission-set[data-tooltip] {
  position: relative;
}

.add-permission-set[data-tooltip]:hover::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #000000;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  visibility: visible;
}

.add-permission-set[data-tooltip]:hover::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #000000 transparent transparent transparent;
  z-index: 1000;
  visibility: visible;
}

.app-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}

.app-pill {
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

.app-pill .remove-pill {
  background: none;
  border: none;
  padding: 0;
  color: #4A5568;  /* Changed from #2C5282 */
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-pill .remove-pill:hover {
  color: #2D3748;  /* Changed from #1A365D */
}

.select-wrapper {
  position: relative;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  background: white;
  min-height: 40px;
  padding: 4px 8px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select-wrapper input {
  border: none;
  outline: none;
  width: 100%;
  padding: 4px;
  padding-right: 24px; /* Add space for the arrow */
  font-size: 14px;
  color: #2D3748;
  background: transparent;
}

.select-wrapper:focus-within {
  border-color: #128297;
}

.view-only-info {
  font-size: 14px;
  color: #2D3748;
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 4px; /* Reduced from 12px */
}

.role-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #4A5568;
}

/* Update app-pills for view-only section */
.view-only-info + .permissions-wrapper .app-pill {
  padding: 4px 8px;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #4A5568;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 4px; /* Reduced from 12px */
}

.app-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 4px 16px 4px; /* Bottom padding for space between sections */
}

.role-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}



.section-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Spacing between title and pills */
}

/* Update spacing between sections */
.permissions-wrapper > *:not(:last-child) {
  margin-bottom: 0px;
}

.app-icon {
  display: flex;
  align-items: center;
  color: #4A5568;
  font-size: 12px;
}

/* Add this if you're not using Font Awesome */
.app-icon svg {
  width: 14px;
  height: 14px;
  stroke-width: 1.5px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.checkbox-option .app-icon {
  display: flex;
  align-items: center;
  color: #4A5568;
}

.checkbox-option .app-icon svg {
  width: 14px;
  height: 14px;
  stroke-width: 1.5px;
}

/* Update the gap for app dropdown checkbox options */
.team-dropdown .checkbox-option {
  display: flex;
  align-items: center;
  width: 100%;
}

.team-dropdown .checkbox-option input[type="checkbox"] {
  margin: 0 4px 0 0;
  flex: 0 0 16px;
}

.team-dropdown .checkbox-option .app-icon {
  margin: 0 4px 0 0;
  display: flex;
  align-items: center;
}



.team-dropdown .checkbox-option .app-icon svg {
  width: 14px;
  height: 14px;
  stroke-width: 1.5px;
}

/* Remove any gap properties from parent styles */
.checkbox-option {
  display: flex;
  align-items: center;
  width: 100%;
}

/* Update role option styles */
.role-option {
  flex: 0 0 calc(33.333% - 34px);
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #2D3748;
  background: white;
  cursor: pointer;
}

/* Fix checkbox row spacing */
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.checkbox-row input[type="checkbox"] {
  margin: 0;
  flex: 0 0 16px;
  height: 16px;
}

.checkbox-row span {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Remove conflicting styles */
.role-option input[type="checkbox"] {
  flex: none;
}

.role-option span {
  flex: none;
}

/* Remove extra spacing under app pills */
.app-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}

/* Keep other app-pills styles consistent */
.view-only-info + .permissions-wrapper .app-pills {
  padding: 4px;
}

.role-option:has(input:checked) {
  background: white;
  border-color: #128297;
}

.role-details {
  margin-top: 12px;
  padding: 12px;
  background: #F7FAFC;
  border-radius: 4px;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  color: #4A5568;
}

.permission-item {
  margin-bottom: 8px;
  line-height: 1.4;
}

.permission-item:last-child {
  margin-bottom: 0;
}

.permission-item.inherited {
  color: #718096;
}

.permission-item.inherited em {
  font-style: italic;
  color: #4A5568;
}

.roles-section {
  position: relative;
}

.expand-link {
  position: absolute;
  right: 0;
  top: 0;
  color: #128297;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.expand-link:hover {
  text-decoration: underline;
}

/* Update role details structure */
.role-details {
  margin-top: 12px;
  padding: 12px;
  border-radius: 4px;
  background: white;
  border-top: 1px dashed #E2E8F0;
}

.role-details-content {
  display: flex;
  flex-direction: column;
}

.role-details-body {
  padding: 0;
}

/* Add tooltip styles for role options */
.role-option[data-role-tooltip] {
  position: relative;
}

.role-option[data-role-tooltip]:hover::before {
  content: attr(data-role-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 12px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #4A5568;
  white-space: pre-line;
  width: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.role-option[data-role-tooltip]:hover::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: white transparent transparent transparent;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
  z-index: 1000;
}

/* Add tooltip styles for permissions */
.role-option[data-permissions-tooltip] {
  position: relative;
  cursor: pointer;
}

.role-option[data-permissions-tooltip]::before {
  content: attr(data-permissions-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 12px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  color: #4A5568;
  white-space: pre-line;
  width: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.role-option[data-permissions-tooltip]:hover::before,
.role-option[data-permissions-tooltip]:hover::after {
  opacity: 1;
  visibility: visible;
}

/* Add this CSS rule to hide tooltips when roles are expanded */
.role-option[data-permissions-tooltip]::before,
.role-option[data-permissions-tooltip]::after {
  display: none;
}

/* Show tooltips only when roles are collapsed */
.role-option[data-permissions-tooltip]:not(:has(.role-details))::before,
.role-option[data-permissions-tooltip]:not(:has(.role-details))::after {
  display: block;
}

/* Add styles for the permission set link */
.add-permission-set {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.add-permission-link {
  color: #128297;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.add-permission-link:hover {
  text-decoration: underline;
}

/* Add these styles */
.add-permission-set {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.add-permission-link {
  color: #128297;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.add-permission-link:hover {
  text-decoration: underline;
}

.permission-set-header h5 {
  font-size: 16px;
  font-weight: 600;
  color: #2D3748;
  margin: 0 0 16px 0;
}

/* Add tooltip styles */
.add-permission-link.disabled[data-tooltip] {
  position: relative;
}

.add-permission-link.disabled[data-tooltip]:hover::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #000000;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  pointer-events: none;
}

.add-permission-link.disabled[data-tooltip]:hover::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #000000 transparent transparent transparent;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  pointer-events: none;
}

/* Add base states for tooltip */
.add-permission-link.disabled[data-tooltip]::before,
.add-permission-link.disabled[data-tooltip]::after {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

/* Update tooltip styles */
.add-permission-set .add-permission-link[data-tooltip] {
  position: relative;
  display: inline-block;
}

.add-permission-set .add-permission-link[data-tooltip]::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #000000;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.add-permission-set .add-permission-link[data-tooltip]::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #000000 transparent transparent transparent;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.add-permission-set .add-permission-link[data-tooltip]:hover::before,
.add-permission-set .add-permission-link[data-tooltip]:hover::after {
  opacity: 1;
  visibility: visible;
}

/* Add tooltip styles */
.add-permission-set {
  position: relative;
  display: flex;
  justify-content: center;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #000000;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #000000 transparent transparent transparent;
}

/* Update styles for both h6 headings */
.roles-section h6,
.permission-set-header h6 {
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
  margin: 0 0 16px 0;
}

/* Remove any existing h5 styles */
.permission-set-header h5,
.roles-section h5 {
  display: none;
}

/* Add this style for disabled viewer checkboxes */
.checkbox-row input[type="checkbox"]:disabled + span {
  color: #6a6c75;  /* Light gray color */
}

/* Update existing styles */
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.checkbox-row input[type="checkbox"] {
  margin: 0;
  flex: 0 0 16px;
  height: 16px;
}

.checkbox-row span {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Add styles for quick filters */
.quick-filters {
  padding: 8px 0;
}

.filter-option {
  padding: 8px 12px;
  color: #128297;
  font-size: 14px;
  cursor: pointer;
}

.filter-option:hover {
  background: #F7FAFC;
}

.dropdown-divider {
  height: 1px;
  background: #E2E8F0;
  margin: 0;
}
</style> 