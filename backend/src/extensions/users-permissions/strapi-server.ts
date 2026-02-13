function sanitizeUser(user: Record<string, unknown>) {
  const { password, resetPasswordToken, confirmationToken, ...safe } = user;
  return safe;
}

export default (plugin) => {
  plugin.controllers.user.me = async (ctx) => {
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

    if (!userWithRole) {
      return ctx.notFound();
    }

    ctx.body = sanitizeUser(userWithRole);
  };

  plugin.controllers.user.find = async (ctx) => {
    const users = await strapi
      .query('plugin::users-permissions.user')
      .findMany({
        populate: ['role'],
      });

    ctx.body = users.map(sanitizeUser);
  };

  plugin.controllers.user.findOne = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id },
        populate: ['role'],
      });

    if (!user) {
      return ctx.notFound();
    }

    ctx.body = sanitizeUser(user);
  };

  return plugin;
};
