import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::mission.mission',
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
        const allMissions = await strapi
          .query('api::mission.mission')
          .findMany({ populate: ['tasks'] });
        ctx.body = {
          data: allMissions,
          meta: {
            pagination: {
              page: 1,
              pageSize: allMissions.length,
              pageCount: 1,
              total: allMissions.length,
            },
          },
        };
        return;
      }

      const isManager = userWithRole?.role?.name === 'Manager';

      if (isManager) {
        const managedOrgs = await strapi
          .query('api::organization.organization')
          .findMany({
            where: { manager: user.id },
            populate: ['members'],
          });

        const orgMemberIds = new Set<number>();
        orgMemberIds.add(user.id);
        for (const org of managedOrgs) {
          const members = (org as { members?: Array<{ id: number }> }).members || [];
          for (const member of members) {
            orgMemberIds.add(member.id);
          }
        }

        const missionUsers = await strapi
          .query('api::mission-user.mission-user')
          .findMany({
            where: { user: { $in: Array.from(orgMemberIds) } },
            populate: {
              mission: {
                populate: ['tasks'],
              },
            },
          });

        const seen = new Set<string>();
        const missions: unknown[] = [];
        for (const mu of missionUsers) {
          const mission = (mu as { mission?: { documentId: string } }).mission;
          if (mission?.documentId && !seen.has(mission.documentId)) {
            seen.add(mission.documentId);
            missions.push(mission);
          }
        }

        ctx.body = {
          data: missions,
          meta: {
            pagination: {
              page: 1,
              pageSize: missions.length,
              pageCount: 1,
              total: missions.length,
            },
          },
        };
        return;
      }

      const missionUsers = await strapi
        .query('api::mission-user.mission-user')
        .findMany({
          where: { user: user.id },
          populate: {
            mission: {
              populate: ['tasks'],
            },
          },
        });
      const seen = new Set<string>();
      const missions: unknown[] = [];
      for (const mu of missionUsers) {
        const mission = (mu as { mission?: { documentId: string } }).mission;
        if (mission?.documentId && !seen.has(mission.documentId)) {
          seen.add(mission.documentId);
          missions.push(mission);
        }
      }

      ctx.body = {
        data: missions,
        meta: {
          pagination: {
            page: 1,
            pageSize: missions.length,
            pageCount: 1,
            total: missions.length,
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
      const mission = await strapi
        .query('api::mission.mission')
        .findOne({
          where: { documentId },
          populate: ['tasks'],
        });

      if (!mission) {
        return ctx.notFound();
      }

      if (!isAdmin) {
        const isManager = userWithRole?.role?.name === 'Manager';

        if (isManager) {
          const managedOrgs = await strapi
            .query('api::organization.organization')
            .findMany({
              where: { manager: user.id },
              populate: ['members'],
            });

          const orgMemberIds = new Set<number>();
          orgMemberIds.add(user.id);
          for (const org of managedOrgs) {
            const members = (org as { members?: Array<{ id: number }> }).members || [];
            for (const member of members) {
              orgMemberIds.add(member.id);
            }
          }

          const assignment = await strapi
            .query('api::mission-user.mission-user')
            .findOne({
              where: {
                mission: (mission as { id: number }).id,
                user: { $in: Array.from(orgMemberIds) },
              },
            });

          if (!assignment) {
            return ctx.forbidden();
          }
        } else {
          const assignment = await strapi
            .query('api::mission-user.mission-user')
            .findOne({
              where: {
                mission: (mission as { id: number }).id,
                user: user.id,
              },
            });
          if (!assignment) {
            return ctx.forbidden();
          }
        }
      }

      ctx.body = { data: mission };
    },
  })
);
