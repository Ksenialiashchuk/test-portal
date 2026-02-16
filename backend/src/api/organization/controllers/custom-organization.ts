export default {
  async getMembers(ctx) {
    const { id } = ctx.params;

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: id },
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    const orgMembers = await strapi.query('api::organization-member.organization-member').findMany({
      where: { organization: org.id },
      populate: ['user'],
    });

    ctx.body = {
      data: orgMembers.map((om) => ({
        user: om.user,
        role: om.role,
      })),
    };
  },

  async addMember(ctx) {
    const { id } = ctx.params;
    const { userId, role } = ctx.request.body;

    if (!userId) {
      return ctx.badRequest('userId is required');
    }

    if (!role || !['manager', 'employee'].includes(role)) {
      return ctx.badRequest('role must be "manager" or "employee"');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
    });

    if (!user) {
      return ctx.notFound('User not found');
    }

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: id },
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    const existing = await strapi.query('api::organization-member.organization-member').findOne({
      where: {
        organization: org.id,
        user: userId,
      },
    });

    if (existing) {
      return ctx.badRequest('User is already a member of this organization');
    }

    const orgMember = await strapi.query('api::organization-member.organization-member').create({
      data: {
        organization: org.id,
        user: userId,
        role,
      },
      populate: ['user', 'organization'],
    });

    ctx.body = {
      data: orgMember,
    };
  },

  async removeMember(ctx) {
    const { id, userId } = ctx.params;

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: id },
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    const orgMember = await strapi.query('api::organization-member.organization-member').findOne({
      where: {
        organization: org.id,
        user: parseInt(userId, 10),
      },
    });

    if (!orgMember) {
      return ctx.notFound('User is not a member of this organization');
    }

    await strapi.query('api::organization-member.organization-member').delete({
      where: { id: orgMember.id },
    });

    ctx.body = {
      data: { message: 'Member removed successfully' },
    };
  },
};
