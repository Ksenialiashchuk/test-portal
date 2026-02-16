export default async (policyContext, config, { strapi }) => {
  const user = policyContext.state?.user;
  if (!user) return false;

  const userWithRole = await strapi.query('plugin::users-permissions.user').findOne({
    where: { id: user.id },
    populate: ['role'],
  });

  if (userWithRole?.role?.name === 'Admin') {
    return true;
  }

  const orgId = policyContext.params?.id;
  if (!orgId) return false;

  const org = await strapi.query('api::organization.organization').findOne({
    where: { documentId: orgId },
  });

  if (!org) return false;

  const orgMember = await strapi.query('api::organization-member.organization-member').findOne({
    where: {
      organization: org.id,
      user: user.id,
      role: 'manager',
    },
  });

  return !!orgMember;
};
