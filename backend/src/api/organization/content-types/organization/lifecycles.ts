export default {
  async afterCreate(event) {
    const { result } = event;
    await assignManagerRole(result);
  },

  async afterUpdate(event) {
    const { result } = event;
    await assignManagerRole(result);
  },
};

async function assignManagerRole(result) {
  const org = await strapi.query('api::organization.organization').findOne({
    where: { id: result.id },
    populate: ['manager'],
  });

  if (!org?.manager) return;

  const managerRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { name: 'Manager' } });

  if (!managerRole) return;

  const user = await strapi
    .query('plugin::users-permissions.user')
    .findOne({
      where: { id: org.manager.id },
      populate: ['role'],
    });

  if (!user) return;

  if (user.role?.name === 'Admin' || user.role?.name === 'Manager') return;

  await strapi.query('plugin::users-permissions.user').update({
    where: { id: user.id },
    data: { role: managerRole.id },
  });
}
