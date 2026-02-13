export default {

  async bootstrap({ strapi }) {
    const existingRoles = await strapi
      .query('plugin::users-permissions.role')
      .findMany();

    const roleNames = existingRoles.map((r) => r.name);

    if (!roleNames.includes('Admin')) {
      await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Admin',
          description: 'Global admin with full access',
          type: 'admin',
        },
      });
      console.log('Created Admin role');
    }

    if (!roleNames.includes('Manager')) {
      await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Manager',
          description: 'Global manager role',
          type: 'manager',
        },
      });
      console.log('Created Manager role');
    }

    if (!roleNames.includes('Reporter')) {
      await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Reporter',
          description: 'Read-only access',
          type: 'reporter',
        },
      });
      console.log('Created Reporter role');
    }

    const allRoles = await strapi
      .query('plugin::users-permissions.role')
      .findMany();

    const adminRole = allRoles.find((r) => r.name === 'Admin');
    const managerRole = allRoles.find((r) => r.name === 'Manager');
    const authenticatedRole = allRoles.find((r) => r.name === 'Authenticated');

    const orgCrud = [
      'api::organization.organization.find',
      'api::organization.organization.findOne',
      'api::organization.organization.create',
      'api::organization.organization.update',
      'api::organization.organization.delete',
    ];
    const orgCustom = [
      'api::organization.custom-organization.getMembers',
      'api::organization.custom-organization.addMember',
      'api::organization.custom-organization.removeMember',
    ];
    const missionCrud = [
      'api::mission.mission.find',
      'api::mission.mission.findOne',
      'api::mission.mission.create',
      'api::mission.mission.update',
      'api::mission.mission.delete',
    ];
    const missionCustom = [
      'api::mission.custom-mission.assignUser',
      'api::mission.custom-mission.getParticipants',
      'api::mission.custom-mission.removeParticipant',
      'api::mission.custom-mission.assignOrganization',
    ];
    const missionUserCrud = [
      'api::mission-user.mission-user.find',
      'api::mission-user.mission-user.findOne',
      'api::mission-user.mission-user.create',
      'api::mission-user.mission-user.update',
      'api::mission-user.mission-user.delete',
    ];
    const taskCrud = [
      'api::task.task.find',
      'api::task.task.findOne',
      'api::task.task.create',
      'api::task.task.update',
      'api::task.task.delete',
    ];
    const userPermissions = [
      'plugin::users-permissions.user.me',
      'plugin::users-permissions.user.find',
      'plugin::users-permissions.user.findOne',
    ];
    const adminUserExtra = [
      'plugin::users-permissions.user.update',
      'plugin::users-permissions.role.find',
    ];
    const userMeOnly = [
      'plugin::users-permissions.user.me',
    ];

    const adminActions = [
      ...orgCrud, ...orgCustom,
      ...missionCrud, ...missionCustom,
      ...missionUserCrud,
      ...taskCrud,
      ...userPermissions,
      ...adminUserExtra,
    ];

    const managerActions = [
      'api::organization.organization.find',
      'api::organization.organization.findOne',
      'api::organization.organization.update',
      ...orgCustom,
      ...missionCrud, ...missionCustom,
      ...missionUserCrud,
      ...taskCrud,
      ...userPermissions,
    ];

    const authenticatedActions = [
      'api::organization.organization.find',
      'api::organization.organization.findOne',
      'api::mission.mission.find',
      'api::mission.mission.findOne',
      'api::mission-user.mission-user.find',
      'api::mission-user.mission-user.findOne',
      'api::task.task.find',
      'api::task.task.findOne',
      ...userMeOnly,
    ];

    async function ensurePermissions(role, actions: string[]) {
      if (!role) return;

      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({
          where: { role: role.id },
        });

      const existingActions = existing.map((p) => p.action);

      for (const action of actions) {
        if (!existingActions.includes(action)) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: role.id,
            },
          });
        }
      }
    }

    await ensurePermissions(adminRole, adminActions);
    await ensurePermissions(managerRole, managerActions);
    await ensurePermissions(authenticatedRole, authenticatedActions);

    const publicRole = allRoles.find((r) => r.name === 'Public');
    if (publicRole) {
      await ensurePermissions(publicRole, [
        'plugin::users-permissions.auth.callback',
        'plugin::users-permissions.auth.register',
      ]);
    }

    console.log('Bootstrap completed - roles and permissions initialized');
  },
};
