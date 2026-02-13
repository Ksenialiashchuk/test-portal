export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/missions/:id/assign',
      handler: 'api::mission.custom-mission.assignUser',
      config: {
        policies: ['api::mission.is-admin-or-manager'],
      },
    },
    {
      method: 'GET',
      path: '/missions/:id/participants',
      handler: 'api::mission.custom-mission.getParticipants',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/missions/:id/participants/:userId',
      handler: 'api::mission.custom-mission.removeParticipant',
      config: {
        policies: ['api::mission.is-admin-or-manager'],
      },
    },
    {
      method: 'POST',
      path: '/missions/:id/assign-organization',
      handler: 'api::mission.custom-mission.assignOrganization',
      config: {
        policies: ['api::mission.is-admin-or-manager'],
      },
    },
  ],
};
