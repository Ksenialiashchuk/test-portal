export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/organizations/:id/members',
      handler: 'api::organization.custom-organization.getMembers',
      config: {
        policies: ['api::organization.is-org-manager'],
      },
    },
    {
      method: 'POST',
      path: '/organizations/:id/members',
      handler: 'api::organization.custom-organization.addMember',
      config: {
        policies: ['api::organization.is-org-manager'],
      },
    },
    {
      method: 'DELETE',
      path: '/organizations/:id/members/:userId',
      handler: 'api::organization.custom-organization.removeMember',
      config: {
        policies: ['api::organization.is-org-manager'],
      },
    },
  ],
};