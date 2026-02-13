export default async (policyContext, config, { strapi }) => {
  const user = policyContext.state?.user;
  if (!user) return false;

  const userWithRole = await strapi.query('plugin::users-permissions.user').findOne({
    where: { id: user.id },
    populate: ['role'],
  });

  const roleName = userWithRole?.role?.name;
  return roleName === 'Admin' || roleName === 'Manager';
};
