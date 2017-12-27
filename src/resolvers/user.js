import formatErrors from '../formatErrors';
import { tryLogin } from '../auth';
import requiresAuth from '../permissions';

export default {
  User: {
    teams: async (parent, args, { models, user }) => {
      const res = await models.sequelize.query(
        'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?',
        {
          replacements: [user.id],
          model: models.Team
        }
      );
      console.log('dfsdfsdf', res);
      return res;
    }
  },
  Query: {
    allUsers: (parent, args, { models }) => models.User.findAll(),
    me: requiresAuth.createResolver((parent, args, { models, user }) =>
      models.User.findOne({ where: { id: user.id } })
    )
  },
  Mutation: {
    login: (parent, { email, password }, { models, jwtSecret1, jwtSecret2 }) =>
      tryLogin(email, password, models, jwtSecret1, jwtSecret2),
    register: async (parent, args, { models }) => {
      try {
        const user = await models.User.create(args);

        return {
          ok: true,
          user
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models)
        };
      }
    }
  }
};
