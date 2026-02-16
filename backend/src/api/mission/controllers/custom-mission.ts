export default {
  async assignUser(ctx) {
    const { id } = ctx.params;
    const { userId } = ctx.request.body;

    if (!userId) {
      return ctx.badRequest('userId is required');
    }

    const mission = await strapi.query('api::mission.mission').findOne({
      where: { documentId: id },
    });

    if (!mission) {
      return ctx.notFound('Mission not found');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: userId },
    });

    if (!user) {
      return ctx.notFound('User not found');
    }

    const existing = await strapi.query('api::mission-user.mission-user').findOne({
      where: {
        mission: mission.id,
        user: userId,
      },
    });

    if (existing) {
      return ctx.badRequest('User is already assigned to this mission');
    }

    const missionUser = await strapi.query('api::mission-user.mission-user').create({
      data: {
        mission: mission.id,
        user: userId,
        status: 'assigned',
      },
      populate: ['mission', 'user'],
    });

    ctx.body = {
      data: missionUser,
    };
  },

  async getParticipants(ctx) {
    const { id } = ctx.params;

    const mission = await strapi.query('api::mission.mission').findOne({
      where: { documentId: id },
    });

    if (!mission) {
      return ctx.notFound('Mission not found');
    }

    const missionUsers = await strapi.query('api::mission-user.mission-user').findMany({
      where: { mission: mission.id },
      populate: ['user', 'mission'],
    });

    ctx.body = {
      data: missionUsers,
    };
  },

  async removeParticipant(ctx) {
    const { id, userId } = ctx.params;

    const mission = await strapi.query('api::mission.mission').findOne({
      where: { documentId: id },
    });

    if (!mission) {
      return ctx.notFound('Mission not found');
    }

    const missionUser = await strapi.query('api::mission-user.mission-user').findOne({
      where: {
        mission: mission.id,
        user: parseInt(userId, 10),
      },
    });

    if (!missionUser) {
      return ctx.notFound('Assignment not found');
    }

    await strapi.query('api::mission-user.mission-user').delete({
      where: { id: missionUser.id },
    });

    ctx.body = {
      data: { message: 'Participant removed successfully' },
    };
  },

  async assignOrganization(ctx) {
    const { id } = ctx.params;
    const { organizationId } = ctx.request.body;

    if (!organizationId) {
      return ctx.badRequest('organizationId is required');
    }

    const mission = await strapi.query('api::mission.mission').findOne({
      where: { documentId: id },
    });

    if (!mission) {
      return ctx.notFound('Mission not found');
    }

    const org = await strapi.query('api::organization.organization').findOne({
      where: { documentId: organizationId },
    });

    if (!org) {
      return ctx.notFound('Organization not found');
    }

    const orgMembers = await strapi.query('api::organization-member.organization-member').findMany({
      where: { organization: org.id },
      populate: ['user'],
    });

    if (orgMembers.length === 0) {
      return ctx.badRequest('Organization has no members');
    }

    let addedCount = 0;
    const errors: string[] = [];

    for (const orgMember of orgMembers) {
      try {
        const existing = await strapi.query('api::mission-user.mission-user').findOne({
          where: {
            mission: mission.id,
            user: orgMember.user.id,
          },
        });

        if (!existing) {
          await strapi.query('api::mission-user.mission-user').create({
            data: {
              mission: mission.id,
              user: orgMember.user.id,
              status: 'assigned',
            },
          });
          addedCount++;
        }
      } catch (error) {
        errors.push(`Failed to assign user ${orgMember.user.id}: ${error.message}`);
      }
    }

    ctx.body = {
      data: {
        message: `${addedCount} user(s) assigned from organization "${org.name}"`,
        addedCount,
        totalMembers: orgMembers.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  },
};
