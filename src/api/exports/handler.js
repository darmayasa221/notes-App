const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
  }

  async postExportNotesHandler({ payload, auth }, h) {
    try {
      this._validator.validatorExportNotesPayload(payload);
      const message = {
        userId: auth.credentials.id,
        targetEmail: payload.targetEmail
      };

      await this._service.sendMessage('export:notes', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        });
        response.status(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: error.message
      });
      response.status(500);
      return response;
    }
  }
}

module.exports = ExportsHandler;
