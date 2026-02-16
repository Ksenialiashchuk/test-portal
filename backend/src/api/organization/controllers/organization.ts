import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::organization.organization',
  () => ({
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const userWithRole = await strapi
        .query('plugin::users-permissions.user')
        .findOne({
          where: { id: user.id },
          populate: ['role'],
        });

      const isAdmin = userWithRole?.role?.name === 'Admin';

      if (isAdmin) {
        const allOrgs = await strapi
          .query('api::organization.organization')
          .findMany({ populate: { organizationMembers: { populate: ['user'] } } });
        ctx.body = {
          data: allOrgs,
          meta: {
            pagination: {
              page: 1,
              pageSize: allOrgs.length,
              pageCount: 1,
              total: allOrgs.length,
            },
          },
        };
        return;
      }

      const userId = user.id;
      const orgMembers = await strapi
        .query('api::organization-member.organization-member')
        .findMany({
          where: { user: userId },
          populate: { organization: { populate: { organizationMembers: { populate: ['user'] } } } },
        });

      const merged = orgMembers.map((om) => om.organization).filter(Boolean);

      ctx.body = {
        data: merged,
        meta: {
          pagination: {
            page: 1,
            pageSize: merged.length,
            pageCount: 1,
            total: merged.length,
          },
        },
      };
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const userWithRole = await strapi
        .query('plugin::users-permissions.user')
        .findOne({
          where: { id: user.id },
          populate: ['role'],
        });

      const isAdmin = userWithRole?.role?.name === 'Admin';
      const documentId = ctx.params.documentId ?? ctx.params.id;
      const org = await strapi
        .query('api::organization.organization')
        .findOne({
          where: { documentId },
          populate: { organizationMembers: { populate: ['user'] } },
        });

      if (!org) {
        return ctx.notFound();
      }

      if (!isAdmin) {
        const orgMember = await strapi
          .query('api::organization-member.organization-member')
          .findOne({
            where: {
              organization: org.id,
              user: user.id,
            },
          });
        if (!orgMember) {
          return ctx.forbidden();
        }
      }

      ctx.body = { data: org };
    },
  })
);
