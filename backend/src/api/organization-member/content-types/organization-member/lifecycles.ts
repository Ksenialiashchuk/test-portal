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
  const orgMember = await strapi.query('api::organization-member.organization-member').findOne({
    where: { id: result.id },
    populate: ['user'],
  });

  if (!orgMember || orgMember.role !== 'manager') return;

  const managerRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { name: 'Manager' } });

  if (!managerRole) return;

  const user = await strapi
    .query('plugin::users-permissions.user')
    .findOne({
      where: { id: orgMember.user.id },
      populate: ['role'],
    });

  if (!user) return;

  if (user.role?.name === 'Admin' || user.role?.name === 'Manager') return;

  await strapi.query('plugin::users-permissions.user').update({
    where: { id: user.id },
    data: { role: managerRole.id },
  });
}
