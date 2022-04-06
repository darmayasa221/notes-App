require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const authentications = require('./api/authentications');
const collaborations = require('./api/collaborations');
const notes = require('./api/notes');
const users = require('./api/users');
const AuthenticationsService = require('./service/postgres/AuthenticationsService');
const CollaborationsService = require('./service/postgres/CollaborationsService');
const NotesService = require('./service/postgres/NotesService');
const UsersService = require('./service/postgres/UsersService');
const TokenManager = require('./tokenize/tokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const CollaborationsValidator = require('./validator/collaborations');
const NotesValidator = require('./validator/notes');
const UsersValidator = require('./validator/users');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  await server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    }, {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
