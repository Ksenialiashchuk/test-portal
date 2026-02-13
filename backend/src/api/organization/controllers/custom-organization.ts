export default {
  async getMembers(ctx) {
    const { id } = ctx.params;

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: id },
      populate: ['members', 'manager'],
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    ctx.body = {
      data: {
        members: org.members || [],
        manager: org.manager || null,
      },
    };
  },

  async addMember(ctx) {
    const { id } = ctx.params;
    const { userId } = ctx.request.body;

    if (!userId) {
      return ctx.badRequest('userId is required');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
    });

    if (!user) {
      return ctx.notFound('User not found');
    }

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: id },
      populate: ['members'],
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    const existingMemberIds = (org.members || []).map((m) => m.id);
    if (existingMemberIds.includes(userId)) {
      return ctx.badRequest('User is already a member of this organization');
    }

    const updatedOrg = await strapi.query('api::organization.organization').update({
      where: { documentId: id },
      data: {
        members: [...existingMemberIds, userId],
      },
      populate: ['members', 'manager'],
    });

    ctx.body = {
      data: updatedOrg,
    };
  },

  async removeMember(ctx) {
    const { id, userId } = ctx.params;

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: id },
      populate: ['members'],
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    const existingMemberIds = (org.members || []).map((m) => m.id);
    const filteredIds = existingMemberIds.filter((mId) => mId !== parseInt(userId, 10));

    const updatedOrg = await strapi.query('api::organization.organization').update({
      where: { documentId: id },
      data: {
        members: filteredIds,
      },
      populate: ['members', 'manager'],
    });

    ctx.body = {
      data: updatedOrg,
    };
  },
};
