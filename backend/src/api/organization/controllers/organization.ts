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
          .findMany({ populate: ['manager', 'members'] });
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
      const managerOrgs = await strapi
        .query('api::organization.organization')
        .findMany({
          where: { manager: userId },
          populate: ['manager', 'members'],
        });
      
      const memberOrgs = await strapi
        .query('api::organization.organization')
        .findMany({
          where: { members: userId },
          populate: ['manager', 'members'],
        });

      const seen = new Set(managerOrgs.map((o) => o.documentId));
      const merged = [...managerOrgs];
      for (const o of memberOrgs) {
        if (!seen.has(o.documentId)) {
          seen.add(o.documentId);
          merged.push(o);
        }
      }

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
          populate: ['manager', 'members'],
        });

      if (!org) {
        return ctx.notFound();
      }

      if (!isAdmin) {
        const isManager = org.manager?.id === user.id;
        const isMember = (org.members || []).some((m) => m.id === user.id);
        if (!isManager && !isMember) {
          return ctx.forbidden();
        }
      }

      ctx.body = { data: org };
    },
  })
);
